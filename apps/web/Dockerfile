# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from root (context is root)
COPY package.json package-lock.json ./
COPY turbo.json ./
COPY packages ./packages

# Copy Web package files
COPY apps/web/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/web/ .

# Build application
ENV NODE_ENV=production
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Configure Nginx for SPA serving
RUN rm /etc/nginx/conf.d/default.conf && \
    cat << 'EOF' > /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
EOF

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]


