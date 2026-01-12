# Vacation Manager

A web application for managing employee vacation requests in small companies.

## features

- 🏖️ Submit vacation requests
- ✅ Manager approval workflow
- 📊 Balance tracking
- 📅 Team calendar
- 👥 User management (admin)
- 🎉 Public holidays configuration

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **Deployment:** Render

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev if not using Docker)
- Python 3.10+ (for local backend dev if not using Docker)

### Running with Docker (Recommended)

1. **Start the services:**
   ```bash
   docker-compose up --build
   ```
   
2. **Access the application:**
   - Frontend: [http://localhost](http://localhost)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development

**Backend:**
1. Navigate to `backend/`
2. Create `.env` (see `backend/.env.example` or use defaults)
3. Install reqs: `pip install -r requirements.txt`
4. Run: `uvicorn app.main:app --reload`
5. Seed data: `python scripts/seed_data.py`

**Frontend:**
1. Navigate to `frontend/`
2. Install: `npm install`
3. Run: `npm run dev`

## Deployment
configured for Render. Connect your repository to Render and use `docker-compose.yml` or individual Dockerfiles.

## API Documentation

OpenAPI specification available at `/docs` when running the backend.