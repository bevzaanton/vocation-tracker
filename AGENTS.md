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

### Getting Started (Docker - Recommended)
1.  **Build & Run**:
    ```bash
    docker-compose up --build
    ```
2.  **Access**:
    *   Frontend: http://localhost:3000
    *   Backend API: http://localhost:8000
    *   Backend Docs: http://localhost:8000/api/v1/docs
3.  **Restarting Services**:
    *   Frontend only: `docker-compose restart frontend`
    *   Backend only: `docker-compose restart backend`
    *   Full Rebuild: `docker-compose up --build`
    *   Stop all: `docker-compose down`

### Local Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload  # Starts on port 8000
```

### Local Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts on port 5173 with Vite proxy to backend
```

### Linting
**Backend:**
Backend does not have a configured linter. Code style follows PEP 8 conventions.

**Frontend:**
```bash
cd frontend
npm run lint
```

**Build:**
```bash
# Frontend build
cd frontend
npm run build  # TypeScript compilation + Vite build
```

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
    *   Backend (`.env` or environment):
        *   `DATABASE_URL`: PostgreSQL connection string
        *   `SECRET_KEY`: JWT signing key
        *   `ALGORITHM`: Token algorithm (default: HS256)
        *   `ACCESS_TOKEN_EXPIRE_MINUTES`: Token lifetime (default: 43200 = 30 days)
    *   Frontend (`.env` or environment):
        *   `VITE_API_URL`: API base URL (default: `/api/v1`)

## 5. Database Migrations

**Alembic** is used for database schema migrations:

```bash
cd backend
# Generate migration from model changes
alembic revision --autogenerate -m "description of change"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

After modifying models in `backend/app/models/`, always:
1. Generate a migration
2. Review the generated migration file in `backend/alembic/versions/`
3. Apply the migration
4. Update corresponding Pydantic schemas in `backend/app/schemas/`

## 6. Common Development Patterns

### Creating a New API Endpoint
1. Define Pydantic schemas in `backend/app/schemas/` (request/response models)
2. Add route handler in appropriate `backend/app/api/v1/*.py` file
3. Import and register router in `backend/app/api/v1/router.py` if it's a new module
4. Use `get_current_user` dependency for authentication (from `app.api.deps`)
5. Use `get_db` dependency for database access (from `app.database`)

### Adding a New Frontend Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Create API functions in `frontend/src/api/` if needed
4. Use `useAuth()` hook to access current user and authentication state
5. Use `apiClient` from `src/api/client.ts` for API calls (automatically handles JWT tokens)

### Working with Authentication
**Backend:**
- Use `get_current_user` dependency in route functions to require authentication
- Access user via parameter: `current_user: User = Depends(get_current_user)`
- Token validation happens automatically in the dependency

**Frontend:**
- `AuthContext` provides `user`, `isAuthenticated`, `login()`, `logout()`
- `apiClient` automatically adds JWT token to requests via interceptor
- 401 responses automatically trigger logout and redirect to login page

## 7. Future Tasks / Roadmap
*   **Email Notifications**: Send emails on status changes.
*   **Calendar Export**: iCal feed for Google Calendar integration.
*   **Advanced Reporting**: CSV export of leave history.
*   **Slack/Telegram Bot**: Integration for quick approvals.

## 8. Code Architecture Details

### Backend API Layer
**Route Organization (`backend/app/api/v1/`):**
- `auth.py`: Login, token refresh, current user info
- `users.py`: User CRUD, manager assignments, balance management
- `requests.py`: Vacation request CRUD, status updates, approvals
- `calendar.py`: Team calendar views, availability queries
- `holidays.py`: Public holiday management
- `vacation_types.py`: Vacation type definitions (paid/unpaid, colors, default days)
- `router.py`: Central router registration, mounts all domain routers

**Authentication Flow:**
1. Client sends credentials to `/api/v1/auth/login`
2. Backend validates and returns JWT token
3. Client stores token in localStorage
4. Subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend validates token via `get_current_user` dependency
6. Token expires after 30 days (configurable)

**Database Models:**
- `User`: email, password_hash, name, role (admin/manager/employee), manager relationships
- `VacationRequest`: user, type, dates, status (pending/approved/rejected), approver
- `VacationType`: name, is_paid, default_days, color (for UI)
- `PublicHoliday`: date, name, description
- `VacationBalance`: user, vacation_type, balance, year

### Frontend Structure
**State Management:**
- `AuthContext`: Global authentication state, user info, login/logout functions
- Component-level state with `useState` and `useEffect`
- No global state management library (Redux, MobX, etc.)

**API Integration:**
- `apiClient` (Axios instance) in `src/api/client.ts`
- Request interceptor adds JWT from localStorage
- Response interceptor handles 401 by clearing token and redirecting to login
- Domain-specific API modules: `auth.ts`, `users.ts`, `requests.ts`, etc.

**Component Structure:**
- `src/components/`: Reusable UI components (forms, cards, tables, etc.)
- `src/pages/`: Full page components mapped to routes
- `src/context/`: React Context providers
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions (date formatting, validation, etc.)

### Docker Networking
- All services on `vacation-network` bridge network
- Frontend Nginx proxies `/api/v1/` to `http://backend:8000/api/v1/`
- Backend connects to database at `db:5432` (internal Docker service name)
- Host accesses frontend at `localhost:3000` (mapped from container port 80)

## 9. Testing Strategy

### Backend
*   **Framework**: `pytest`
*   **Plugins**: `pytest-cov`, `pytest-asyncio`
*   **Location**: `backend/app/tests`
*   **Fixtures**: `conftest.py` provides fixtures for testing:
    *   `db`: Async session with automatic rollback after each test
    *   `client`: Async HTTP client for API testing
    *   `normal_user`, `admin_user`: Pre-created test users
    *   `normal_user_token`, `admin_user_token`: JWT tokens for authentication
    *   `auth_client`, `admin_client`: HTTP clients with auth headers
*   **Commands**:
    ```bash
    cd backend
    pytest                           # Run all tests
    pytest --cov=app app/tests       # Run with coverage
    pytest app/tests/test_auth.py    # Run single test file
    pytest app/tests/test_auth.py::test_login  # Run single test
    ```

### Frontend
*   **Framework**: `Vitest`
*   **Library**: `React Testing Library` (RTL)
*   **Environment**: `jsdom`
*   **Setup**: `frontend/src/test/setup.ts`
*   **Commands**:
    ```bash
    cd frontend
    npm run test              # Run tests in watch mode
    npm run test:coverage     # Run with coverage report
    ```

## 10. Agents History
*   **Antigravity (Google Deepmind)**: Initial setup, full-stack implementation, bug fixing (login, proxy issues), testing infrastructure setup, and documentation.
