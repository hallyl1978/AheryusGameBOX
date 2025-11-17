#!/bin/bash

# AheryusGameBOX - Quick Setup Script
# This script helps you set up the development environment

set -e

echo "🎮 AheryusGameBOX - Quick Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check requirements
echo "📋 Checking requirements..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js >= 20.x"
    exit 1
fi

# Flutter
if command -v flutter &> /dev/null; then
    FLUTTER_VERSION=$(flutter --version | head -n 1)
    echo -e "${GREEN}✓${NC} Flutter: $FLUTTER_VERSION"
else
    echo -e "${YELLOW}!${NC} Flutter not found (optional for backend only)"
fi

# PostgreSQL or Supabase
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓${NC} PostgreSQL: $PSQL_VERSION"
else
    echo -e "${YELLOW}!${NC} PostgreSQL not found (you can use Supabase)"
fi

echo ""
echo "📦 Setting up project..."

# Create .env file if not exists
if [ ! -f "Project/config/env/.env.local" ]; then
    echo "Creating .env.local from template..."
    cp Project/config/env/.env.example Project/config/env/.env.local
    echo -e "${YELLOW}!${NC} Please edit Project/config/env/.env.local with your Supabase credentials"
else
    echo -e "${GREEN}✓${NC} .env.local already exists"
fi

# Install backend dependencies
echo ""
read -p "Install backend dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing NestJS CLI..."
    npm install -g @nestjs/cli

    echo "Creating backend project..."
    cd Project/src

    if [ ! -d "backend" ]; then
        nest new backend --skip-git
    else
        echo -e "${GREEN}✓${NC} Backend project already exists"
    fi

    cd backend

    echo "Installing dependencies..."
    npm install @supabase/supabase-js
    npm install @nestjs/websockets @nestjs/platform-socket.io
    npm install @nestjs/config

    # Copy services
    if [ ! -d "src/services" ]; then
        echo "Copying service files..."
        cp -r ../backend/services src/
    fi

    cd ../../../

    echo -e "${GREEN}✓${NC} Backend setup complete"
fi

# Install frontend dependencies
echo ""
read -p "Install frontend dependencies? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v flutter &> /dev/null; then
        cd Project/src/frontend

        echo "Installing Flutter dependencies..."
        flutter pub get

        # Copy locale files
        echo "Copying locale files..."
        mkdir -p assets/locales
        cp -r ../../locales/* assets/locales/

        cd ../../../

        echo -e "${GREEN}✓${NC} Frontend setup complete"
    else
        echo -e "${RED}✗${NC} Flutter not installed, skipping frontend setup"
    fi
fi

# Database setup
echo ""
read -p "Setup database schema? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Database setup options:"
    echo "1. Supabase (recommended)"
    echo "2. Local PostgreSQL"
    read -p "Choose option (1 or 2): " -n 1 -r
    echo

    if [[ $REPLY == "1" ]]; then
        echo ""
        echo "📝 Supabase Setup Instructions:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Create a new project or select existing"
        echo "3. Go to SQL Editor"
        echo "4. Run the following files in order:"
        echo "   - Project/config/schema/initial_schema.sql"
        echo "   - Project/config/schema/advanced_features_schema.sql"
        echo "   - Project/config/schema/i18n_schema.sql"
        echo "5. Update Project/config/env/.env.local with your credentials"
    elif [[ $REPLY == "2" ]]; then
        read -p "Enter database name (default: aheryusgamebox): " DB_NAME
        DB_NAME=${DB_NAME:-aheryusgamebox}

        echo "Creating database..."
        createdb $DB_NAME || echo "Database might already exist"

        echo "Running schema files..."
        psql -U postgres -d $DB_NAME < Project/config/schema/initial_schema.sql
        psql -U postgres -d $DB_NAME < Project/config/schema/advanced_features_schema.sql
        psql -U postgres -d $DB_NAME < Project/config/schema/i18n_schema.sql

        echo -e "${GREEN}✓${NC} Database schema created"
    fi
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit Project/config/env/.env.local with your credentials"
echo "2. Start backend: cd Project/src/backend && npm run start:dev"
echo "3. Start frontend: cd Project/src/frontend && flutter run"
echo ""
echo "For more information, see README.md"
