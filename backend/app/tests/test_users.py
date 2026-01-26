"""Tests for user management endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app import models


@pytest.mark.anyio
async def test_list_users_as_admin(admin_client: AsyncClient, normal_user: models.User, admin_user: models.User):
    """Test admin can list all users."""
    response = await admin_client.get("/api/v1/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2  # At least admin and normal user
    emails = [user["email"] for user in data]
    assert normal_user.email in emails
    assert admin_user.email in emails


@pytest.mark.anyio
async def test_list_users_as_employee(auth_client: AsyncClient):
    """Test regular employee cannot list all users."""
    response = await auth_client.get("/api/v1/users/")
    assert response.status_code == 400


@pytest.mark.anyio
async def test_create_user_as_admin(admin_client: AsyncClient, db):
    """Test admin can create new users."""
    user_data = {
        "email": "newuser@example.com",
        "name": "New User",
        "password": "newpassword123",
        "role": "employee"
    }
    response = await admin_client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert data["role"] == user_data["role"]
    assert "password" not in data


@pytest.mark.anyio
async def test_create_user_as_employee(auth_client: AsyncClient):
    """Test regular employee cannot create users."""
    user_data = {
        "email": "unauthorized@example.com",
        "name": "Unauthorized",
        "password": "password",
        "role": "employee"
    }
    response = await auth_client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_create_user_duplicate_email(admin_client: AsyncClient, normal_user: models.User):
    """Test cannot create user with duplicate email."""
    user_data = {
        "email": normal_user.email,
        "name": "Duplicate",
        "password": "password",
        "role": "employee"
    }
    response = await admin_client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_get_user_by_id(admin_client: AsyncClient, normal_user: models.User):
    """Test get specific user by ID via list endpoint."""
    response = await admin_client.get("/api/v1/users/")
    assert response.status_code == 200
    data = response.json()
    user = next((u for u in data if u["id"] == normal_user.id), None)
    assert user is not None
    assert user["email"] == normal_user.email


@pytest.mark.anyio
async def test_get_nonexistent_user(admin_client: AsyncClient):
    """Test get non-existent user via list endpoint."""
    response = await admin_client.get("/api/v1/users/")
    assert response.status_code == 200
    data = response.json()
    user = next((u for u in data if u["id"] == 99999), None)
    assert user is None


@pytest.mark.anyio
async def test_update_user(admin_client: AsyncClient, normal_user: models.User):
    """Test update user information."""
    update_data = {
        "name": "Updated Name",
        "role": "manager"
    }
    response = await admin_client.put(f"/api/v1/users/{normal_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["role"] == "manager"


@pytest.mark.anyio
async def test_delete_user(admin_client: AsyncClient, db):
    """Test delete user."""
    # Create a user to delete
    user = models.User(
        email="todelete@example.com",
        password_hash="hashed",
        name="To Delete",
        role="employee"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    response = await admin_client.delete(f"/api/v1/users/{user.id}")
    assert response.status_code == 200

    # Verify user is soft-deleted (is_active = False)
    result = await db.execute(select(models.User).where(models.User.id == user.id))
    deleted_user = result.scalar_one_or_none()
    assert deleted_user is not None
    assert deleted_user.is_active is False


@pytest.mark.anyio
async def test_get_user_balances(auth_client: AsyncClient, db, normal_user: models.User):
    """Test get user vacation balances."""
    # Create vacation type and balance
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    balance = models.VacationBalance(
        user_id=normal_user.id,
        type_id=vtype.id,
        total_days=20,
        used_days=5,
        year=2026
    )
    db.add(balance)
    await db.commit()

    response = await auth_client.get(f"/api/v1/users/{normal_user.id}/balance?year=2026")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    balance_item = next((b for b in data if b["type_id"] == vtype.id), None)
    assert balance_item is not None
    assert balance_item["total_days"] == 20
    assert balance_item["used_days"] == 5
    assert balance_item["year"] == 2026


@pytest.mark.anyio
async def test_adjust_balance_as_admin(admin_client: AsyncClient, db, normal_user: models.User):
    """Test admin can adjust user vacation balance."""
    # Create vacation type
    vtype = models.VacationType(name="Vacation", color="#3B82F6", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    # Create balance
    balance = models.VacationBalance(
        user_id=normal_user.id,
        type_id=vtype.id,
        total_days=20,
        used_days=5,
        year=2025
    )
    db.add(balance)
    await db.commit()

    # Adjust balance
    adjustment_data = {
        "type_id": vtype.id,
        "year": 2025,
        "total_days": 25,
        "used_days": 3,
        "reason": "Annual adjustment"
    }
    response = await admin_client.put(
        f"/api/v1/users/{normal_user.id}/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_days"] == 25
    assert data["used_days"] == 3
    assert data["remaining_days"] == 22
    assert data["reason"] == "Annual adjustment"


@pytest.mark.anyio
async def test_adjust_balance_as_employee_forbidden(auth_client: AsyncClient, db, normal_user: models.User):
    """Test regular employee cannot adjust balances."""
    # Create vacation type
    vtype = models.VacationType(name="Sick Leave", color="#EF4444", default_days=10)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    adjustment_data = {
        "type_id": vtype.id,
        "year": 2025,
        "total_days": 15
    }
    response = await auth_client.put(
        f"/api/v1/users/{normal_user.id}/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 400  # Not admin


@pytest.mark.anyio
async def test_adjust_balance_creates_new_record(admin_client: AsyncClient, db, normal_user: models.User):
    """Test balance adjustment creates new record if it doesn't exist."""
    # Create vacation type
    vtype = models.VacationType(name="Personal Day", color="#10B981", default_days=3)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    # Adjust balance for a year where no balance exists
    adjustment_data = {
        "type_id": vtype.id,
        "year": 2026,
        "total_days": 5,
        "used_days": 1
    }
    response = await admin_client.put(
        f"/api/v1/users/{normal_user.id}/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_days"] == 5
    assert data["used_days"] == 1
    assert data["remaining_days"] == 4
    assert data["year"] == 2026


@pytest.mark.anyio
async def test_adjust_balance_user_not_found(admin_client: AsyncClient, db):
    """Test balance adjustment returns 404 for non-existent user."""
    # Create vacation type
    vtype = models.VacationType(name="Test Type", color="#000000", default_days=5)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    adjustment_data = {
        "type_id": vtype.id,
        "year": 2025,
        "total_days": 10
    }
    response = await admin_client.put(
        "/api/v1/users/99999/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 404


@pytest.mark.anyio
async def test_adjust_balance_vacation_type_not_found(admin_client: AsyncClient, normal_user: models.User):
    """Test balance adjustment returns 404 for non-existent vacation type."""
    adjustment_data = {
        "type_id": 99999,
        "year": 2025,
        "total_days": 10
    }
    response = await admin_client.put(
        f"/api/v1/users/{normal_user.id}/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 404


@pytest.mark.anyio
async def test_adjust_balance_no_values_provided(admin_client: AsyncClient, db, normal_user: models.User):
    """Test balance adjustment requires at least total_days or used_days."""
    # Create vacation type
    vtype = models.VacationType(name="Leave Type", color="#F59E0B", default_days=10)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    adjustment_data = {
        "type_id": vtype.id,
        "year": 2025
        # No total_days or used_days provided
    }
    response = await admin_client.put(
        f"/api/v1/users/{normal_user.id}/balance/adjust",
        json=adjustment_data
    )
    assert response.status_code == 400
