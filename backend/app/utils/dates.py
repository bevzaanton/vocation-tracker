from datetime import date, timedelta
from typing import List, Set

def calculate_business_days(start_date: date, end_date: date, holidays: Set[date]) -> int:
    """
    Calculate working days between two dates (inclusive).
    Excludes weekends (Sat=5, Sun=6) and public holidays.
    """
    business_days = 0
    current = start_date
    while current <= end_date:
        # 0=Monday, ... 5=Saturday, 6=Sunday
        if current.weekday() < 5 and current not in holidays:
            business_days += 1
        current += timedelta(days=1)
    return business_days
