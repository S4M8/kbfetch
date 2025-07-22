# Stage 1: Build the React frontend
FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build the Python backend
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
COPY ./app /app/app
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY --from=builder /app/frontend/dist /app/static

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
