from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class VacationType(Base):
    __tablename__ = "vacation_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_paid = Column(Boolean, default=True)
    default_days = Column(Integer, default=0)
    color = Column(String, default="#3B82F6")
    is_active = Column(Boolean, default=True)

class VacationBalance(Base):
    __tablename__ = "vacation_balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type_id = Column(Integer, ForeignKey("vacation_types.id"), nullable=False)
    year = Column(Integer, nullable=False)
    total_days = Column(Integer, default=0)
    used_days = Column(Integer, default=0)

    user = relationship("User", back_populates="balances")
    vacation_type = relationship("VacationType")

    __table_args__ = (UniqueConstraint('user_id', 'type_id', 'year', name='uq_user_type_year'),)

class VacationRequest(Base):
    __tablename__ = "vacation_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type_id = Column(Integer, ForeignKey("vacation_types.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    business_days = Column(Integer, nullable=False)
    status = Column(String, default="pending", index=True) # pending, approved, rejected, cancelled
    comment = Column(Text, nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewer_comment = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="vacation_requests")
    vacation_type = relationship("VacationType")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviewed_requests")
