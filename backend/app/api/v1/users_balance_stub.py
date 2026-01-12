from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.api import deps
from app.database import get_db

# We need to add this to the users router or creates a balances router
# The spec said /users/{id}/balance

# Let's add it to users.py
