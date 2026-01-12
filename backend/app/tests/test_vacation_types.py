"""Tests for vacation type endpoints."""
import pytest
from httpx import AsyncClient
from app import models


@pytest.mark.anyio
async def test_list_vacation_types(auth_client: AsyncClient, db):
    """Test listing vacation types."""
    # Create some vacation types
    vtype1 = models.VacationType(name="Annual Leave", color="blue", default_days=20, is_paid=True)
    vtype2 = models.VacationType(name="Sick Leave", color="red", default_days=10, is_paid=True)
    db.add_all([vtype1, vtype2])
    await db.commit()

    response = await auth_client.get("/api/v1/vacation-types/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    names = [vt["name"] for vt in data]
    assert "Annual Leave" in names
    assert "Sick Leave" in names


@pytest.mark.anyio
async def test_create_vacation_type_as_admin(admin_client: AsyncClient):
    """Test admin can create vacation types."""
    vtype_data = {
        "name": "Parental Leave",
        "color": "green",
        "default_days": 30,
        "is_paid": True
    }

    response = await admin_client.post("/api/v1/vacation-types/", json=vtype_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Parental Leave"
    assert data["color"] == "green"
    assert data["default_days"] == 30
    assert data["is_paid"] is True


@pytest.mark.anyio
async def test_create_vacation_type_as_employee(auth_client: AsyncClient):
    """Test regular employee cannot create vacation types."""
    vtype_data = {
        "name": "Unauthorized Leave",
        "color": "purple",
        "default_days": 5,
        "is_paid": False
    }

    response = await auth_client.post("/api/v1/vacation-types/", json=vtype_data)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_unauthenticated_cannot_list_types(client: AsyncClient):
    """Test unauthenticated users cannot list vacation types."""
    response = await client.get("/api/v1/vacation-types/")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_vacation_type_defaults(admin_client: AsyncClient, db):
    """Test vacation type with default values."""
    vtype_data = {
        "name": "Unpaid Leave",
        "color": "gray"
    }

    response = await admin_client.post("/api/v1/vacation-types/", json=vtype_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Unpaid Leave"
    assert data["default_days"] == 0  # Default value
    assert data["is_paid"] is True  # Default value
