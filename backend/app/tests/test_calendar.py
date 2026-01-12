"""Tests for calendar endpoints."""
import pytest
from datetime import date
from httpx import AsyncClient
from app import models


@pytest.mark.anyio
async def test_get_team_calendar(auth_client: AsyncClient, db, normal_user: models.User):
    """Test retrieving team calendar."""
    # Create vacation type
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    # Create approved vacation request
    req = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vtype.id,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 6, 5),
        business_days=5,
        status="approved"
    )
    db.add(req)
    await db.commit()

    response = await auth_client.get("/api/v1/calendar/?start_date=2026-06-01&end_date=2026-06-30")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_calendar_requires_dates(auth_client: AsyncClient):
    """Test calendar endpoint requires start and end dates."""
    response = await auth_client.get("/api/v1/calendar/")
    assert response.status_code == 422  # Validation error


@pytest.mark.anyio
async def test_calendar_filters_by_date_range(auth_client: AsyncClient, db, normal_user: models.User):
    """Test calendar only returns requests in date range."""
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    # Create requests in different months
    req1 = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vtype.id,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 6, 5),
        business_days=5,
        status="approved"
    )
    req2 = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vtype.id,
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 5),
        business_days=5,
        status="approved"
    )
    db.add_all([req1, req2])
    await db.commit()

    # Query only June
    response = await auth_client.get("/api/v1/calendar/?start_date=2026-06-01&end_date=2026-06-30")
    assert response.status_code == 200
    data = response.json()

    # Should only include June requests (calendar entries have 'date' field, not 'start_date')
    for item in data:
        entry_date = date.fromisoformat(item["date"])
        assert date(2026, 6, 1) <= entry_date <= date(2026, 6, 30)


@pytest.mark.anyio
async def test_calendar_only_shows_approved(auth_client: AsyncClient, db, normal_user: models.User):
    """Test calendar only shows approved requests."""
    vtype = models.VacationType(name="Annual Leave", color="blue", default_days=20)
    db.add(vtype)
    await db.commit()
    await db.refresh(vtype)

    # Create pending and approved requests
    req_pending = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vtype.id,
        start_date=date(2026, 6, 1),
        end_date=date(2026, 6, 3),
        business_days=3,
        status="pending"
    )
    req_approved = models.VacationRequest(
        user_id=normal_user.id,
        type_id=vtype.id,
        start_date=date(2026, 6, 10),
        end_date=date(2026, 6, 12),
        business_days=3,
        status="approved"
    )
    db.add_all([req_pending, req_approved])
    await db.commit()

    response = await auth_client.get("/api/v1/calendar/?start_date=2026-06-01&end_date=2026-06-30")
    assert response.status_code == 200
    data = response.json()

    # All returned requests should be approved
    for item in data:
        assert item["status"] == "approved"
