# 🚀 Quick Start - API Server

## ✅ Setup đã hoàn thành

1. ✅ **PostgreSQL Database** - Đã chạy trong Docker
2. ✅ **Environment Variables** - File `.env` đã được tạo
3. ✅ **Database Schema** - Đã tạo tables từ entities
4. ✅ **Seed Data** - Admin user, categories, stores đã được seed

## 🎯 Chạy API Server

```bash
cd apps/api
npm run dev
```

Server sẽ chạy tại: **http://localhost:3001**

## 🔑 Default Login Credentials

- **Email**: `admin@store.vn`
- **Password**: `admin123`

## 📚 API Endpoints

### Swagger Documentation
Truy cập: **http://localhost:3001/api/docs**

### Test Login
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@store.vn", "password": "admin123"}'
```

## 🛠️ Useful Commands

```bash
# Start/Stop Database
npm run db:up      # Start PostgreSQL
npm run db:down    # Stop PostgreSQL
npm run db:logs    # View logs

# Development
npm run dev        # Start với watch mode
npm run build      # Build production
npm run start:prod # Start production

# Database
npm run schema:update  # Update schema
npm run seed           # Seed data
```

## 📝 Next Steps

1. ✅ API server đã sẵn sàng
2. 📖 Xem `API_SPEC.md` để biết full API endpoints
3. 🔐 Đổi `JWT_SECRET` trong `.env` cho production
4. 🎨 Connect với frontend admin panel

## ⚠️ Troubleshooting

**Port 3001 đã được sử dụng:**
- Đổi `PORT` trong `.env`

**Database connection error:**
```bash
# Kiểm tra container
docker ps | grep postgres

# Restart nếu cần
docker-compose restart postgres
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

