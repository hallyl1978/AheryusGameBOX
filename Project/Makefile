# AheryusGameBOX - Makefile for easy project management

.PHONY: help install dev prod build test clean docker-dev docker-prod docker-down logs

# Default target
help:
	@echo "AheryusGameBOX - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install        - Install all dependencies"
	@echo "  make dev            - Run development server"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linter"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-dev     - Start development environment with Docker"
	@echo "  make docker-prod    - Start production environment with Docker"
	@echo "  make docker-down    - Stop all Docker containers"
	@echo "  make logs           - View Docker logs"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build          - Build for production"
	@echo "  make prod           - Run production server"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make setup-env      - Copy .env.example to .env"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd Project/src/backend && npm install
	@echo "Installing frontend dependencies..."
	cd Project/src/frontend && flutter pub get
	@echo "✓ All dependencies installed"

# Setup environment file
setup-env:
	@if [ ! -f Project/config/env/.env ]; then \
		cp Project/config/env/.env.example Project/config/env/.env; \
		echo "✓ Created .env file from .env.example"; \
		echo "⚠ Please update .env with your actual values"; \
	else \
		echo ".env file already exists"; \
	fi

# Development
dev:
	@echo "Starting development server..."
	cd Project/src/backend && npm run start:dev

# Production build
build:
	@echo "Building backend for production..."
	cd Project/src/backend && npm run build
	@echo "Building frontend for production..."
	cd Project/src/frontend && flutter build web
	@echo "✓ Build completed"

# Production server
prod:
	@echo "Starting production server..."
	cd Project/src/backend && npm run start:prod

# Tests
test:
	@echo "Running backend tests..."
	cd Project/src/backend && npm run test
	@echo "Running frontend tests..."
	cd Project/src/frontend && flutter test
	@echo "✓ All tests completed"

# Linting
lint:
	@echo "Running backend linter..."
	cd Project/src/backend && npm run lint
	@echo "Running frontend linter..."
	cd Project/src/frontend && flutter analyze
	@echo "✓ Linting completed"

# Docker Development
docker-dev:
	@echo "Starting development environment with Docker..."
	docker-compose -f Project/docker-compose.dev.yml up -d
	@echo "✓ Development environment started"
	@echo "Backend: http://localhost:3000"
	@echo "Redis Commander: http://localhost:8081 (run with --profile with-tools)"

# Docker Production
docker-prod:
	@echo "Starting production environment with Docker..."
	docker-compose -f Project/docker-compose.yml up -d
	@echo "✓ Production environment started"
	@echo "Backend: http://localhost:3000"

# Stop Docker containers
docker-down:
	@echo "Stopping Docker containers..."
	docker-compose -f Project/docker-compose.yml down
	docker-compose -f Project/docker-compose.dev.yml down
	@echo "✓ All containers stopped"

# View Docker logs
logs:
	docker-compose -f Project/docker-compose.dev.yml logs -f

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf Project/src/backend/dist
	rm -rf Project/src/backend/node_modules
	rm -rf Project/src/frontend/build
	@echo "✓ Clean completed"

# Database migrations
db-migrate:
	@echo "Running database migrations..."
	cd Project && supabase db push
	@echo "✓ Migrations completed"

# Database seed
db-seed:
	@echo "Seeding database..."
	cd Project/src/backend && npm run db:seed
	@echo "✓ Database seeded"

# Generate types from Supabase
db-types:
	@echo "Generating Supabase types..."
	cd Project && supabase gen types typescript --local > src/backend/src/types/supabase.ts
	@echo "✓ Types generated"
