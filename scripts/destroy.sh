#!/bin/bash

# Banking Mock Services - Cleanup/Destroy Script
# This script destroys all Azure resources created by the deployment

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

destroy_container_apps() {
    print_status "Destroying Container Apps..."
    
    if [[ -d "terraform/03-container-apps" ]] && [[ -f "terraform/03-container-apps/terraform.tfstate" ]]; then
        cd terraform/03-container-apps
        terraform destroy -auto-approve
        cd ../..
        print_success "Container Apps destroyed"
    else
        print_warning "No Container Apps state found, skipping..."
    fi
}

destroy_infrastructure() {
    print_status "Destroying Infrastructure..."
    
    if [[ -d "terraform/01-infrastructure" ]] && [[ -f "terraform/01-infrastructure/terraform.tfstate" ]]; then
        cd terraform/01-infrastructure
        terraform destroy -auto-approve
        cd ../..
        print_success "Infrastructure destroyed"
    else
        print_warning "No Infrastructure state found, skipping..."
    fi
}

main() {
    echo -e "${RED}WARNING: This will destroy all Azure resources created by the Banking Mock deployment!${NC}"
    echo
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Aborted by user"
        exit 0
    fi
    
    print_status "Starting destruction process..."
    
    # Destroy in reverse order
    destroy_container_apps
    destroy_infrastructure
    
    print_success "All resources have been destroyed"
}

main "$@"
