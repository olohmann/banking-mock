#!/bin/bash

# Azure Container Registry and Container Instances Deployment Script
# This script builds Docker images, pushes them to ACR, and deploys to ACI

set -e

# Configuration - Update these values for your environment
RESOURCE_GROUP="rg-banking-mock"
LOCATION="northeurope"
ACR_NAME="acrbankingmock23" 
CONTAINER_GROUP_NAME="ci-banking-mock"

# Application configuration
BANKING_ASSISTANT_IMAGE="banking-assistant"
BANKING_BROKERAGE_IMAGE="banking-brokerage"
BANKING_ASSISTANT_PORT=3001
BANKING_BROKERAGE_PORT=3002

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    log_info "Prerequisites check passed"
}

# Create Azure resources
create_azure_resources() {
    log_info "Creating Azure resources..."
    
    # Create resource group
    log_info "Creating resource group: $RESOURCE_GROUP"
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output table
    
    # Create Azure Container Registry
    log_info "Creating Azure Container Registry: $ACR_NAME"
    az acr create \
        --resource-group "$RESOURCE_GROUP" \
        --name "$ACR_NAME" \
        --sku Basic \
        --admin-enabled true \
        --output table
    
    # Get ACR login server
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer --output tsv)
    log_info "ACR Login Server: $ACR_LOGIN_SERVER"
}

# Build and push Docker images using ACR Tasks
build_and_push_images() {
    log_info "Building and pushing Docker images using ACR Tasks..."
    
    # Get ACR login server
    ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer --output tsv)
    log_info "ACR Login Server: $ACR_LOGIN_SERVER"
    
    # Build and push banking-assistant image using ACR Tasks
    log_info "Building banking-assistant image in ACR..."
    az acr build \
        --registry "$ACR_NAME" \
        --image "$BANKING_ASSISTANT_IMAGE:latest" \
        --file "./banking-assistant/Dockerfile" \
        "./banking-assistant/"
    
    # Build and push banking-brokerage image using ACR Tasks
    log_info "Building banking-brokerage image in ACR..."
    az acr build \
        --registry "$ACR_NAME" \
        --image "$BANKING_BROKERAGE_IMAGE:latest" \
        --file "./banking-brokerage/Dockerfile" \
        "./banking-brokerage/"
    
    log_info "Images built and pushed successfully to ACR"
}

# Deploy to Azure Container Instances
deploy_to_aci() {
    log_info "Deploying to Azure Container Instances..."
    
    # Get ACR credentials
    ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username --output tsv)
    ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query passwords[0].value --output tsv)
    
    # Create container group with both services
    log_info "Creating container group: $CONTAINER_GROUP_NAME"
    
    # Deploy banking-assistant container
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "ci-banking-assistant" \
        --image "$ACR_LOGIN_SERVER/$BANKING_ASSISTANT_IMAGE:latest" \
        --registry-login-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --dns-name-label "banking-assistant-$(date +%s | tail -c 6)" \
        --ports "$BANKING_ASSISTANT_PORT" \
        --environment-variables \
            PORT="$BANKING_ASSISTANT_PORT" \
            NODE_ENV=production \
        --cpu 1 \
        --memory 1 \
        --restart-policy Always \
        --os-type Linux \
        --output table
    
    # Deploy banking-brokerage container
    az container create \
        --resource-group "$RESOURCE_GROUP" \
        --name "ci-banking-brokerage" \
        --image "$ACR_LOGIN_SERVER/$BANKING_BROKERAGE_IMAGE:latest" \
        --registry-login-server "$ACR_LOGIN_SERVER" \
        --registry-username "$ACR_USERNAME" \
        --registry-password "$ACR_PASSWORD" \
        --dns-name-label "banking-brokerage-$(date +%s | tail -c 6)" \
        --ports "$BANKING_BROKERAGE_PORT" \
        --environment-variables \
            PORT="$BANKING_BROKERAGE_PORT" \
            NODE_ENV=production \
        --cpu 1 \
        --memory 1 \
        --restart-policy Always \
        --os-type Linux \
        --output table
}

# Get deployment information
get_deployment_info() {
    log_info "Getting deployment information..."
    
    # Get banking-assistant URL
    ASSISTANT_FQDN=$(az container show \
        --resource-group "$RESOURCE_GROUP" \
        --name "ci-banking-assistant" \
        --query ipAddress.fqdn \
        --output tsv)
    
    # Get banking-brokerage URL
    BROKERAGE_FQDN=$(az container show \
        --resource-group "$RESOURCE_GROUP" \
        --name "ci-banking-brokerage" \
        --query ipAddress.fqdn \
        --output tsv)
    
    echo ""
    log_info "=== DEPLOYMENT COMPLETE ==="
    echo ""
    log_info "Banking Assistant API: http://$ASSISTANT_FQDN:$BANKING_ASSISTANT_PORT"
    log_info "Banking Brokerage API: http://$BROKERAGE_FQDN:$BANKING_BROKERAGE_PORT"
    echo ""
    log_info "Swagger UI endpoints:"
    log_info "- Banking Assistant: http://$ASSISTANT_FQDN:$BANKING_ASSISTANT_PORT/api-docs"
    log_info "- Banking Brokerage: http://$BROKERAGE_FQDN:$BANKING_BROKERAGE_PORT/api-docs"
    echo ""
    log_info "Azure Container Registry: $ACR_LOGIN_SERVER"
    log_info "Resource Group: $RESOURCE_GROUP"
    echo ""
}

# Cleanup function (optional)
cleanup() {
    log_warn "To clean up resources, run:"
    echo "az group delete --name $RESOURCE_GROUP --yes --no-wait"
}

# Main execution
main() {
    log_info "Starting Azure deployment for Banking Mock Services"
    echo ""
    
    check_prerequisites
    create_azure_resources
    build_and_push_images
    deploy_to_aci
    get_deployment_info
    
    echo ""
    log_info "Deployment completed successfully!"
    echo ""
    cleanup
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"
