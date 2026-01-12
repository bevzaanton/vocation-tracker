from pydantic import BaseModel
from datetime import date
from typing import Optional

class PublicHolidayBase(BaseModel):
    date: date
    name: str
    year: int

class PublicHolidayCreate(PublicHolidayBase):
    pass

class PublicHoliday(PublicHolidayBase):
    id: int

    class Config:
        from_attributes = True
