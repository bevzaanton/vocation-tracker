# API Quick Reference

Quick reference guide for the Vacation Manager API endpoints.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints (except login) require Bearer token authentication:

```bash
Authorization: Bearer <your_access_token>
```

Get token from `/auth/login` endpoint.

---

## Endpoints Summary

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login and get access token | No |
| GET | `/auth/me` | Get current user info | Yes |

### Users

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users` | List all users | Yes | Admin |
| POST | `/users` | Create new user | Yes | Admin |
| PUT | `/users/{id}` | Update user | Yes | Admin |
| DELETE | `/users/{id}` | Soft delete user | Yes | Admin |
| GET | `/users/{id}/balance` | Get user vacation balance | Yes | User/Manager/Admin |

### Vacation Types

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/vacation-types` | List vacation types | Yes | User |
| POST | `/vacation-types` | Create vacation type | Yes | Admin |

### Public Holidays

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/holidays` | List holidays (by year) | Yes | User |
| POST | `/holidays` | Create holiday | Yes | Admin |

### Vacation Requests

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/requests` | Create vacation request | Yes | User |
| GET | `/requests` | List requests | Yes | User* |
| POST | `/requests/{id}/approve` | Approve request | Yes | Manager/Admin |
| POST | `/requests/{id}/reject` | Reject request | Yes | Manager/Admin |
| POST | `/requests/{id}/cancel` | Cancel request | Yes | User (owner) |

*Employees see only their own requests; Managers/Admins see all.

### Calendar

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/calendar` | Get calendar view | Yes | User |

---

## Common Request Examples

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

### Get Current User

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### Create Vacation Request

```bash
curl -X POST http://localhost:8000/api/v1/requests \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type_id": 1,
    "start_date": "2025-03-10",
    "end_date": "2025-03-14",
    "comment": "Spring break"
  }'
```

### Get Vacation Balance

```bash
curl -X GET "http://localhost:8000/api/v1/users/1/balance?year=2025" \
  -H "Authorization: Bearer <token>"
```

### Approve Request

```bash
curl -X POST http://localhost:8000/api/v1/requests/100/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved"}'
```

### Get Calendar

```bash
curl -X GET "http://localhost:8000/api/v1/calendar?start_date=2025-03-01&end_date=2025-03-31" \
  -H "Authorization: Bearer <token>"
```

---

## Query Parameters

### Pagination

Available on: `/users`, `/requests`

- `skip` (integer, default: 0) - Number of records to skip
- `limit` (integer, default: 100) - Maximum records to return

Example:
```
GET /api/v1/users?skip=10&limit=20
```

### Filtering by Year

Available on: `/holidays`, `/users/{id}/balance`

- `year` (integer, default: 2025) - Filter by year

Example:
```
GET /api/v1/holidays?year=2024
```

### Date Range

Required on: `/calendar`

- `start_date` (date, required) - Start date (YYYY-MM-DD)
- `end_date` (date, required) - End date (YYYY-MM-DD)

Example:
```
GET /api/v1/calendar?start_date=2025-01-01&end_date=2025-12-31
```

---

## Response Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error, business rule violation) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |

---

## Data Models

### User Roles

- `employee` - Can manage own requests
- `manager` - Can approve requests
- `admin` - Full system access

### Request Statuses

- `pending` - Awaiting approval
- `approved` - Approved by manager/admin
- `rejected` - Rejected by manager/admin
- `cancelled` - Cancelled by user

### Business Day Calculation

- Excludes weekends (Saturday, Sunday)
- Excludes public holidays defined in system
- Used for vacation balance deduction

---

## Default Test Users

(Available after running seed script)

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | password123 | admin |
| manager@company.com | password123 | manager |
| employee1@company.com | password123 | employee |

---

## Interactive Documentation

For detailed schemas, examples, and interactive testing:

- **Swagger UI:** http://localhost:8000/api/v1/docs
- **ReDoc:** http://localhost:8000/api/v1/redoc

---

## Additional Resources

- Full Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- OpenAPI Spec: [openapi.json](./openapi.json) | [openapi.yaml](./openapi.yaml)
- Project Guide: [../../AGENTS.md](../../AGENTS.md)
