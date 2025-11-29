# Stage 1: Build Frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Serve Backend and Frontend
FROM python:3.9-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend from Stage 1 to a static directory
COPY --from=builder /app/out /app/static

# Create a non-root user for security
RUN useradd -m -u 1000 user

# Ensure the user owns the application directory
# This is crucial for ChromaDB to be able to create its database files
RUN chown -R user:user /app

USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

WORKDIR /app

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
