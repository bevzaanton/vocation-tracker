import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.anyio
async def test_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/vacation-types/")
    # It might fail if not authenticated? Accessing vacation types is public?
    # Let's check router.
    # Open /backend/app/api/v1/vacation_types.py
    # db: AsyncSession = Depends(get_db), current_user: models.User = Depends(deps.get_current_active_user)
    # It requires auth.
    
    # So we should expect 401.
    assert response.status_code == 401
