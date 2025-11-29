# E-commerce Minimart - Turborepo Monorepo

A modern e-commerce platform built with Turborepo, featuring a React frontend and NestJS backend.

## 🏗️ Project Structure

```
ecommerce_minimart/
├── apps/
│   ├── web_ssr/      # Next.js SSR frontend (Tailwind CSS v4)
│   ├── admin/        # React Admin Panel
│   └── api/          # NestJS backend API
├── packages/         # Shared packages (if any)
└── turbo.json        # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm 10.9.2 or higher

### Installation

```bash
npm install
```

### Development

Run both applications in development mode:

```bash
npm run dev
```

This will start:
- **Web App (SSR)**: http://localhost:3000 (Next.js dev server)
- **API**: http://localhost:8000 (NestJS server)
- **Admin**: http://localhost:5174 (Vite dev server)

Run individual apps:

```bash
# Web app (SSR) only
npm run dev --filter=@ecommerce/web-ssr

# API only
npm run dev --filter=@ecommerce/api

# Admin only
npm run dev --filter=@ecommerce/admin
```

### Build

Build all applications:

```bash
npm run build
```

Build individual apps:

```bash
# Web app (SSR) only
npm run build --filter=@ecommerce/web-ssr

# API only
npm run build --filter=@ecommerce/api

# Admin only
npm run build --filter=@ecommerce/admin
```

### Other Commands

```bash
# Lint all apps
npm run lint

# Type check all apps
npm run check-types

# Format code
npm run format
```

## 📦 Applications

### Web App (`apps/web_ssr`)

- **Framework**: Next.js 15 (App Router)
- **Rendering**: Server-Side Rendering (SSR)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **i18n**: react-i18next

### Admin Panel (`apps/admin`)

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React

### API (`apps/api`)

- **Framework**: NestJS 10
- **Runtime**: Node.js
- **Language**: TypeScript
- **Port**: 8000

**Endpoints**:
- `GET /` - Welcome message
- `GET /health` - Health check

## 🔧 Technology Stack

- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **TypeScript**: 5.x
- **Testing**: Jest (API)

## 📝 Development Notes

- CORS is enabled on the API for `localhost:3000`, `localhost:5173`, and `localhost:5174`
- Turborepo caching is configured for optimal build performance
- Web app uses Next.js SSR for better SEO and performance

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Run `npm run lint` and `npm run check-types`
4. Submit a pull request

## 📄 License

Private - All rights reserved
