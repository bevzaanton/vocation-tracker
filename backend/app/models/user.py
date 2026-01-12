from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DefaultClause, BigInteger, Table
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy import DateTime, Date
from datetime import datetime

user_approvers = Table(
    "user_approvers",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("approver_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="employee", nullable=False) # employee, manager, admin
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    telegram_id = Column(BigInteger, unique=True, nullable=True)
    start_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    manager = relationship("User", remote_side=[id], backref="direct_reports")
    vacation_requests = relationship("VacationRequest", back_populates="user", foreign_keys="VacationRequest.user_id")
    reviewed_requests = relationship("VacationRequest", back_populates="reviewer", foreign_keys="VacationRequest.reviewer_id")
    balances = relationship("VacationBalance", back_populates="user")
    
    approvers = relationship(
        "User",
        secondary=user_approvers,
        primaryjoin=id==user_approvers.c.user_id,
        secondaryjoin=id==user_approvers.c.approver_id,
        backref="approving_for",
        lazy="selectin"
    )
