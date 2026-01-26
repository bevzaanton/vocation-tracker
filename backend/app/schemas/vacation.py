from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

# Vacation Types
class VacationTypeBase(BaseModel):
    name: str
    is_paid: bool = True
    default_days: int = 0
    color: str = "#3B82F6"
    is_active: bool = True

class VacationTypeCreate(VacationTypeBase):
    pass

class VacationTypeUpdate(BaseModel):
    name: Optional[str] = None
    is_paid: Optional[bool] = None
    default_days: Optional[int] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class VacationType(VacationTypeBase):
    id: int

    class Config:
        from_attributes = True

# Vacation Balances
class VacationBalanceBase(BaseModel):
    year: int
    total_days: int
    used_days: int = 0

class VacationBalance(VacationBalanceBase):
    id: int
    user_id: int
    type_id: int
    type: VacationType # We'll need to make sure this relationship loads or adjust the schema

    class Config:
        from_attributes = True

class VacationBalanceResponse(BaseModel):
    id: int
    type_id: int
    type_name: str
    year: int
    total_days: int
    used_days: int
    remaining_days: int

# Balance Adjustment (Admin only)
class BalanceAdjustment(BaseModel):
    type_id: int
    year: int = 2025
    total_days: Optional[int] = None
    used_days: Optional[int] = None
    reason: Optional[str] = None

class BalanceAdjustmentResponse(BaseModel):
    id: int
    user_id: int
    type_id: int
    type_name: str
    year: int
    total_days: int
    used_days: int
    remaining_days: int
    adjusted_by: str
    reason: Optional[str] = None

# Vacation Requests
class VacationRequestBase(BaseModel):
    type_id: int
    start_date: date
    end_date: date
    comment: Optional[str] = None

class VacationRequestCreate(VacationRequestBase):
    pass

class VacationRequestUpdate(BaseModel):
    pass # Status updates happen via specific endpoints

class VacationRequest(VacationRequestBase):
    id: int
    user_id: int
    business_days: int
    status: str
    created_at: datetime
    reviewer_id: Optional[int] = None
    reviewer_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    # We might want nested objects or flattening for the response
    # For now, let's define a flat response structure as per requirements
    
    class Config:
        from_attributes = True

class VacationRequestResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    type_id: int
    type_name: str
    type_color: str
    start_date: date
    end_date: date
    business_days: int
    status: str
    comment: Optional[str] = None
    reviewer_id: Optional[int] = None
    reviewer_name: Optional[str] = None
    reviewer_comment: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
