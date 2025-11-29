# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from root (context is root)
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY packages ./packages

# Copy API package files
COPY apps/api/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api/ .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files from root (context is root)
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY packages ./packages

# Copy API package files
COPY apps/api/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/mikro-orm.config.js ./mikro-orm.config.js

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]


