from sqlalchemy import Column, Integer, String, Date, UniqueConstraint
from app.database import Base

class PublicHoliday(Base):
    __tablename__ = "public_holidays"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)
    name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
