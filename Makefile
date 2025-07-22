.PHONY: help build up down logs clean gpu cpu auto

# Default target
help:
	@echo "KBFetch Docker Management"
	@echo ""
	@echo "Usage:"
	@echo "  make auto     - Auto-detect GPU and start appropriate services"
	@echo "  make gpu      - Start with GPU acceleration"
	@echo "  make cpu      - Start with CPU only"
	@echo "  make build    - Build Docker images"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - Show service logs"
	@echo "  make clean    - Remove containers and volumes"

# Auto-detect GPU and start appropriate services
auto:
	@if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi >/dev/null 2>&1; then \
		echo "🚀 GPU detected - starting with GPU acceleration"; \
		docker-compose --profile gpu up -d rag_api_gpu; \
	else \
		echo "💻 No GPU detected - starting with CPU only"; \
		docker-compose --profile cpu up -d rag_api; \
	fi

# Start with GPU
gpu:
	@echo "🚀 Starting with GPU acceleration"
	docker-compose --profile gpu up -d rag_api_gpu

# Start with CPU only
cpu:
	@echo "💻 Starting with CPU only"
	docker-compose --profile cpu up -d rag_api

# Build images
build:
	docker-compose build

# Stop services
down:
	docker-compose down

# Show logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f