#!/bin/bash

# Secure Notes App - Quick Setup Script
# This script automates the initial setup process

echo "🔐 Secure Notes Application - Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi
print_success "Node.js $(node --version) detected"

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB is running"
    else
        print_warning "MongoDB is installed but not running"
        echo "Would you like to start MongoDB? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            sudo systemctl start mongod
            print_success "MongoDB started"
        fi
    fi
else
    print_warning "MongoDB not detected. You can use MongoDB Atlas instead."
fi

echo ""
echo "Setting up Backend..."
echo "--------------------"

# Backend setup
cd server || exit

# Check if .env exists
if [ -f .env ]; then
    print_warning ".env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Copy .env.example to .env
cp .env.example .env
print_success "Created .env file"

# Generate encryption key
echo "Generating encryption key..."
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
print_success "Generated encryption key"

# Generate JWT secret
echo "Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
print_success "Generated JWT secret"

# Update .env file with generated keys
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
fi

print_success "Updated .env with secure keys"

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Create uploads directory
mkdir -p uploads
print_success "Created uploads directory"

echo ""
echo "Setting up Frontend..."
echo "---------------------"

# Frontend setup
cd ../client || exit

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Your secure keys have been generated:"
echo ""
echo -e "${YELLOW}ENCRYPTION_KEY:${NC} $ENCRYPTION_KEY"
echo -e "${YELLOW}JWT_SECRET:${NC} $JWT_SECRET"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Keep these keys secure and never commit them to version control!${NC}"
echo ""
echo "To start the application:"
echo ""
echo -e "${GREEN}Terminal 1 (Backend):${NC}"
echo "  cd server"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Terminal 2 (Frontend):${NC}"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Access the application at: http://localhost:3000"
echo ""
echo "For more information, see README.md"
echo ""
