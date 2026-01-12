"""Tests for public holiday endpoints."""
import pytest
from datetime import date
from httpx import AsyncClient
from app import models


@pytest.mark.anyio
async def test_list_public_holidays(auth_client: AsyncClient, db):
    """Test listing public holidays."""
    # Create some holidays
    holiday1 = models.PublicHoliday(
        date=date(2026, 1, 1),
        name="New Year's Day",
        year=2026
    )
    holiday2 = models.PublicHoliday(
        date=date(2026, 12, 25),
        name="Christmas",
        year=2026
    )
    db.add_all([holiday1, holiday2])
    await db.commit()

    response = await auth_client.get("/api/v1/holidays/?year=2026")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    names = [h["name"] for h in data]
    assert "New Year's Day" in names
    assert "Christmas" in names


@pytest.mark.anyio
async def test_create_public_holiday_as_admin(admin_client: AsyncClient):
    """Test admin can create public holidays."""
    holiday_data = {
        "date": "2026-07-04",
        "name": "Independence Day",
        "year": 2026
    }

    response = await admin_client.post("/api/v1/holidays/", json=holiday_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Independence Day"
    assert data["date"] == "2026-07-04"


@pytest.mark.anyio
async def test_create_holiday_as_employee(auth_client: AsyncClient):
    """Test regular employee cannot create holidays."""
    holiday_data = {
        "date": "2026-07-04",
        "name": "Unauthorized Holiday",
        "year": 2026
    }

    response = await auth_client.post("/api/v1/holidays/", json=holiday_data)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_holidays_ordered_by_date(auth_client: AsyncClient, db):
    """Test holidays are returned in date order."""
    holiday1 = models.PublicHoliday(date=date(2026, 12, 25), name="Christmas", year=2026)
    holiday2 = models.PublicHoliday(date=date(2026, 1, 1), name="New Year", year=2026)
    holiday3 = models.PublicHoliday(date=date(2026, 7, 4), name="Independence Day", year=2026)
    db.add_all([holiday1, holiday2, holiday3])
    await db.commit()

    response = await auth_client.get("/api/v1/holidays/")
    assert response.status_code == 200
    data = response.json()

    # Verify they're in chronological order
    dates = [h["date"] for h in data]
    assert dates == sorted(dates)
