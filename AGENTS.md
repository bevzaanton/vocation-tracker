# Project Overview & Agent Guidelines

## 1. Project Context
**Name**: Vacation Manager (Vocation Tracker)
**Description**: A comprehensive web application for managing employee leave, vacation balances, approvals, and team availability. Designed for small-to-medium companies.

**Live Deployment:**
- Frontend: https://vacation-frontend-88rw.onrender.com
- Backend API: https://vacation-backend-a87n.onrender.com/api/v1/docs
- Health Check: https://vacation-backend-a87n.onrender.com/api/v1/health
- Platform: Render.com (Free Tier)

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
    *   **API Documentation**:
        *   Swagger UI: http://localhost:8000/api/v1/docs (Interactive)
        *   ReDoc: http://localhost:8000/api/v1/redoc (Alternative UI)
        *   OpenAPI JSON: http://localhost:8000/api/v1/openapi.json
        *   Static Docs: [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md)
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

## 6. API Documentation

The project includes comprehensive OpenAPI 3.1.0 specifications and documentation. All API endpoints, models, authentication, and business rules are fully documented.

### Available Documentation Formats

*   **Interactive Documentation** (when server is running):
    *   **Swagger UI**: http://localhost:8000/api/v1/docs - Full interactive API explorer with request/response testing
    *   **ReDoc**: http://localhost:8000/api/v1/redoc - Alternative clean documentation UI
    *   **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json - Live OpenAPI specification endpoint

*   **Static Documentation Files** (`backend/docs/`):
    *   **API_DOCUMENTATION.md** - Comprehensive guide (18KB):
        *   Complete endpoint reference with all parameters
        *   Authentication and authorization details
        *   Data models and schemas
        *   Request/response examples with cURL
        *   Business rules and workflows
        *   Error handling patterns
    *   **QUICK_REFERENCE.md** - Quick lookup guide:
        *   Endpoint summary table
        *   Common cURL examples
        *   Query parameters reference
        *   Status codes
    *   **openapi.json** (43KB) - OpenAPI 3.1.0 specification in JSON format
    *   **openapi.yaml** (28KB) - OpenAPI 3.1.0 specification in YAML format
    *   **README.md** - Documentation guide with usage instructions

### API Coverage

The documentation covers all **19 endpoints** across **6 modules**:

| Module | Endpoints | Features |
|--------|-----------|----------|
| **Authentication** | 2 | OAuth2/JWT login, user info |
| **Users** | 5 | CRUD operations, balance tracking, role management |
| **Vacation Types** | 2 | Leave type configuration |
| **Public Holidays** | 2 | Holiday management |
| **Vacation Requests** | 5 | Full request lifecycle (create, approve, reject, cancel) |
| **Calendar** | 1 | Team availability view |

### Regenerating OpenAPI Specs

After modifying API endpoints, models, or adding documentation:

```bash
cd backend
python generate_openapi.py
```

This script:
*   Extracts the OpenAPI schema from the FastAPI application
*   Generates `backend/docs/openapi.json`
*   Generates `backend/docs/openapi.yaml`
*   Reports total endpoint count and version info

### Using OpenAPI Files for Development

**Import into API Clients:**
*   **Postman**: Import → File → Select `openapi.json` or `openapi.yaml`
*   **Insomnia**: Create → Import From → File → Select `openapi.json` or `openapi.yaml`
*   Automatically creates a full collection of all endpoints with proper authentication

**Generate Client SDKs:**
```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# TypeScript/Fetch client
openapi-generator-cli generate \
  -i backend/docs/openapi.json \
  -g typescript-fetch \
  -o ./client-typescript

# Python client
openapi-generator-cli generate \
  -i backend/docs/openapi.json \
  -g python \
  -o ./client-python

# Java client
openapi-generator-cli generate \
  -i backend/docs/openapi.json \
  -g java \
  -o ./client-java
```

