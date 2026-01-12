from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, VacationType, PublicHoliday, VacationBalance
from passlib.context import CryptContext
from datetime import date

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/seed-database")
async def seed_database(db: AsyncSession = Depends(get_db)):
    """
    Seed the database with initial data.
    This endpoint can only be run once - it checks if data already exists.
    """
    # Check if already seeded
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if user:
        raise HTTPException(status_code=400, detail="Database already seeded")

    # Vacation Types
    types = [
        VacationType(name="Vacation", is_paid=True, default_days=20, color="#22C55E"),
        VacationType(name="Sick Leave", is_paid=True, default_days=10, color="#EF4444"),
        VacationType(name="Personal Day", is_paid=True, default_days=3, color="#3B82F6"),
        VacationType(name="Unpaid Leave", is_paid=False, default_days=0, color="#6B7280"),
    ]
    db.add_all(types)
    await db.flush()

    # Users
    # Admin
    admin = User(
        email="admin@company.com",
        password_hash=get_password_hash("password123"),
        name="Admin User",
        role="admin",
        is_active=True
    )
    db.add(admin)

    # Manager
    manager = User(
        email="manager@company.com",
        password_hash=get_password_hash("password123"),
        name="John Manager",
        role="manager",
        is_active=True
    )
    db.add(manager)
    await db.flush()

    # Employees
    employees = []
    for i in range(1, 3):
        emp = User(
            email=f"employee{i}@company.com",
            password_hash=get_password_hash("password123"),
            name=f"Employee {i}",
            role="employee",
            manager_id=manager.id,
            is_active=True
        )
        employees.append(emp)
    db.add_all(employees)
    await db.flush()

    # Balances for 2025
    all_users = [admin, manager] + employees
    for user in all_users:
        for vt in types:
            balance = VacationBalance(
                user_id=user.id,
                type_id=vt.id,
                year=2025,
                total_days=vt.default_days,
                used_days=0
            )
            db.add(balance)

    # Public Holidays
    holidays_data = [
        (date(2025, 1, 1), "New Year's Day"),
        (date(2025, 1, 6), "Epiphany"),
        (date(2025, 4, 20), "Easter Sunday"),
        (date(2025, 4, 21), "Easter Monday"),
        (date(2025, 5, 1), "Labour Day"),
        (date(2025, 6, 8), "Pentecost"),
        (date(2025, 6, 28), "Constitution Day"),
        (date(2025, 8, 24), "Independence Day"),
        (date(2025, 12, 25), "Christmas Day"),
    ]

    for d, n in holidays_data:
        db.add(PublicHoliday(date=d, name=n, year=2025))

    await db.commit()

    return {
        "status": "success",
        "message": "Database seeded successfully",
        "users_created": len(all_users),
        "vacation_types_created": len(types),
        "holidays_created": len(holidays_data)
    }
