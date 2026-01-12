from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

description = """
## Vacation Manager API

A comprehensive vacation and holiday management system with role-based access control.

### Features

* **Authentication** - OAuth2 with JWT tokens
* **User Management** - Create, update, and manage users with roles (employee, manager, admin)
* **Vacation Types** - Configure different types of leave (paid, unpaid, sick leave, etc.)
* **Vacation Requests** - Submit, approve, reject, and cancel vacation requests
* **Balance Tracking** - Automatic tracking of vacation balances with business day calculations
* **Public Holidays** - Manage public holidays that are excluded from vacation calculations
* **Calendar View** - Get a calendar view of approved vacation requests

### Roles

* **Employee** - Can view their own requests and balances, submit vacation requests
* **Manager** - Can approve/reject requests, view team calendars
* **Admin** - Full access to all resources including user and system management

### Authentication

All endpoints (except login) require authentication via Bearer token:
```
Authorization: Bearer <your_access_token>
```

Get your token by calling `POST /api/v1/auth/login` with your credentials.
"""

tags_metadata = [
    {
        "name": "auth",
        "description": "Authentication operations. Login and get current user information.",
    },
    {
        "name": "users",
        "description": "User management operations. Manage users, roles, and vacation balances.",
    },
    {
        "name": "vacation-types",
        "description": "Vacation type management. Configure different types of leave.",
    },
    {
        "name": "holidays",
        "description": "Public holiday management. Define holidays that don't count as vacation days.",
    },
    {
        "name": "requests",
        "description": "Vacation request lifecycle. Submit, approve, reject, and cancel requests.",
    },
    {
        "name": "calendar",
        "description": "Calendar views. Get approved vacation requests in calendar format.",
    },
]

app = FastAPI(
    title="Vacation Manager API",
    description=description,
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "API Support",
        "email": "support@vacationmanager.example.com",
    },
    license_info={
        "name": "MIT",
    },
)

# CORS Middleware
import os

# Allow localhost for development and Render.com domains for production
origins = [
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost:5173", # Vite default dev port
]

# Add production origins from environment variable if available
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)
    # Also add HTTPS version if HTTP is provided
    if frontend_url.startswith("http://"):
        origins.append(frontend_url.replace("http://", "https://"))
    # Add onrender.com pattern
    origins.append("https://*.onrender.com")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Vacation Manager API"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy"}
