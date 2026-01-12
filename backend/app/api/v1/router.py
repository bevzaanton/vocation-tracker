from fastapi import APIRouter

from app.api.v1 import auth, users, vacation_types, holidays, requests, calendar

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(vacation_types.router, prefix="/vacation-types", tags=["vacation-types"])
api_router.include_router(holidays.router, prefix="/holidays", tags=["holidays"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
