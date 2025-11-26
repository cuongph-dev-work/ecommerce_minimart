#!/bin/bash

# Create .env file with Docker PostgreSQL config
cat > .env << 'EOF'
# Application
NODE_ENV=development
PORT=8000
API_PREFIX=api

# Database (Docker PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce_minimart

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
UPLOAD_PUBLIC_URL=http://localhost:8000/uploads
ENABLE_IMAGE_OPTIMIZATION=true
IMAGE_QUALITY=85
THUMBNAIL_SIZE=150
MEDIUM_SIZE=500
LARGE_SIZE=1200

# Storage Type (disk or minio)
STORAGE_TYPE=minio

# MinIO Configuration
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=ecommerce
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_USE_SSL=false

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Swagger
SWAGGER_ENABLED=true

# Redis (optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
EOF

echo "✅ .env file created successfully!"

