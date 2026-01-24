# Vacation Manager

A web application for managing employee vacation requests in small companies.

## Problem Statement

Small and medium-sized companies often struggle with manual vacation tracking through emails, spreadsheets, or paper forms. This leads to:
- Lost or forgotten vacation requests
- Conflicting time-off approvals when multiple employees request the same dates
- Difficulty tracking remaining vacation balances
- No central visibility into team availability
- Time-consuming manual approval processes for managers

**Vacation Manager** solves these problems by providing a centralized, automated system for the complete vacation request lifecycle.

## What This System Does

This application provides a comprehensive vacation management solution with three user roles:

**For Employees:**
- Submit vacation requests with automatic business day calculation (excluding weekends and public holidays)
- View real-time vacation balance across different leave types (paid, unpaid, sick leave, etc.)
- Track request status (pending, approved, rejected)
- View team calendar to see who's out and when
- Cancel pending requests before approval

**For Managers:**
- Review and approve/reject vacation requests from their team
- View team availability calendar to avoid conflicts
- See all pending requests requiring action
- Add comments when approving or rejecting requests

**For Administrators:**
- Manage users and assign managers to employees
- Configure vacation types (paid leave, sick leave, etc.) with custom colors and default balances
- Set up public holidays that automatically affect business day calculations
- View organization-wide vacation statistics and calendar

**Key Benefits:**
- Automated balance tracking and deduction upon approval
- Business day calculation that excludes weekends and configured public holidays
- Centralized team calendar for visibility into who's available
- Role-based access control ensuring employees can only view their own data
- Complete audit trail of all requests and approvals

## Features

- 🏖️ Submit vacation requests
- ✅ Manager approval workflow
- 📊 Balance tracking
- 📅 Team calendar
- 👥 User management (admin)
- 🎉 Public holidays configuration
- 🌐 Multi-language support (English, Ukrainian)

## Tech Stack

### Frontend
- **Framework:** React 18 with Vite build tool for fast development and optimized production builds
- **Language:** TypeScript for type safety and better developer experience
- **Styling:** Tailwind CSS for utility-first responsive design
- **State Management:** React Context API + Hooks for authentication and local state
- **HTTP Client:** Axios with interceptors for JWT token management and error handling
- **Routing:** React Router v6 for client-side navigation
- **Internationalization:** react-i18next with language detection and localStorage persistence
- **Role:** Serves as the user interface, communicates with backend API for all data operations

### Backend
- **Framework:** FastAPI (Python 3.11) for high-performance async API
- **ORM:** SQLAlchemy 2.0 with async support for database operations
- **Database:** PostgreSQL 15 for production, SQLite for local development
- **Authentication:** JWT (JSON Web Tokens) with OAuth2PasswordBearer pattern
- **Migrations:** Alembic for database schema version control
- **Validation:** Pydantic for request/response validation and OpenAPI generation
- **Role:** Handles business logic, authentication, database operations, and exposes RESTful API

