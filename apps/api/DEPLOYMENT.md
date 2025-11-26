# Deployment Guide - E-commerce Minimart API

## Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 15
- npm or yarn

## Environment Setup

1. **Clone repository và install dependencies:**

```bash
cd apps/api
npm install
```

2. **Setup PostgreSQL database:**

```bash
# Create database
createdb ecommerce_minimart

# Or using psql
psql -U postgres
CREATE DATABASE ecommerce_minimart;
```

3. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` với credentials thực tế:

```env
NODE_ENV=production
PORT=8000
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ecommerce_minimart
JWT_SECRET=your-secure-random-secret
```

## Database Migration & Seeding

```bash
# Generate schema từ entities (lần đầu)
npm run schema:update

# Hoặc sử dụng migrations
npm run migration:create
npm run migration:up

# Seed initial data (admin user, categories, stores)
npm run seed
```

## Build & Start

```bash
# Build production
npm run build

# Start production server
npm run start:prod
```

## Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
```

```bash
docker build -t ecommerce-api .
docker run -p 8000:8000 --env-file .env ecommerce-api
```

## Verification

Test API health:

```bash
curl http://localhost:8000/api
```

Test login:

```bash
curl -X POST http://localhost:8000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@store.vn", "password": "admin123"}'
```

## Swagger Documentation

Access tại: `http://localhost:8000/api/docs` (nếu SWAGGER_ENABLED=true)

## Production Checklist

- [ ] Update JWT_SECRET với giá trị random strong
- [ ] Setup HTTPS/SSL
- [ ] Configure CORS origins đúng
- [ ] Setup database backup
- [ ] Configure logs rotation
- [ ] Setup monitoring (PM2, New Relic, etc)
- [ ] Configure rate limiting phù hợp
- [ ] Disable Swagger trong production (hoặc protect bằng auth)
- [ ] Setup file storage (S3/CDN cho uploads)

## Performance Tips

1. **Database Connection Pooling**: Đã được configure sẵn trong MikroORM
2. **Enable Compression**: Add compression middleware
3. **CDN for Static Files**: Move uploads to S3/CloudFront
4. **Redis Caching**: Uncomment Redis cache config khi có Redis server
5. **Load Balancing**: Use PM2 cluster mode hoặc nginx

## Monitoring

```bash
# Using PM2
npm install -g pm2
pm2 start dist/main.js --name ecommerce-api
pm2 logs ecommerce-api
pm2 monit
```

## Troubleshooting

**Database connection error:**
- Check PostgreSQL is running
- Verify credentials trong .env
- Check firewall/network access

**Module not found:**
- Run `npm install` lại
- Clear node_modules và reinstall

**Upload errors:**
- Check ./uploads directory exists và có write permissions
- Verify MAX_FILE_SIZE setting

## Support

Xem API_SPEC.md để biết full API documentation.

