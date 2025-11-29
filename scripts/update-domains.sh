#!/bin/bash

# Script để cập nhật domain trong nginx config
# Usage: ./scripts/update-domains.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
WEB_DOMAIN=${WEB_DOMAIN:-localhost}
ADMIN_DOMAIN=${ADMIN_DOMAIN:-admin.localhost}
API_DOMAIN=${API_DOMAIN:-api.localhost}
ASSETS_DOMAIN=${ASSETS_DOMAIN:-assets.localhost}

echo "Updating nginx config with domains:"
echo "  Web: $WEB_DOMAIN"
echo "  Admin: $ADMIN_DOMAIN"
echo "  API: $API_DOMAIN"
echo "  Assets: $ASSETS_DOMAIN"

# Create nginx config from template
envsubst '${WEB_DOMAIN} ${ADMIN_DOMAIN} ${API_DOMAIN} ${ASSETS_DOMAIN}' < nginx/nginx.conf.template > nginx/nginx.conf

echo "✅ Nginx config updated successfully!"
echo "📝 Review nginx/nginx.conf before deploying"


