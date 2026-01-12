# Vacation Manager API Documentation

## Overview

The Vacation Manager API is a comprehensive vacation and holiday management system built with FastAPI. It provides role-based access control for managing vacation requests, balances, and team calendars.

**Version:** 0.1.0
**Base URL:** `/api/v1`

## Table of Contents

- [Authentication](#authentication)
- [Roles and Permissions](#roles-and-permissions)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#users-endpoints)
  - [Vacation Types](#vacation-types-endpoints)
  - [Holidays](#holidays-endpoints)
  - [Vacation Requests](#vacation-requests-endpoints)
  - [Calendar](#calendar-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Authentication

The API uses OAuth2 with JWT (JSON Web Token) Bearer authentication.

### Getting a Token

1. Send a POST request to `/api/v1/auth/login` with your credentials
2. Receive an access token in the response
3. Include the token in subsequent requests using the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Properties

- **Algorithm:** HS256
- **Default Expiration:** 30 minutes (configurable)
- **Token Type:** Bearer

## Roles and Permissions

The system has three user roles with different permission levels:

| Role | Permissions |
|------|-------------|
| **Employee** | - View own vacation requests and balances<br>- Submit vacation requests<br>- Cancel own pending/approved requests |
| **Manager** | - All employee permissions<br>- View all vacation requests<br>- Approve/reject vacation requests<br>- View team calendars |
| **Admin** | - All manager permissions<br>- Create/update/delete users<br>- Manage vacation types<br>- Manage public holidays<br>- Full system access |

---

## Endpoints

### Authentication Endpoints

#### POST /auth/login

Login with email and password to receive an access token.

**Authentication Required:** No

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

#### GET /auth/me

Get information about the currently authenticated user.

**Authentication Required:** Yes

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "employee",
  "manager_id": 5,
  "is_active": true,
  "telegram_id": null,
  "start_date": "2024-01-15",
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00",
  "approvers": [
    {
      "id": 5,
      "email": "manager@example.com",
      "name": "Jane Manager",
      "role": "manager"
    }
  ]
}
```

---

### Users Endpoints

#### GET /users

List all users with pagination support.

**Authentication Required:** Yes (Admin only)

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "employee",
    "manager_id": 5,
    "is_active": true,
    "telegram_id": null,
    "start_date": "2024-01-15",
    "created_at": "2024-01-15T10:00:00",
    "updated_at": "2024-01-15T10:00:00",
    "approvers": []
  }
]
```

---

#### POST /users

Create a new user.

**Authentication Required:** Yes (Admin only)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "name": "New User",
  "role": "employee",
  "manager_id": 5,
  "telegram_id": null,
  "start_date": "2025-02-01",
  "approver_ids": [5, 6]
}
```

**Response (200):**
```json
{
  "id": 10,
  "email": "newuser@example.com",
  "name": "New User",
  "role": "employee",
  "manager_id": 5,
  "is_active": true,
  "telegram_id": null,
  "start_date": "2025-02-01",
  "created_at": "2025-01-12T10:00:00",
  "updated_at": "2025-01-12T10:00:00",
  "approvers": [
    {
      "id": 5,
      "email": "manager@example.com",
      "name": "Manager One",
      "role": "manager"
    }
  ]
}
```

---

#### PUT /users/{user_id}

Update an existing user.

**Authentication Required:** Yes (Admin only)

**Path Parameters:**
- `user_id` (integer): ID of the user to update

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "manager",
  "manager_id": 3,
  "is_active": true,
  "telegram_id": 123456789,
  "start_date": "2024-01-15",
  "approver_ids": [3, 4]
}
```

**Response (200):** Returns updated user object

---

#### DELETE /users/{user_id}

Soft delete a user (sets is_active to False).

**Authentication Required:** Yes (Admin only)

**Path Parameters:**
- `user_id` (integer): ID of the user to delete

**Response (200):** Returns deleted user object with `is_active: false`

---

#### GET /users/{user_id}/balance

Get vacation balance for a specific user.

**Authentication Required:** Yes
**Permissions:** User can view their own balance, Managers/Admins can view any user's balance

**Path Parameters:**
- `user_id` (integer): ID of the user

**Query Parameters:**
- `year` (integer, optional): Year to get balance for (default: 2025)

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "type_id": 1,
    "type_name": "Annual Leave",
    "year": 2025,
    "total_days": 20,
    "used_days": 5,
    "remaining_days": 15
  },
  {
    "id": 2,
    "user_id": 1,
    "type_id": 2,
    "type_name": "Sick Leave",
    "year": 2025,
    "total_days": 10,
    "used_days": 2,
    "remaining_days": 8
  }
]
```

---

### Vacation Types Endpoints

#### GET /vacation-types

List all active vacation types.

**Authentication Required:** Yes

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Annual Leave",
    "is_paid": true,
    "default_days": 20,
    "color": "#3B82F6",
    "is_active": true
  },
  {
    "id": 2,
    "name": "Sick Leave",
    "is_paid": true,
    "default_days": 10,
    "color": "#EF4444",
    "is_active": true
  }
]
```

---

#### POST /vacation-types

Create a new vacation type.

**Authentication Required:** Yes (Admin only)

**Request Body:**
```json
{
  "name": "Parental Leave",
  "is_paid": true,
  "default_days": 90,
  "color": "#8B5CF6",
  "is_active": true
}
```

**Response (200):** Returns created vacation type object

---

### Holidays Endpoints

#### GET /holidays

List public holidays for a specific year.

**Authentication Required:** Yes

**Query Parameters:**
- `year` (integer, optional): Year to get holidays for (default: 2025)

**Response (200):**
```json
[
  {
    "id": 1,
    "date": "2025-01-01",
    "name": "New Year's Day",
    "year": 2025
  },
  {
    "id": 2,
    "date": "2025-12-25",
    "name": "Christmas Day",
    "year": 2025
  }
]
```

---

#### POST /holidays

Create a new public holiday.

**Authentication Required:** Yes (Admin only)

**Request Body:**
```json
{
  "date": "2025-07-04",
  "name": "Independence Day"
}
```

**Response (200):**
```json
{
  "id": 10,
  "date": "2025-07-04",
  "name": "Independence Day",
  "year": 2025
}
```

**Error Responses:**
- `400 Bad Request` - Holiday already exists for this date

---

### Vacation Requests Endpoints

#### POST /requests

Create a new vacation request.

**Authentication Required:** Yes

**Request Body:**
```json
{
  "type_id": 1,
  "start_date": "2025-02-10",
  "end_date": "2025-02-14",
  "comment": "Family vacation"
}
```

**Response (200):**
```json
{
  "id": 100,
  "user_id": 1,
  "user_name": "John Doe",
  "type_id": 1,
  "type_name": "Annual Leave",
  "type_color": "#3B82F6",
  "start_date": "2025-02-10",
  "end_date": "2025-02-14",
  "business_days": 5,
  "status": "pending",
  "comment": "Family vacation",
  "reviewer_id": null,
  "reviewer_name": null,
  "reviewer_comment": null,
  "reviewed_at": null,
  "created_at": "2025-01-12T10:00:00"
}
```

**Error Responses:**
- `400 Bad Request` - Insufficient vacation balance
- `400 Bad Request` - End date before start date

---

#### GET /requests

List vacation requests.

**Authentication Required:** Yes
**Permissions:**
- Employees see only their own requests
- Managers and Admins see all requests

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Response (200):** Returns array of vacation request objects

---

#### POST /requests/{request_id}/approve

Approve a pending vacation request.

**Authentication Required:** Yes (Manager or Admin only)

**Path Parameters:**
- `request_id` (integer): ID of the request to approve

**Request Body:**
```json
{
  "comment": "Approved - enjoy your vacation!"
}
```

**Response (200):** Returns approved vacation request object

**Error Responses:**
- `400 Bad Request` - Request is not in pending status
- `400 Bad Request` - Insufficient vacation balance

---

#### POST /requests/{request_id}/reject

Reject a pending vacation request.

**Authentication Required:** Yes (Manager or Admin only)

**Path Parameters:**
- `request_id` (integer): ID of the request to reject

**Request Body:**
```json
{
  "comment": "Cannot approve due to team capacity"
}
```

**Response (200):** Returns rejected vacation request object

**Error Responses:**
- `400 Bad Request` - Request is not in pending status

---

#### POST /requests/{request_id}/cancel

Cancel a pending or approved vacation request.

**Authentication Required:** Yes
**Permissions:** User must be the request owner

**Path Parameters:**
- `request_id` (integer): ID of the request to cancel

**Response (200):** Returns cancelled vacation request object

**Error Responses:**
- `400 Bad Request` - Request is not in pending or approved status
- `403 Forbidden` - User is not the request owner

---

### Calendar Endpoints

#### GET /calendar

Get calendar view of approved vacation requests.

**Authentication Required:** Yes

**Query Parameters:**
- `start_date` (date, required): Start date in YYYY-MM-DD format
- `end_date` (date, required): End date in YYYY-MM-DD format

**Response (200):**
```json
[
  {
    "user_id": 1,
    "user_name": "John Doe",
    "date": "2025-02-10",
    "type_name": "Annual Leave",
    "type_color": "#3B82F6",
    "status": "approved"
  },
  {
    "user_id": 1,
    "user_name": "John Doe",
    "date": "2025-02-11",
    "type_name": "Annual Leave",
    "type_color": "#3B82F6",
    "status": "approved"
  }
]
```

---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| email | string | User email (unique) |
| name | string | Full name |
| role | string | User role (employee, manager, admin) |
| manager_id | integer | ID of user's manager (nullable) |
| is_active | boolean | Whether user is active |
| telegram_id | integer | Telegram ID for notifications (nullable) |
| start_date | date | Employment start date (nullable) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |
| approvers | array | List of users who can approve this user's requests |

### Vacation Type

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| name | string | Type name (e.g., "Annual Leave") |
| is_paid | boolean | Whether this leave is paid |
| default_days | integer | Default days allocated per year |
| color | string | Hex color code for UI display |
| is_active | boolean | Whether type is active |

### Vacation Balance

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| user_id | integer | User ID |
| type_id | integer | Vacation type ID |
| type_name | string | Type name (denormalized) |
| year | integer | Year this balance applies to |
| total_days | integer | Total allocated days |
| used_days | integer | Days used so far |
| remaining_days | integer | Calculated: total_days - used_days |

### Vacation Request

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| user_id | integer | Requesting user ID |
| user_name | string | User's name (denormalized) |
| type_id | integer | Vacation type ID |
| type_name | string | Type name (denormalized) |
| type_color | string | Type color (denormalized) |
| start_date | date | First day of vacation |
| end_date | date | Last day of vacation |
| business_days | integer | Number of business days (excluding weekends and holidays) |
| status | string | Request status (pending, approved, rejected, cancelled) |
| comment | string | User's comment (nullable) |
| reviewer_id | integer | ID of reviewer (nullable) |
| reviewer_name | string | Reviewer's name (nullable) |
| reviewer_comment | string | Reviewer's comment (nullable) |
| reviewed_at | datetime | Review timestamp (nullable) |
| created_at | datetime | Creation timestamp |

### Public Holiday

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier |
| date | date | Holiday date |
| name | string | Holiday name |
| year | integer | Year (extracted from date) |

### Calendar Entry

| Field | Type | Description |
|-------|------|-------------|
| user_id | integer | User ID |
| user_name | string | User's name |
| date | date | Calendar date |
| type_name | string | Vacation type name |
| type_color | string | Type color for UI |
| status | string | Request status |

---

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format.

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input or business rule violation |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Unexpected server error |

### Validation Errors (422)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Examples

### Complete Workflow Example

#### 1. Login as Employee

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=employee@example.com&password=password123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 2. Check Vacation Balance

```bash
curl -X GET "http://localhost:8000/api/v1/users/1/balance?year=2025" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 3. Submit Vacation Request

```bash
curl -X POST "http://localhost:8000/api/v1/requests" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type_id": 1,
    "start_date": "2025-03-10",
    "end_date": "2025-03-14",
    "comment": "Spring break"
  }'
```

#### 4. Login as Manager

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=manager@example.com&password=manager123"
```

#### 5. Approve Request

```bash
curl -X POST "http://localhost:8000/api/v1/requests/100/approve" \
  -H "Authorization: Bearer <manager_token>..." \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Approved - have a great vacation!"
  }'
```

#### 6. View Team Calendar

```bash
curl -X GET "http://localhost:8000/api/v1/calendar?start_date=2025-03-01&end_date=2025-03-31" \
  -H "Authorization: Bearer <manager_token>..."
```

---

## Business Rules

### Business Day Calculation

- **Weekends** (Saturday and Sunday) are automatically excluded
- **Public holidays** defined in the system are excluded
- Only business days count toward vacation balance

### Balance Management

- Balances are tracked per user, per vacation type, per year
- When a request is **approved**, used_days is incremented
- When an approved request is **cancelled**, used_days is decremented
- New users receive vacation balances based on default_days for each type
- Mid-year joiners receive prorated balances

### Request Lifecycle

```
pending → approved → [can be cancelled]
pending → rejected → [final state]
pending → cancelled → [final state]
approved → cancelled → [balance restored]
```

### Authorization Rules

- Users can only cancel their own requests
- Only managers and admins can approve/reject requests
- Users can view their own requests and balances
- Managers and admins can view all requests and balances
- Only admins can manage users, vacation types, and holidays

---

## OpenAPI Specification

The full OpenAPI 3.0 specification is available in multiple formats:

- **JSON:** [openapi.json](./openapi.json)
- **YAML:** [openapi.yaml](./openapi.yaml)
- **Interactive Swagger UI:** http://localhost:8000/api/v1/docs
- **ReDoc:** http://localhost:8000/api/v1/redoc

You can import these files into tools like:
- Postman
- Insomnia
- Swagger Editor
- OpenAPI Generator (for client SDK generation)

---

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

## Versioning

The API uses URL versioning with the `/api/v1` prefix. Future versions will be released as `/api/v2`, etc., with backward compatibility maintained for existing versions.

---

## Support

For API support, please contact: support@vacationmanager.example.com

## License

MIT License
