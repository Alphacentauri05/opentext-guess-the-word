# syntax=docker/dockerfile:1
# -------------------------------------------------------------
# Enterprise Dockerfile for OpenText Guess The Word Backend
# Built on official python:3.11-slim for minimal CVE attack surface
# -------------------------------------------------------------
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Create a non-privileged system user for enterprise security compliance
RUN groupadd --gid 10001 appuser && \
    useradd --uid 10001 --gid 10001 --create-home --shell /bin/bash appuser

# Install dependencies in a separate layer for efficient Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . .

# Set ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user (strictly required in enterprise corporate environments)
USER appuser

EXPOSE 8000

# Native Python healthcheck (requires no external curl or netcat binary)
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Execute the self-bootstrapping entrypoint
CMD ["python", "-m", "scripts.docker_entrypoint"]
