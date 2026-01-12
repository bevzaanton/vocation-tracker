from typing import Any, List, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.api import deps
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.CalendarEntry])
async def read_calendar(
    db: AsyncSession = Depends(get_db),
    start_date: date = Query(...),
    end_date: date = Query(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve calendar entries.
    """
    # Find requests that overlap with the range and are approved
    query = select(models.VacationRequest).options(
        selectinload(models.VacationRequest.vacation_type),
        selectinload(models.VacationRequest.user)
    ).where(
        and_(
            models.VacationRequest.status == "approved",
            models.VacationRequest.start_date <= end_date,
            models.VacationRequest.end_date >= start_date
        )
    )
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    calendar_entries = []
    
    # Expand requests into daily entries for simpler frontend rendering (optional, but easier)
    # Or just return the ranges. The requirement said "CalendarEntry" which looked like single events.
    # The schema I defined earlier was singular "date". Let's expand.
    
    from datetime import timedelta
    
    for r in requests:
        # Loop through days of the request
        current = r.start_date
        while current <= r.end_date:
            if current >= start_date and current <= end_date:
                calendar_entries.append(schemas.CalendarEntry(
                    user_id=r.user_id,
                    user_name=r.user.name,
                    date=current,
                    type_name=r.vacation_type.name,
                    type_color=r.vacation_type.color,
                    status=r.status
                ))
            current += timedelta(days=1)
            
    return calendar_entries
