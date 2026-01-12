from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import models, schemas
from app.api import deps
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.VacationType])
async def read_vacation_types(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve vacation types.
    """
    result = await db.execute(select(models.VacationType).where(models.VacationType.is_active == True))
    return result.scalars().all()

@router.post("/", response_model=schemas.VacationType)
async def create_vacation_type(
    *,
    db: AsyncSession = Depends(get_db),
    type_in: schemas.VacationTypeCreate,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new vacation type. Only for Admin.
    """
    vacation_type = models.VacationType(**type_in.model_dump())
    db.add(vacation_type)
    await db.commit()
    await db.refresh(vacation_type)
    return vacation_type
