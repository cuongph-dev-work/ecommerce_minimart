#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up E-commerce API...${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check if database is running
echo -e "\n${YELLOW}🔍 Checking database connection...${NC}"
if docker ps | grep -q ecommerce-postgres; then
    echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL container not found. Starting it...${NC}"
    cd ../..
    docker-compose up -d postgres
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    sleep 5
    cd apps/api
fi

# Setup database schema
echo -e "\n${YELLOW}🗄️  Setting up database schema...${NC}"
npm run schema:update

# Seed database
echo -e "\n${YELLOW}🌱 Seeding database...${NC}"
npm run seed

echo -e "\n${GREEN}✨ Setup completed!${NC}\n"
echo -e "${GREEN}📝 Default credentials:${NC}"
echo -e "   Email: ${YELLOW}admin@store.vn${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}\n"
echo -e "${GREEN}🚀 Start server with:${NC}"
echo -e "   ${YELLOW}npm run dev${NC}\n"

