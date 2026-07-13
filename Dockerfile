# Use official lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=7860 \
    PYTHONPATH=/app/backend \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    HF_HOME=/app/.cache/huggingface

# Set working directory
WORKDIR /app

# Install git and system dependencies for sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the sentence-transformers model during build (cached in image)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy the application source directories
COPY backend ./backend
COPY frontend ./frontend

# Expose the default port
EXPOSE 7860

# Run uvicorn pointing to backend.main:app
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
