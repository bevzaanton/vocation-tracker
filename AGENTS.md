# Project Overview & Agent Guidelines

## 1. Project Context
**Name**: Vacation Manager (Vocation Tracker)
**Description**: A comprehensive web application for managing employee leave, vacation balances, approvals, and team availability. Designed for small-to-medium companies.

## 2. Technical Architecture

### Backend (`/backend`)
*   **Framework**: FastAPI (Python 3.10+)
*   **Database**: PostgreSQL (Async with `asyncpg` + `SQLAlchemy`)
*   **Migrations**: Alembic
*   **Authentication**: JWT (OAuth2PasswordBearer)
*   **Structure**:
    *   `app/api/v1`: Route handlers grouped by domain (auth, users, requests, etc.).
    *   `app/core`: Configuration and security logic.
    *   `app/models`: SQLAlchemy ORM models.
    *   `app/schemas`: Pydantic models for request/response validation.
    *   `app/services`: Business logic layer (optional, mostly in API handlers currently).

### Frontend (`/frontend`)
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS
*   **State Management**: React Context + Hooks (local state).
*   **HTTP Client**: Axios (configured with interceptors for JWT injection and 401 handling).
*   **Proxy**: Vite is configured to proxy `/api` requests to `http://localhost:8000` to avoid CORS in dev.

### Infrastructure & DevOps
*   **Containerization**: Docker & Docker Compose.
*   **Orchestration**: `docker-compose.yml` runs:
    *   `backend`: Port 8000
    *   `frontend`: Port 3000 (mapped to host 3000, internal nginx 80)
    *   `db`: PostgreSQL 15
*   **Nginx**: Frontend container uses Nginx to serve static files and proxy `/api/v1` requests to the backend service.

## 3. Development Workflow

### Getting Started (Docker)
1.  **Build & Run**:
    ```bash
    docker-compose up -d --build
    ```
2.  **Access**:
    *   Frontend: http://localhost:3000
    *   Backend Docs: http://localhost:8000/docs
3.  **Restarting Services**:
    *   Frontend only: `docker-compose restart frontend`
    *   Backend only: `docker-compose restart backend`
    *   Full Rebuild: `docker-compose up -d --build`

### Database Seeding
*   **Script**: `scripts/seed_data.py`
*   **Usage**: Run automatically if possible, or manually via `python scripts/seed_data.py` (ensure `DATABASE_URL` is set).
*   **Default Users**:
    *   Admin: `admin@company.com` / `password123`
    *   Manager: `manager@company.com` / `password123`
    *   Employee: `employee1@company.com` / `password123`

## 4. Key Implementation Details & Gotchas
*   **Trailing Slashes**: The backend strict slash behavior can cause redirects. Always append a trailing slash to API endpoint calls (e.g., `/api/v1/vacation-types/`) or ensure the client handles redirects correctly.
*   **Nginx Proxy Headers**: The Nginx configuration in the frontend container **must** pass `Host $http_host` to the backend. Failure to do so results in the backend generating redirects to `localhost:80` (internal container port) instead of `localhost:3000` (external access port), breaking the app for the user.
*   **Async SQLAlchemy & Relationships**: When using async SQLAlchemy, loading collection-based relationships (like `User.approvers`) with `lazy="joined"` can cause `InvalidRequestError` if `.unique()` isn't called on the result. It's recommended to use `lazy="selectin"` for collections to avoid this and improve performance in async contexts.
*   **Environment Variables**:
    *   Backend relies on `DATABASE_URL` and `SECRET_KEY`.
    *   Frontend relies on `VITE_API_URL` (defaulting to `/api/v1`).

## 5. Future Tasks / Roadmap
*   **Email Notifications**: Send emails on status changes.
*   **Calendar Export**: iCal feed for Google Calendar integration.
*   **Advanced Reporting**: CSV export of leave history.
*   **Slack/Telegram Bot**: Integration for quick approvals.

## 7. Testing Strategy

### Backend
*   **Framework**: `pytest`
*   **Plugins**: `pytest-cov`, `pytest-asyncio`
*   **Location**: `backend/app/tests`
*   **Fixtures**: `conftest.py` provides async database sessions with automatic rollbacks.
*   **Commands**:
    *   Full test run: `pytest`
    *   With coverage: `pytest --cov=app app/tests`

### Frontend
*   **Framework**: `Vitest`
*   **Library**: `React Testing Library` (RTL)
*   **Environment**: `jsdom`
*   **Setup**: `frontend/src/test/setup.ts`
*   **Commands**:
    *   Run tests: `npm run test`
    *   With coverage: `npm run test:coverage`

## 8. Agents History
*   **Antigravity (Google Deepmind)**: Initial setup, full-stack implementation, bug fixing (login, proxy issues), testing infrastructure setup, and documentation.
