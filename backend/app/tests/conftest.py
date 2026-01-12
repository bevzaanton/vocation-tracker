import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.core.config import settings
from app import models
from app.core import security

# Use the same database for tests but with a different schema or just clean it up
# For simplicity, we use the same DB but wrap each test in a transaction
DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="session", autouse=True)
async def db_engine():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    # In a real environment we might want to keep the DB, but for tests we can clean up
    # However, dropping all might be risky if we share the DB with dev
    # For now let's just make sure we are in a clean state if possible or just rely on transactions

@pytest.fixture
async def db():
    async with engine.connect() as conn:
        transaction = await conn.begin()
        async with AsyncSession(bind=conn, expire_on_commit=False) as session:
            yield session
            await session.rollback()
        await transaction.rollback()

@pytest.fixture
async def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
async def normal_user(db: AsyncSession):
    user_in = models.User(
        email="testuser@example.com",
        password_hash=security.get_password_hash("testpassword"),
        name="Test User",
        role="employee",
        is_active=True
    )
    db.add(user_in)
    await db.commit()
    await db.refresh(user_in)
    return user_in

@pytest.fixture
async def admin_user(db: AsyncSession):
    user_in = models.User(
        email="admin@example.com",
        password_hash=security.get_password_hash("adminpassword"),
        name="Admin User",
        role="admin",
        is_active=True
    )
    db.add(user_in)
    await db.commit()
    await db.refresh(user_in)
    return user_in

@pytest.fixture
async def normal_user_token(normal_user):
    return security.create_access_token(normal_user.id)

@pytest.fixture
async def admin_user_token(admin_user):
    return security.create_access_token(admin_user.id)

@pytest.fixture
async def auth_client(client, normal_user_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {normal_user_token}"
    }
    return client

@pytest.fixture
async def admin_client(client, admin_user_token):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {admin_user_token}"
    }
    return client
