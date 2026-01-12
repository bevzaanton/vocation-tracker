from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import models, schemas
from app.api import deps
from app.core import security
from app.database import get_db
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
async def read_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Retrieve users. Only for Admin.
    """
    result = await db.execute(select(models.User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.post("/", response_model=schemas.User)
async def create_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Create new user. Only for Admin.
    """
    result = await db.execute(select(models.User).where(models.User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user = models.User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        is_active=user_in.is_active,
        manager_id=user_in.manager_id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/{user_id}/balance", response_model=List[schemas.VacationBalanceResponse])
async def read_user_balance(
    user_id: int,
    year: int = 2025,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get user vacation balance.
    """
    if current_user.id != user_id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    result = await db.execute(
        select(models.VacationBalance)
        .options(selectinload(models.VacationBalance.vacation_type))
        .where(models.VacationBalance.user_id == user_id)
        .where(models.VacationBalance.year == year)
    )
    balances = result.scalars().all()
    
    response = []
    for b in balances:
        response.append(schemas.VacationBalanceResponse(
            id=b.id,
            type_id=b.type_id,
            type_name=b.vacation_type.name,
            year=b.year,
            total_days=b.total_days,
            used_days=b.used_days,
            remaining_days=b.total_days - b.used_days
        ))
    return response
