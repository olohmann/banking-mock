#!/bin/bash

# Banking Mock Services - Complete Deployment Script
# This script orchestrates the full 3-step deployment process

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run 'az login'"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

deploy_infrastructure() {
    print_header "STEP 1: Deploying Infrastructure"
    
    cd terraform/01-infrastructure
    
    print_status "Initializing Terraform..."
    terraform init
    
    print_status "Planning infrastructure deployment..."
    terraform plan -out=tfplan
    
    print_status "Applying infrastructure changes..."
    terraform apply tfplan
    
    print_success "Infrastructure deployment completed"
    cd ../..
}

build_containers() {
    print_header "STEP 2: Building and Pushing Containers"
    
    print_status "Running container build script..."
    ./scripts/build-containers.sh
    
    print_success "Container build and push completed"
}

deploy_container_apps() {
    print_header "STEP 3: Deploying Container Apps"
    
    cd terraform/03-container-apps
    
    print_status "Initializing Terraform..."
    terraform init
    
    # Pass IMAGE_TAG environment variable to Terraform if set
    local terraform_vars=""
    if [[ -n "${IMAGE_TAG:-}" ]]; then
        print_status "Using IMAGE_TAG: $IMAGE_TAG"
        terraform_vars="-var image_tag=$IMAGE_TAG"
    fi
    
    print_status "Planning container apps deployment..."
    terraform plan $terraform_vars -out=tfplan
    
    print_status "Applying container apps changes..."
    terraform apply tfplan
    
    print_success "Container apps deployment completed"
    
    # Display the endpoints
    echo
    print_success "Deployment completed successfully!"
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
    print_header "Banking Mock Services - Complete Deployment"
    
    # Show IMAGE_TAG being used
    local image_tag="${IMAGE_TAG:-latest}"
    print_status "Deploying with image tag: $image_tag"
    echo
    
    # Trap to ensure cleanup on exit
    trap cleanup EXIT
    
    check_prerequisites
    
    # Check if terraform.tfvars files exist
    if [[ ! -f "terraform/01-infrastructure/terraform.tfvars" ]]; then
        print_warning "terraform.tfvars not found in 01-infrastructure/"
        print_status "Copy terraform.tfvars.example to terraform.tfvars and customize as needed"
        if [[ ! -f "terraform/01-infrastructure/terraform.tfvars.example" ]]; then
            print_error "terraform.tfvars.example not found"
            exit 1
        fi
        cp terraform/01-infrastructure/terraform.tfvars.example terraform/01-infrastructure/terraform.tfvars
        print_status "Created terraform.tfvars from example. Please review and modify if needed."
    fi
    
    if [[ ! -f "terraform/03-container-apps/terraform.tfvars" ]]; then
        print_warning "terraform.tfvars not found in 03-container-apps/"
        if [[ ! -f "terraform/03-container-apps/terraform.tfvars.example" ]]; then
            print_error "terraform.tfvars.example not found"
            exit 1
        fi
        cp terraform/03-container-apps/terraform.tfvars.example terraform/03-container-apps/terraform.tfvars
        print_status "Created terraform.tfvars from example. Please review and modify if needed."
    fi
    
    # Execute deployment steps
    deploy_infrastructure
    build_containers
    deploy_container_apps
    
    print_success "All deployment steps completed successfully!"
    echo
    print_status "Your Banking Mock Services are now running in Azure Container Apps"
    print_status "Check the Azure portal for monitoring and logs"
}

# Show usage if help is requested
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Banking Mock Services - Complete Deployment Script"
    echo
    echo "This script performs a complete 3-step deployment:"
    echo "  1. Deploy infrastructure (Resource Group + Container Registry)"
    echo "  2. Build and push Docker containers"
    echo "  3. Deploy Container Apps with HTTPS endpoints"
    echo
    echo "Usage: $0"
    echo
    echo "Environment Variables:"
    echo "  IMAGE_TAG  - Docker image tag to build and deploy (default: latest)"
    echo
    echo "Examples:"
    echo "  $0                    # Deploy with 'latest' tag"
    echo "  IMAGE_TAG=v1.2.3 $0   # Deploy with specific tag"
    echo
    echo "Prerequisites:"
    echo "  - Azure CLI installed and logged in (az login)"
    echo "  - Terraform installed"
    echo "  - Docker installed and running"
    echo
    echo "The script will use terraform.tfvars files for configuration."
    echo "If they don't exist, example files will be copied automatically."
    echo
    exit 0
fi

# Run main function
main "$@"
