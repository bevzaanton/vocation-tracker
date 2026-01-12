from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime


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
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.approvers))
        .offset(skip)
        .limit(limit)
    )
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
        manager_id=user_in.manager_id,
        start_date=user_in.start_date
    )
    
    if user_in.approver_ids:
        result = await db.execute(select(models.User).where(models.User.id.in_(user_in.approver_ids)))
        approvers = result.scalars().all()
        user.approvers = list(approvers)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Initialize Vacation Balances
    if user.start_date:
        result = await db.execute(select(models.VacationType).where(models.VacationType.is_active == True))
        vacation_types = result.scalars().all()
        
        current_year = datetime.utcnow().year
        
        for vt in vacation_types:
            total_days = vt.default_days
            
            # Prorate if joined this year
            if user.start_date.year == current_year:
                months_remaining = 12 - user.start_date.month + 1
                if months_remaining < 0: 
                    months_remaining = 0
                total_days = round((months_remaining / 12) * vt.default_days)
            elif user.start_date.year > current_year:
                 total_days = 0 
           
            balance = models.VacationBalance(
                user_id=user.id,
                type_id=vt.id,
                year=current_year,
                total_days=total_days,
                used_days=0
            )
            db.add(balance)
        await db.commit()

    # Fetch user again with loaded relationships for serialization
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.approvers))
        .where(models.User.id == user.id)
    )
    user = result.scalars().first()
    return user

@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Update a user.
    """
    result = await db.execute(select(models.User).options(selectinload(models.User.approvers)).where(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )

    update_data = user_in.dict(exclude_unset=True)
    if "approver_ids" in update_data:
        approver_ids = update_data.pop("approver_ids")
        if approver_ids is not None:
             result = await db.execute(select(models.User).where(models.User.id.in_(approver_ids)))
             approvers = result.scalars().all()
             user.approvers = list(approvers)
        else:
             user.approvers = []
        
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Fetch user again with loaded relationships for serialization
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.approvers))
        .where(models.User.id == user.id)
    )
    user = result.scalars().first()
    return user

@router.delete("/{user_id}", response_model=schemas.User)
async def delete_user(
    *,
    db: AsyncSession = Depends(get_db),
    user_id: int,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Soft delete a user.
    """
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    user.is_active = False
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Fetch user again with loaded relationships for serialization
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.approvers))
        .where(models.User.id == user.id)
    )
    user = result.scalars().first()
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
