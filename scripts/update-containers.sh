#!/usr/bin/env bash

# Banking Mock Services - Container Update Script
# This script updates existing Container Apps with new Docker images

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_TAG="${IMAGE_TAG:-latest}"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed or not in PATH"
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run 'az login'"
        exit 1
    fi
    
    # Check if container apps terraform directory exists
    if [[ ! -d "terraform/03-container-apps" ]]; then
        print_error "Container apps terraform directory not found"
        print_error "Make sure you're running this from the project root"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

build_containers() {
    print_header "STEP 1: Building and Pushing Containers"
    
    print_status "Running container build script with tag: $IMAGE_TAG"
    export IMAGE_TAG="$IMAGE_TAG"
    ./scripts/build-containers.sh
    
    print_success "Container build and push completed"
}

update_container_apps() {
    print_header "STEP 2: Updating Container Apps"
    
    cd terraform/03-container-apps
    
    print_status "Initializing Terraform..."
    terraform init
    
    print_status "Using image tag: $IMAGE_TAG"
    print_status "BASE_URL will be automatically configured for each container app"
    
    print_status "Planning container apps update..."
    terraform plan -var "image_tag=$IMAGE_TAG" -out=tfplan
    
    print_status "Applying container apps changes..."
    terraform apply tfplan
    
    print_success "Container apps update completed"
    
    # Display the endpoints
    echo
    print_success "Update completed successfully!"
    echo
    print_status "Service endpoints:"
    terraform output -raw banking_assistant_fqdn
    terraform output -raw banking_brokerage_fqdn
    
    cd ../..
}

cleanup() {
    print_status "Cleaning up temporary files..."
    find terraform -name "tfplan" -delete 2>/dev/null || true
}

main() {
    print_header "Banking Mock Services - Container Update"
    
    print_status "Updating containers with image tag: $IMAGE_TAG"
    echo
    
    # Trap to ensure cleanup on exit
    trap cleanup EXIT
    
    check_prerequisites
    
    # Check if terraform.tfvars exists for container apps
    if [[ ! -f "terraform/03-container-apps/terraform.tfvars" ]]; then
        print_error "terraform.tfvars not found in 03-container-apps/"
        print_error "Please run the full deployment script first or copy from terraform.tfvars.example"
        exit 1
    fi
    
    # Execute update steps
    build_containers
    update_container_apps
    
    print_success "Container update completed successfully!"
    echo
    print_status "Your Banking Mock Services are now running with image tag: $IMAGE_TAG"
    print_status "Check the Azure portal for monitoring and logs"
}

# Show usage if help is requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Banking Mock Services - Container Update Script"
    echo
    echo "This script updates existing Container Apps with new Docker images:"
    echo "  1. Build and push Docker containers with specified tag"
    echo "  2. Update Container Apps to use the new images"
    echo
    echo "Usage: $0"
    echo
    echo "Environment Variables:"
    echo "  IMAGE_TAG  - Docker image tag to build and deploy (default: latest)"
    echo
    echo "Examples:"
    echo "  $0                    # Update with 'latest' tag" 
    echo "  IMAGE_TAG=v1.2.3 $0   # Update with specific tag"
    echo
    echo "Prerequisites:"
    echo "  - Infrastructure must already be deployed"
    echo "  - Azure CLI installed and logged in (az login)"
    echo "  - Terraform installed"
    echo "  - Docker installed and running"
    echo
    exit 0
fi

# Run main function
main "$@"
