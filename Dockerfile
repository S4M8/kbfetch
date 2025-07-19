# Build Stage - Install dependencies and build tools
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime Stage - Minimal production image
FROM python:3.11-slim AS production
WORKDIR /tmp

# Copy only necessary files from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY app/main.py app/main.py
COPY app/rag.py app/rag.py
COPY app/document_processor.py app/document_processor.py

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash rag_user
USER rag_user

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]
