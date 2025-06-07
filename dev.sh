#!/bin/bash

# Local Development Script for Banking Mock Services

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to start services
start_services() {
    log_info "Starting Banking Mock Services locally..."
    check_docker
    
    # Build and start services
    docker-compose up --build -d
    
    log_info "Services starting..."
    sleep 10
    
    # Check if services are healthy
    log_info "Checking service health..."
    
    # Wait for services to be ready
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3001/api/health >/dev/null 2>&1 && \
           curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
            break
        fi
        
        log_warn "Waiting for services to be ready... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Services failed to start properly"
        docker-compose logs
        exit 1
    fi
    
    echo ""
    log_info "=== Services are ready! ==="
    echo ""
    log_info "Banking Assistant API: http://localhost:3001"
    log_info "Banking Brokerage API: http://localhost:3002"
    echo ""
    log_info "Swagger UI:"
    log_info "- Banking Assistant: http://localhost:3001/api-docs"
    log_info "- Banking Brokerage: http://localhost:3002/api-docs"
    echo ""
    log_info "To view logs: docker-compose logs -f"
    log_info "To stop services: ./dev.sh stop"
    echo ""
}

# Function to stop services
stop_services() {
    log_info "Stopping Banking Mock Services..."
    docker-compose down
    log_info "Services stopped"
}

# Function to restart services
restart_services() {
    log_info "Restarting Banking Mock Services..."
    docker-compose restart
    log_info "Services restarted"
}

# Function to view logs
view_logs() {
    log_info "Viewing service logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to clean up
cleanup() {
    log_info "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    log_info "Cleanup complete"
}

# Function to show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    echo ""
    
    # Check health endpoints
    log_info "Health Check Results:"
    
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        echo -e "Banking Assistant: ${GREEN}✓ Healthy${NC}"
    else
        echo -e "Banking Assistant: ${RED}✗ Unhealthy${NC}"
    fi
    
    if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
        echo -e "Banking Brokerage: ${GREEN}✓ Healthy${NC}"
    else
        echo -e "Banking Brokerage: ${RED}✗ Unhealthy${NC}"
    fi
}

# Function to run tests
run_tests() {
    log_info "Running tests in containers..."
    
    # Test banking-assistant
    docker-compose exec banking-assistant pnpm test
    
    # Test banking-brokerage  
    docker-compose exec banking-brokerage pnpm test
    
    log_info "Tests completed"
}

# Show usage
show_usage() {
    echo "Banking Mock Services - Development Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start services (default)"
    echo "  stop      Stop services"
    echo "  restart   Restart services"
    echo "  logs      View service logs"
    echo "  status    Show service status"
    echo "  test      Run tests"
    echo "  cleanup   Clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
}

# Main execution
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        view_logs
        ;;
    "status")
        show_status
        ;;
    "test")
        run_tests
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
