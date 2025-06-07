#!/bin/bash

# Banking Mock Services - Container Build and Push Script
# This script builds Docker images and pushes them to Azure Container Registry

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ACR_NAME="${ACR_NAME:-}"
RESOURCE_GROUP="${RESOURCE_GROUP:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# Service definitions
declare -A SERVICES=(
    ["banking-assistant"]="banking-assistant"
    ["banking-brokerage"]="banking-brokerage"
)

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

check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
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
    
    print_success "Prerequisites check passed"
}

get_acr_info() {
    if [[ -z "$ACR_NAME" ]] || [[ -z "$RESOURCE_GROUP" ]]; then
        print_status "Retrieving ACR information from Terraform output..."
        
        if [[ -f "terraform/01-infrastructure/terraform.tfstate" ]]; then
            ACR_NAME=$(cd terraform/01-infrastructure && terraform output -raw acr_name 2>/dev/null || echo "")
            RESOURCE_GROUP=$(cd terraform/01-infrastructure && terraform output -raw resource_group_name 2>/dev/null || echo "")
        fi
        
        if [[ -z "$ACR_NAME" ]] || [[ -z "$RESOURCE_GROUP" ]]; then
            print_error "Could not determine ACR_NAME and RESOURCE_GROUP"
            print_error "Please set environment variables or ensure Terraform state exists"
            print_error "Example: export ACR_NAME=acrbankingmock RESOURCE_GROUP=rg-banking-mock"
            exit 1
        fi
    fi
    
    print_status "Using ACR: $ACR_NAME in Resource Group: $RESOURCE_GROUP"
}

login_to_acr() {
    print_status "Logging in to Azure Container Registry..."
    
    if ! az acr login --name "$ACR_NAME" &> /dev/null; then
        print_error "Failed to login to ACR: $ACR_NAME"
        exit 1
    fi
    
    print_success "Successfully logged in to ACR"
}

build_and_push_service() {
    local service_name=$1
    local service_dir=$2
    local acr_login_server
    
    print_status "Building and pushing $service_name..."
    
    # Get ACR login server
    acr_login_server=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
    
    if [[ -z "$acr_login_server" ]]; then
        print_error "Could not retrieve ACR login server"
        return 1
    fi
    
    local image_name="$acr_login_server/$service_name:$IMAGE_TAG"
    
    # Build the Docker image for Linux platform (ensures compatibility with Azure Container Apps)
    print_status "Building Docker image: $image_name"
    if ! docker build --platform linux/amd64 -t "$image_name" "./$service_dir"; then
        print_error "Failed to build Docker image for $service_name"
        return 1
    fi
    
    # Push the Docker image
    print_status "Pushing Docker image: $image_name"
    if ! docker push "$image_name"; then
        print_error "Failed to push Docker image for $service_name"
        return 1
    fi
    
    print_success "Successfully built and pushed $service_name"
    echo "  Image: $image_name"
}

main() {
    print_status "Starting Banking Mock Services container build process..."
    echo
    
    # Check prerequisites
    check_prerequisites
    echo
    
    # Get ACR information
    get_acr_info
    echo
    
    # Login to ACR
    login_to_acr
    echo
    
    # Build and push each service
    for service_name in "${!SERVICES[@]}"; do
        service_dir="${SERVICES[$service_name]}"
        
        if [[ ! -d "$service_dir" ]]; then
            print_warning "Service directory not found: $service_dir, skipping..."
            continue
        fi
        
        if [[ ! -f "$service_dir/Dockerfile" ]]; then
            print_warning "Dockerfile not found in $service_dir, skipping..."
            continue
        fi
        
        build_and_push_service "$service_name" "$service_dir"
        echo
    done
    
    print_success "Container build process completed successfully!"
    echo
    print_status "Next steps:"
    echo "  1. Run terraform in 03-container-apps to deploy the applications"
    echo "  2. Access the services via the provided HTTPS endpoints"
}

# Show usage if help is requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Banking Mock Services - Container Build Script"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Environment Variables:"
    echo "  ACR_NAME        - Azure Container Registry name (auto-detected from Terraform)"
    echo "  RESOURCE_GROUP  - Azure Resource Group name (auto-detected from Terraform)"
    echo "  IMAGE_TAG       - Docker image tag (default: latest)"
    echo
    echo "Examples:"
    echo "  $0                                    # Use auto-detected settings"
    echo "  IMAGE_TAG=v1.2.3 $0                 # Use specific tag"
    echo "  ACR_NAME=myacr RESOURCE_GROUP=myrg $0 # Override ACR settings"
    echo
    exit 0
fi

# Run main function
main "$@"
