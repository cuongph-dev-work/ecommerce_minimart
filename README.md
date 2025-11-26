# E-commerce Minimart - Turborepo Monorepo

A modern e-commerce platform built with Turborepo, featuring a React frontend and NestJS backend.

## 🏗️ Project Structure

```
ecommerce_minimart/
├── apps/
│   ├── web/          # React + Vite frontend (Tailwind CSS v4)
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
- **Web App**: http://localhost:3000 (Vite dev server)
- **API**: http://localhost:8000 (NestJS server)

Run individual apps:

```bash
# Web app only
npm run dev --filter=@ecommerce/web

# API only
npm run dev --filter=@ecommerce/api
```

### Build

Build all applications:

```bash
npm run build
```

Build individual apps:

```bash
# Web app only
npm run build --filter=@ecommerce/web

# API only
npm run build --filter=@ecommerce/api
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

### Web App (`apps/web`)

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Routing**: React Router v6

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

- CORS is enabled on the API for `localhost:5173` and `localhost:3000`
- Turborepo caching is configured for optimal build performance

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Run `npm run lint` and `npm run check-types`
4. Submit a pull request

## 📄 License

Private - All rights reserved
