"""Tests for vacation request endpoints."""
import pytest
from datetime import date
from httpx import AsyncClient
from sqlalchemy import select
from app import models


@pytest.fixture
async def vacation_type(db):
    """Create a vacation type for testing."""
    vtype = models.VacationType(
        name="Annual Leave",
        color="blue",
        default_days=20,
        is_paid=True
    )
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)
    return vtype


@pytest.fixture
async def manager_user(db):
    """Create a manager user for testing."""
    from app.core import security
    manager = models.User(
        email="manager@example.com",
        password_hash=security.get_password_hash("managerpass"),
        name="Manager User",
        role="manager",
        is_active=True
    )
    db.add(manager)
    await db.commit()
    await db.refresh(manager)
    return manager


@pytest.mark.anyio
async def test_create_vacation_request(auth_client: AsyncClient, vacation_type: models.VacationType, normal_user: models.User):
    """Test creating a vacation request."""
    request_data = {
        "type_id": vacation_type.id,
        "start_date": "2026-06-01",
        "end_date": "2026-06-05",
        "comment": "Summer vacation"
    }

    response = await auth_client.post("/api/v1/requests/", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "pending"
    assert data["type_name"] == "Annual Leave"
    assert data["business_days"] == 5
    assert data["comment"] == "Summer vacation"


@pytest.mark.anyio
async def test_create_request_invalid_dates(auth_client: AsyncClient, vacation_type: models.VacationType):
    """Test creating request with end date before start date fails."""
    request_data = {
        "type_id": vacation_type.id,
        "start_date": "2026-06-10",
        "end_date": "2026-06-05",
        "comment": "Invalid dates"
    }

    response = await auth_client.post("/api/v1/requests/", json=request_data)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_list_my_requests(auth_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test listing user's own requests."""
    # Create some requests
    req1 = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    req2 = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 3),
        business_days=3,
        status="approved"
    )
    db.add_all([req1, req2])
    await db.commit()

    response = await auth_client.get("/api/v1/requests/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.anyio
async def test_get_request_by_id(auth_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test getting specific request by ID via list endpoint."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    # Get via list endpoint and find the request
    response = await auth_client.get("/api/v1/requests/")
    assert response.status_code == 200
    data = response.json()
    request_item = next((r for r in data if r["id"] == req.id), None)
    assert request_item is not None
    assert request_item["status"] == "pending"


@pytest.mark.anyio
async def test_cannot_access_other_user_request(auth_client: AsyncClient, db, vacation_type: models.VacationType):
    """Test user cannot see another user's request in the list."""
    # Create another user and their request
    from app.core import security
    other_user = models.User(
        email="other@example.com",
        password_hash=security.get_password_hash("pass"),
        name="Other User",
        role="employee"
    )
    db.add(other_user)
    await db.commit()
    await db.refresh(other_user)

    req = models.VacationRequest(
        user_id=other_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    # Employee should only see their own requests
    response = await auth_client.get("/api/v1/requests/")
    assert response.status_code == 200
    data = response.json()
    # Verify the other user's request is not in the list
    request_ids = [r["id"] for r in data]
    assert req.id not in request_ids


@pytest.mark.anyio
async def test_approve_request_as_admin(admin_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test admin can approve vacation requests."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    response = await admin_client.post(
        f"/api/v1/requests/{req.id}/approve",
        json={"comment": "Approved"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"


@pytest.mark.anyio
async def test_reject_request(admin_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test rejecting vacation request."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    response = await admin_client.post(
        f"/api/v1/requests/{req.id}/reject",
        json={"comment": "Not enough coverage"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"


@pytest.mark.anyio
async def test_employee_cannot_approve(auth_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test regular employee cannot approve requests."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    response = await auth_client.post(
        f"/api/v1/requests/{req.id}/approve",
        json={"comment": "Trying to approve"}
    )
    assert response.status_code == 400


@pytest.mark.anyio
async def test_cancel_pending_request(auth_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test user can cancel their own pending request."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="pending"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    response = await auth_client.post(f"/api/v1/requests/{req.id}/cancel")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"


@pytest.mark.anyio
async def test_can_cancel_approved_request(auth_client: AsyncClient, db, normal_user: models.User, vacation_type: models.VacationType):
    """Test user can cancel already approved request (it reverts balance)."""
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vacation_type.id,
        start_date=date(2026, 7, 1),
        end_date=date(2026, 7, 5),
        business_days=5,
        status="approved"
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    response = await auth_client.post(f"/api/v1/requests/{req.id}/cancel")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