See [OpenAPI Generator docs](https://openapi-generator.tech/docs/generators) for 50+ supported languages.

**Contract Testing:**
*   Use tools like [Dredd](https://dredd.org/) or [Schemathesis](https://schemathesis.readthedocs.io/) to validate API responses against the OpenAPI spec
*   Ensure API implementation matches documentation

**API Linting:**
```bash
# Validate OpenAPI spec with Spectral
npx @stoplight/spectral-cli lint backend/docs/openapi.json
```

### Enhancing API Documentation

When adding new endpoints, enhance documentation by:

1. **Add docstrings** to route functions:
   ```python
   @router.post("/requests", response_model=VacationRequestResponse)
   async def create_request(
       request: VacationRequestCreate,
       current_user: User = Depends(get_current_user),
       db: AsyncSession = Depends(get_db)
   ):
       """
       Create a new vacation request.

       - Calculates business days automatically (excludes weekends and holidays)
       - Validates sufficient balance
       - Sets initial status to 'pending'
       """
   ```

2. **Add response descriptions**:
   ```python
   @router.post(
       "/requests/{request_id}/approve",
       response_model=VacationRequestResponse,
       responses={
           400: {"description": "Request not in pending status or insufficient balance"},
           403: {"description": "User lacks manager/admin privileges"},
           404: {"description": "Request not found"}
       }
   )
   ```

3. **Use clear parameter descriptions** in Pydantic models:
   ```python
   class VacationRequestCreate(BaseModel):
       type_id: int = Field(..., description="ID of the vacation type")
       start_date: date = Field(..., description="First day of vacation (inclusive)")
       end_date: date = Field(..., description="Last day of vacation (inclusive)")
       comment: Optional[str] = Field(None, description="Optional user comment")
   ```

4. **Regenerate specs** after changes:
   ```bash
   python backend/generate_openapi.py
   ```

For complete documentation guidelines, see `backend/docs/README.md`.

## 7. Common Development Patterns

### Creating a New API Endpoint
1. Define Pydantic schemas in `backend/app/schemas/` (request/response models)
2. Add route handler in appropriate `backend/app/api/v1/*.py` file
3. Add docstrings and response descriptions for documentation
4. Import and register router in `backend/app/api/v1/router.py` if it's a new module
5. Use `get_current_user` dependency for authentication (from `app.api.deps`)
6. Use `get_db` dependency for database access (from `app.database`)
7. Regenerate OpenAPI specs: `python backend/generate_openapi.py`

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

## 10. Production Deployment

### Render.com Deployment

The application is deployed on Render.com using Infrastructure as Code (Blueprint):

**Configuration File:** `render.yaml`

**Services:**
1. **Backend** (vacation-backend-a87n)
   - Type: Web Service
   - Runtime: Python 3.11
   - Plan: Free (spins down after 15 min inactivity)
   - Build: `./build.sh` (installs deps, runs migrations)
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health Check: `/api/v1/health`

2. **Frontend** (vacation-frontend-88rw)
   - Type: Static Site
   - Runtime: Node.js (build only)
   - Build: `cd frontend && npm ci && npm run build`
   - Publish: `frontend/dist`
   - CDN: Global distribution

3. **Database** (vacation-postgres)
   - Type: PostgreSQL 15
   - Plan: Free (1GB storage, expires after 90 days)
   - Region: Oregon

**Environment Variables:**
- Backend:
  - `DATABASE_URL`: Auto-linked from PostgreSQL service
  - `SECRET_KEY`: Auto-generated by Render
  - `FRONTEND_URL`: https://vacation-frontend-88rw.onrender.com
- Frontend:
  - `VITE_API_URL`: https://vacation-backend-a87n.onrender.com/api/v1

**Deployment Process:**
1. Push to GitHub triggers automatic deployment (if enabled)
2. Backend: Runs migrations, then starts uvicorn
3. Frontend: Builds static assets, deploys to CDN
4. Database: Persistent storage (until 90-day free tier expiration)

**Post-Deployment:**
- Seed database: `python seed_data.py` (run in backend Shell)
- Default users: admin@company.com, manager@company.com, employee1@company.com (all with password: password123)

**Cost:** Currently $0/month (free tier)
- Upgrade to production: $14/month (Backend + Database at $7 each)

For detailed deployment instructions, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete guide
- [RENDER_QUICK_START.md](RENDER_QUICK_START.md) - 5-minute setup
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step

## 11. AI-Assisted Development Workflow

### AI Tools and Coding Assistants

This project was built using AI-assisted development with the following tools and workflow:

**Primary Development Assistant:**
- **Claude Code (Anthropic)**: Used throughout the project for full-stack development, code generation, refactoring, debugging, and documentation
- **Claude Sonnet 4.5**: Advanced reasoning model for architecture decisions, deployment configuration, and complex problem-solving
- **Claude Opus 4.5**: Used for critical design decisions and comprehensive code reviews

**Development Workflow:**
1. **Initial Architecture Design**: Used Claude to design the full-stack architecture, choosing FastAPI for backend and React for frontend based on requirements
2. **Code Generation**: AI-generated initial boilerplate, API endpoints, database models, and frontend components
3. **Iterative Development**: Used conversational prompting to implement features incrementally with immediate feedback
4. **Debugging**: AI-assisted debugging for issues like CORS, authentication, proxy configuration, and async SQLAlchemy problems
5. **Testing**: AI-generated test cases and test fixtures for both backend and frontend
6. **Documentation**: AI-generated comprehensive API documentation, deployment guides, and developer documentation

**Key Prompts and Patterns:**
- "Create a FastAPI endpoint for vacation requests with authentication"
- "Generate React component for vacation request form with TypeScript"
- "Debug the Nginx proxy configuration for Docker setup"
- "Write pytest fixtures for testing authenticated API endpoints"
- "Generate OpenAPI specifications from FastAPI application"

### Model Context Protocol (MCP) Integration

This project extensively uses **Model Context Protocol (MCP)** to enhance AI-assisted development:

**MCP Servers Used:**

1. **Filesystem MCP Server**
   - **Purpose**: Provides AI with secure, structured access to project files
   - **Usage**: Reading code files, configuration files, and documentation
   - **Benefits**: Allows Claude to maintain context across the entire codebase without manual file copying

2. **Git MCP Server**
   - **Purpose**: Enables AI to interact with Git repository
   - **Usage**:
     - Viewing commit history to understand code evolution
     - Checking git status before making changes
     - Suggesting appropriate commit messages based on changes
     - Understanding recent changes via git diff
   - **Benefits**: AI understands project history and can make contextually aware suggestions

3. **PostgreSQL MCP Server**
   - **Purpose**: Direct database inspection and querying
   - **Usage**:
     - Inspecting database schema
     - Testing queries before implementing in code
     - Debugging data-related issues
     - Verifying migrations
   - **Benefits**: Real-time database feedback without context switching

4. **Web Search MCP Server**
   - **Purpose**: Real-time access to documentation and solutions
   - **Usage**:
     - Looking up FastAPI best practices
     - Checking React/TypeScript patterns
     - Finding solutions to specific error messages
     - Verifying library versions and compatibility
   - **Benefits**: Up-to-date information beyond AI training data

**MCP Workflow Example:**

```
Developer: "Add vacation balance tracking feature"

AI Process:
1. Uses Filesystem MCP to read existing User model
2. Uses Git MCP to check recent changes to models
3. Uses Web Search MCP to find SQLAlchemy relationship patterns
4. Uses PostgreSQL MCP to verify current schema
5. Generates new VacationBalance model and migration
6. Uses Filesystem MCP to write code
7. Uses Git MCP to suggest commit message
```

**Benefits of MCP in This Project:**
- **Contextual Awareness**: AI maintains understanding of entire codebase structure
- **Reduced Errors**: Direct database access prevents schema mismatches
- **Faster Debugging**: Git history provides context for why code exists
- **Better Decisions**: Web search enables use of latest best practices
- **Seamless Workflow**: No manual context switching or file copying needed

**Configuration:**

MCP servers are configured in Claude Code settings (`~/.config/claude/config.json`):

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspaces/vocation-tracker"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git", "--repository", "/workspaces/vocation-tracker"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/vacation_db"]
    }
  }
}
```

For more details on MCP, see the [Model Context Protocol documentation](https://modelcontextprotocol.io/).

### AGENTS.md Usage

This `AGENTS.md` file serves as guidance for AI coding assistants working on this project:
- **Architecture Reference**: Helps AI understand design decisions
- **Development Patterns**: Provides examples of how to implement features
- **Common Gotchas**: Prevents repeating known issues
- **Context Preservation**: Maintains institutional knowledge across sessions

## 12. Agents History
*   **Antigravity (Google Deepmind)**: Initial setup, full-stack implementation, bug fixing (login, proxy issues), testing infrastructure setup, and documentation.
*   **Claude Sonnet 4.5**: Render.com deployment configuration, infrastructure as code setup, deployment documentation, and production deployment troubleshooting.
