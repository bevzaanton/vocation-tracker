"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient
from app import models
from app.core import security


@pytest.mark.anyio
async def test_login_success(client: AsyncClient, normal_user: models.User):
    """Test successful login with valid credentials."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": normal_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_login_wrong_password(client: AsyncClient, normal_user: models.User):
    """Test login fails with incorrect password."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": normal_user.email, "password": "wrongpassword"}
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test login fails with non-existent user."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "nonexistent@example.com", "password": "password"}
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_get_me_authenticated(auth_client: AsyncClient, normal_user: models.User):
    """Test authenticated user can get their info."""
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == normal_user.email
    assert data["id"] == normal_user.id
    assert data["name"] == normal_user.name
    assert data["role"] == normal_user.role


@pytest.mark.anyio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Test unauthenticated request to /me fails."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_get_me_invalid_token(client: AsyncClient):
    """Test request with invalid token fails."""
    client.headers = {"Authorization": "Bearer invalid_token"}
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403


@pytest.mark.anyio
async def test_login_inactive_user(client: AsyncClient, db):
    """Test login fails for inactive user."""
    inactive_user = models.User(
        email="inactive@example.com",
        password_hash=security.get_password_hash("password"),
        name="Inactive User",
        role="employee",
        is_active=False
    )
    db.add(inactive_user)
    await db.commit()

    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "inactive@example.com", "password": "password"}
    )
    assert response.status_code == 400
