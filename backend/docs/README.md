# API Documentation

This directory contains the OpenAPI specifications and documentation for the Vacation Manager API.

## Files

### OpenAPI Specifications

- **[openapi.json](./openapi.json)** - OpenAPI 3.0 specification in JSON format
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 specification in YAML format

These files can be imported into API development tools like Postman, Insomnia, or used to generate client SDKs.

### Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Comprehensive API documentation including:
  - Authentication guide
  - Complete endpoint reference
  - Data models
  - Examples and workflows
  - Business rules

## Viewing the Documentation

### Interactive Documentation (Recommended)

The API provides interactive documentation when the server is running:

1. Start the backend server:
   ```bash
   cd /workspaces/vocation-tracker/backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Access the documentation:
   - **Swagger UI:** http://localhost:8000/api/v1/docs
   - **ReDoc:** http://localhost:8000/api/v1/redoc
   - **OpenAPI JSON:** http://localhost:8000/api/v1/openapi.json

### Static Documentation

Read the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file for a complete reference that doesn't require a running server.

## Regenerating OpenAPI Specs

If you make changes to the API endpoints or models, regenerate the OpenAPI specifications:

```bash
cd /workspaces/vocation-tracker/backend
python generate_openapi.py
```

This will update both `openapi.json` and `openapi.yaml` files.

## Using with API Clients

### Postman

1. Open Postman
2. Click **Import**
3. Select **File** and choose `openapi.json` or `openapi.yaml`
4. The entire API will be imported as a collection

### Insomnia

1. Open Insomnia
2. Click **Create** > **Import From** > **File**
3. Select `openapi.json` or `openapi.yaml`
4. The API will be imported as a collection

### Generating Client SDKs

Use OpenAPI Generator to create client libraries:

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate -i openapi.json -g typescript-fetch -o ./client-ts

# Generate Python client
openapi-generator-cli generate -i openapi.json -g python -o ./client-py

# Generate Java client
openapi-generator-cli generate -i openapi.json -g java -o ./client-java
```

See [OpenAPI Generator documentation](https://openapi-generator.tech/docs/generators) for more language options.

## API Testing

### Using cURL

See examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#examples)

### Using HTTPie

```bash
# Login
http POST http://localhost:8000/api/v1/auth/login \
  username=user@example.com \
  password=password123

# Make authenticated request
http GET http://localhost:8000/api/v1/users/1/balance \
  Authorization:"Bearer <token>"
```

### Using Python Requests

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/v1/auth/login",
    data={
        "username": "user@example.com",
        "password": "password123"
    }
)
token = response.json()["access_token"]

# Get balance
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(
    "http://localhost:8000/api/v1/users/1/balance?year=2025",
    headers=headers
)
print(response.json())
```

## API Versioning

The current API version is **v1**, accessible at `/api/v1/*`.

Future versions will be released with their own URL prefix (e.g., `/api/v2/*`) while maintaining backward compatibility with v1.

## Support

For questions or issues with the API documentation:
- Open an issue in the project repository
- Contact: support@vacationmanager.example.com
