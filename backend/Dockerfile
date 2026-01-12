FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Command to run the application
# We use a shell script or directly command to run migrations then app
# For simplicity in this step, just the app, we'll add migrations later
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
