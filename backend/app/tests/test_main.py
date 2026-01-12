import pytest
from httpx import AsyncClient
from app.main import app
from app import models

@pytest.mark.anyio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.anyio
async def test_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

@pytest.mark.anyio
async def test_login(client: AsyncClient, normal_user: models.User):
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": normal_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.anyio
async def test_get_me(auth_client: AsyncClient, normal_user: models.User):
    response = await auth_client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == normal_user.email
    assert data["id"] == normal_user.id

@pytest.mark.anyio
async def test_get_vacation_types(auth_client: AsyncClient, db):
    # Create a vacation type first
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    
    response = await auth_client.get("/api/v1/vacation-types/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Find the one we created
    vtype_resp = next((item for item in data if item["name"] == "Annual Leave"), None)
    assert vtype_resp is not None
    assert vtype_resp["color"] == "blue"

@pytest.mark.anyio
async def test_create_vacation_request(auth_client: AsyncClient, db, normal_user):
    # Create a vacation type first
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)
    
    request_data = {
        "type_id": vtype.id,
        "start_date": "2026-06-01",
        "end_date": "2026-06-05",
        "comment": "Resting"
    }
    
    response = await auth_client.post("/api/v1/requests/", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["business_days"] == 5 # Mon-Fri
    assert data["type_name"] == "Annual Leave"
