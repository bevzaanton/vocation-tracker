#!/usr/bin/env python3
"""
Script to generate OpenAPI specification files from FastAPI application.
Generates both JSON and YAML formats.
"""
import json
import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.main import app


def generate_openapi_specs():
    """Generate OpenAPI specification in JSON and YAML formats."""

    # Get the OpenAPI schema
    openapi_schema = app.openapi()

    # Create docs directory if it doesn't exist
    docs_dir = Path(__file__).parent / "docs"
    docs_dir.mkdir(exist_ok=True)

    # Write JSON format
    json_path = docs_dir / "openapi.json"
    with open(json_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    print(f"✓ Generated OpenAPI JSON: {json_path}")

    # Write YAML format
    try:
        import yaml
        yaml_path = docs_dir / "openapi.yaml"
        with open(yaml_path, "w") as f:
            yaml.dump(openapi_schema, f, sort_keys=False, default_flow_style=False)
        print(f"✓ Generated OpenAPI YAML: {yaml_path}")
    except ImportError:
        print("⚠ PyYAML not installed. Install with: pip install pyyaml")
        print("  Skipping YAML generation.")

    print(f"\n📊 OpenAPI Specification Generated Successfully!")
    print(f"   - Total endpoints: {count_endpoints(openapi_schema)}")
    print(f"   - API version: {openapi_schema['info']['version']}")
    print(f"\n📖 View documentation:")
    print(f"   - Swagger UI: http://localhost:8000/api/v1/docs")
    print(f"   - ReDoc: http://localhost:8000/api/v1/redoc")
    print(f"   - OpenAPI JSON: http://localhost:8000/api/v1/openapi.json")


def count_endpoints(schema):
    """Count total number of endpoints in the schema."""
    count = 0
    for path_data in schema.get("paths", {}).values():
        count += len(path_data)
    return count


if __name__ == "__main__":
    generate_openapi_specs()
