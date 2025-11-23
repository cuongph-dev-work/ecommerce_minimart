# E-commerce Admin Dashboard

Admin dashboard cho hệ thống e-commerce minimart, được xây dựng với React + TypeScript + Vite.

## Setup

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Environment
VITE_NODE_ENV=development
```

**Lưu ý:** 
- `VITE_API_URL`: URL của API backend (mặc định: `http://localhost:3001/api`)
- Đảm bảo backend API đang chạy trước khi start admin dashboard

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5174`

### 4. Build cho production

```bash
npm run build
```

## Cấu trúc dự án

```
src/
├── components/     # UI components
├── contexts/       # React contexts (Auth, etc.)
├── hooks/          # Custom hooks
├── layouts/        # Layout components
├── lib/            # Utilities (api-client, utils)
├── pages/          # Page components
├── services/       # API services
└── types/          # TypeScript types
```

## API Integration

Tất cả API calls được xử lý qua `api-client.ts` với:
- JWT token authentication
- Error handling tự động
- Auto redirect to login khi 401

## Default Login

- Email: `admin@store.vn`
- Password: `admin123`

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **i18next** - Internationalization
