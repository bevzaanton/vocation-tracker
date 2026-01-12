from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Vacation Manager API",
    description="API for Vacation Manager Application",
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost:5173", # Vite default dev port
]

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
