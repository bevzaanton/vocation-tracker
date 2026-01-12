from pydantic import BaseModel
from datetime import date

class CalendarEntry(BaseModel):
    user_id: int
    user_name: str
    date: date
    type_name: str
    type_color: str
    status: str
