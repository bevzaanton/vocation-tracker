from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import models, schemas
from app.api import deps
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.PublicHoliday])
async def read_public_holidays(
    db: AsyncSession = Depends(get_db),
    year: int = 2025,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve public holidays.
    """
    result = await db.execute(select(models.PublicHoliday).where(models.PublicHoliday.year == year))
    return result.scalars().all()

@router.post("/", response_model=schemas.PublicHoliday)
async def create_public_holiday(
    *,
    db: AsyncSession = Depends(get_db),
    holiday_in: schemas.PublicHolidayCreate,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new public holiday. Only for Admin.
    """
    # Check for existing holiday on that date
    result = await db.execute(select(models.PublicHoliday).where(models.PublicHoliday.date == holiday_in.date))
    if result.scalars().first():
         raise HTTPException(
            status_code=400,
            detail="Public holiday already exists for this date.",
        )

    holiday = models.PublicHoliday(**holiday_in.model_dump())
    db.add(holiday)
    await db.commit()
    await db.refresh(holiday)
    return holiday