### Infrastructure & DevOps
- **Containerization:** Docker with multi-stage builds for optimized images
- **Orchestration:** Docker Compose for local multi-service development
- **CI/CD:** GitHub Actions for automated testing and deployment
- **Deployment Platform:** Render.com with Infrastructure as Code (render.yaml)
- **Database Hosting:** Managed PostgreSQL on Render
- **Static Hosting:** CDN-backed static site hosting for frontend
- **Role:** Ensures consistent environments across development, testing, and production

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                    (React + TypeScript)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
                        │ JWT in Authorization header
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                      │
│                      Nginx Server                            │
│  • Serves static React build from /dist                     │
│  • Proxies /api/v1/* to backend:8000                        │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (internal Docker network)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Port 8000)                       │
│                   FastAPI + Uvicorn                          │
│  • REST API with OpenAPI documentation                      │
│  • JWT authentication & authorization                        │
│  • Business logic & validation                              │
│  • SQLAlchemy ORM for database access                       │
└───────────────────────┬─────────────────────────────────────┘
                        │ Async SQLAlchemy
                        │ PostgreSQL protocol
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database (Port 5432)                        │
│                    PostgreSQL 15                             │
│  • Users & authentication data                              │
│  • Vacation requests & approvals                            │
│  • Vacation types & balances                                │
│  • Public holidays                                          │
└─────────────────────────────────────────────────────────────┘
```

**Request Flow Example:**
1. User logs in via React form → POST /api/v1/auth/login
2. Nginx proxies to FastAPI backend
3. Backend validates credentials against PostgreSQL
4. Returns JWT token to frontend
5. Frontend stores token in localStorage
6. Subsequent requests include token in Authorization header
7. Backend validates JWT and processes authorized requests

**Key Architecture Decisions:**
- **Async Everything:** FastAPI + async SQLAlchemy for high concurrency
- **JWT Authentication:** Stateless auth enables horizontal scaling
- **OpenAPI First:** API contract drives both backend and frontend development
- **Docker Compose:** Ensures identical environments across all development machines
- **Nginx Proxy:** Eliminates CORS issues and provides single origin for frontend
- **PostgreSQL:** ACID compliance for critical vacation balance transactions

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
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - **API Documentation:**
     - Swagger UI: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
     - ReDoc: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
     - OpenAPI JSON: [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json)

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

## Testing

### Backend
Run backend tests with coverage:
```bash
cd backend
pytest --cov=app app/tests
```

### Frontend
Run frontend tests:
```bash
cd frontend
npm run test
```
Or run with coverage:
```bash
npm run test:coverage
```

### Integration Tests (E2E)
Run end-to-end integration tests using Playwright:
```bash
cd frontend
npx playwright test
```


## Deployment

This project is deployed on [Render.com](https://render.com) using their Blueprint feature.

### Live Deployment

- **Frontend:** https://vacation-frontend-88rw.onrender.com/
- **Backend API:** https://vacation-backend-a87n.onrender.com/api/v1/docs
- **Health Check:** https://vacation-backend-a87n.onrender.com/api/v1/health

### Default Login Credentials

- **Admin:** admin@company.com / password123
- **Manager:** manager@company.com / password123
- **Employee:** employee1@company.com / password123

⚠️ **Note:** Free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.

### Deploy Your Own Instance

1. Fork/clone this repository
2. Push your code to GitHub
3. Go to [Render Dashboard](https://dashboard.render.com)
4. Click "New +" → "Blueprint"
5. Connect your repository
6. Render will automatically detect `render.yaml` and create:
   - PostgreSQL database (free tier, 1GB, 90-day expiration)
   - Backend API service (Python/FastAPI)
   - Frontend static site (React)
7. After deployment, seed the database via backend Shell: `python seed_data.py`

For detailed instructions, custom domains, and production setup, see the full [Deployment Guide](DEPLOYMENT.md).

## API Documentation

The project includes comprehensive OpenAPI 3.1.0 specifications and documentation:

### Interactive Documentation

When the backend is running, access interactive API documentation:
- **Swagger UI:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs) - Test API endpoints directly in your browser
- **ReDoc:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc) - Alternative documentation UI
- **OpenAPI Spec:** [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json) - Raw OpenAPI JSON

### Static Documentation

Comprehensive documentation files are available in the `backend/docs/` directory:

- **[API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md)** - Complete API reference with examples
- **[QUICK_REFERENCE.md](backend/docs/QUICK_REFERENCE.md)** - Quick endpoint lookup and cURL examples
- **[openapi.json](backend/docs/openapi.json)** - OpenAPI 3.1.0 specification (JSON)
- **[openapi.yaml](backend/docs/openapi.yaml)** - OpenAPI 3.1.0 specification (YAML)
- **[README.md](backend/docs/README.md)** - Documentation guide and usage instructions

### Using OpenAPI Files

The OpenAPI specifications can be:
- Imported into **Postman** or **Insomnia** for API testing
- Used to generate client SDKs with [OpenAPI Generator](https://openapi-generator.tech/)
- Used for API contract testing and validation

### Regenerating OpenAPI Specs

After making changes to API endpoints or models:

```bash
cd backend
python generate_openapi.py
```

### API Overview

The API includes 19 endpoints across 6 modules:
- **Authentication** - Login and user info
- **Users** - User management and vacation balances
- **Vacation Types** - Leave type configuration
- **Public Holidays** - Holiday management
- **Vacation Requests** - Request lifecycle (create, approve, reject, cancel)
- **Calendar** - Team calendar view

For detailed information, see [AGENTS.md](AGENTS.md) for development guidelines and architecture details.