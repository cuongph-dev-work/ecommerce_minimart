# MinIO Setup Guide

## Overview
MinIO is an S3-compatible object storage service used for storing uploaded images. This guide explains how to set up and use MinIO with the ecommerce API.

## Docker Setup

MinIO is already configured in `docker-compose.yml`. To start MinIO:

```bash
docker-compose up -d minio
```

Or start all services:
```bash
docker-compose up -d
```

## Access MinIO

- **API Endpoint**: http://localhost:9000
- **Console (Web UI)**: http://localhost:9001
- **Default Credentials**:
  - Access Key: `minioadmin`
  - Secret Key: `minioadmin`

⚠️ **Important**: Change these credentials in production!

## Environment Variables

Add these to your `.env` file in `apps/api/`:

```env
# Storage type: 'disk' or 'minio'
STORAGE_TYPE=minio

# MinIO Configuration
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=ecommerce
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_USE_SSL=false
```

## Bucket Setup

The bucket will be automatically created when the application starts. The default bucket name is `ecommerce`.

You can also manually create the bucket using the MinIO Console:
1. Go to http://localhost:9001
2. Login with credentials
3. Click "Create Bucket"
4. Enter bucket name: `ecommerce`

## Storage Structure

Files are organized in MinIO as follows:

```
ecommerce/
├── product/
│   ├── original/
│   ├── thumbnail/
│   ├── medium/
│   └── large/
├── banner/
│   ├── original/
│   ├── thumbnail/
│   ├── medium/
│   └── large/
├── category/
│   ├── original/
│   ├── thumbnail/
│   ├── medium/
│   └── large/
└── store/
    ├── original/
    ├── thumbnail/
    ├── medium/
    └── large/
```

## Switching Between Storage Types

To switch between disk storage and MinIO, change the `STORAGE_TYPE` environment variable:

- `STORAGE_TYPE=disk` - Uses local disk storage (default)
- `STORAGE_TYPE=minio` - Uses MinIO object storage

## Production Considerations

1. **Change Default Credentials**: Update `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`
2. **Use SSL**: Set `MINIO_USE_SSL=true` and use HTTPS endpoint
3. **Public URL**: Update `MINIO_PUBLIC_URL` to your public MinIO endpoint or CDN URL
4. **Bucket Policy**: Configure bucket policies for public read access if needed
5. **Backup**: Set up regular backups of MinIO data volume

## Troubleshooting

### Bucket Not Found
If you see errors about bucket not existing:
1. Check MinIO is running: `docker ps | grep minio`
2. Check logs: `docker logs ecommerce-minio`
3. Verify credentials in `.env`
4. Try accessing MinIO Console at http://localhost:9001

### Connection Errors
- Verify `MINIO_ENDPOINT` is correct
- Check if MinIO container is accessible from API container
- If using Docker, ensure both containers are on the same network

### Public URL Issues
- Ensure `MINIO_PUBLIC_URL` is accessible from your frontend
- For production, consider using a CDN or reverse proxy
- Check bucket policy allows public read access if needed

