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

## Deployment

This project is deployed on [Render.com](https://render.com) using their Blueprint feature.

### Live Deployment

- **Frontend:** https://vacation-frontend-88rw.onrender.com
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