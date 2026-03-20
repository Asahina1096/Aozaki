#!/bin/bash

# Komari Theme Build Script
# This script builds the theme package

set -e

echo "======================================"
echo "  Komari Theme Package Builder"
echo "======================================"
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_success() {
    echo -e "${GREEN} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW} $1${NC}"
}

# Check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v bun &> /dev/null; then
        print_error "bun is not installed"
        exit 1
    fi
    
    if ! command -v zip &> /dev/null; then
        print_error "zip is not installed"
        exit 1
    fi
    
    print_success "All dependencies available"
}

# Build project
build_project() {
    echo "Building project..."
    bun run build
    print_success "Project built successfully"
}

# Verify files
verify_files() {
    echo "Verifying required files..."
    
    if [ ! -f "preview.png" ]; then
        print_error "preview.png not found"
        exit 1
    fi
    
    if [ ! -f "komari-theme.json" ]; then
        print_error "komari-theme.json not found"
        exit 1
    fi
    
    if [ ! -d "dist" ]; then
        print_error "dist/ directory not found"
        exit 1
    fi
    
    print_success "All required files found"
}

# Create package
create_package() {
    echo "Creating theme package..."
    
    VERSION_DATE=$(date +"%y.%m.%d")
    if git rev-parse --short HEAD &> /dev/null; then
        COMMIT_HASH=$(git rev-parse --short HEAD)
    else
        COMMIT_HASH="dev"
    fi
    
    # Create temp directory
    rm -rf theme-package
    mkdir -p theme-package
    
    # Copy files
    cp preview.png theme-package/
    cp komari-theme.json theme-package/
    cp -r dist/ theme-package/
    
    # Create zip
    ZIP_NAME="komari-theme-v${VERSION_DATE}-${COMMIT_HASH}.zip"
    
    cd theme-package
    zip -r "../dist/${ZIP_NAME}" .
    cd ..
    
    # Cleanup
    rm -rf theme-package
    
    print_success "Created: dist/${ZIP_NAME}"
}

# Main
main() {
    check_dependencies
    echo
    build_project
    echo
    verify_files
    echo
    create_package
    echo
    print_success "Theme package build completed!"
}

main "$@"
