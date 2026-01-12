from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: str = None
    is_active: bool = True
    role: str = "employee"

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    manager_id: Optional[int] = None

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    manager_id: Optional[int] = None

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
