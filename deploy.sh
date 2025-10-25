#!/bin/bash

set -e  # Exit on any error

echo "🤠 PayItForward Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install it first:"
    echo "  brew install terraform"
    exit 1
fi

# Step 1: Update Terraform variables
print_step "Step 1: Configuring Terraform"
echo ""
echo "Please edit terraform/terraform.tfvars and add your Vultr API key"
read -p "Press Enter when you've added your API key to terraform/terraform.tfvars..."

# Step 2: Initialize and apply Terraform
print_step "Step 2: Provisioning Vultr Infrastructure"
cd terraform

terraform init
print_success "Terraform initialized"

echo ""
print_warning "About to provision resources on Vultr. This will:"
echo "  • Create a PostgreSQL database (~$15/month)"
echo "  • Create a compute instance (~$12/month)"
echo "  • Total cost: ~$27/month"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

terraform apply -auto-approve
print_success "Infrastructure provisioned!"

# Save outputs
terraform output -json > outputs.json
print_success "Configuration saved to outputs.json"

# Extract values
DB_HOST=$(terraform output -raw database_host)
DB_PORT=$(terraform output -raw database_port)
DB_NAME=$(terraform output -raw database_name)
DB_USER=$(terraform output -raw database_username)
DB_PASS=$(terraform output -raw database_password)
SERVER_IP=$(terraform output -raw backend_server_ip)

cd ..

echo ""
print_success "Infrastructure Details:"
echo "  Database: $DB_HOST:$DB_PORT"
echo "  Server IP: $SERVER_IP"
echo ""

# Step 3: Update backend .env
print_step "Step 3: Configuring Backend Environment"

cat > backend/.env <<EOF
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME

# Auth0 (you'll need to configure these)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.payitforward.com
AUTH0_ISSUER=https://your-domain.auth0.com/

# Gemini AI (add your key)
GEMINI_API_KEY=your-gemini-api-key

# CORS (update after deploying frontend)
CORS_ORIGIN=http://localhost:5173

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF

print_success "Backend .env created"

# Step 4: Wait for server to be ready
print_step "Step 4: Waiting for server to initialize (this may take 2-3 minutes)..."
sleep 120

# Step 5: SSH into server and deploy
print_step "Step 5: Deploying Backend to Vultr"
echo ""
print_warning "You'll need the root password for the server"
print_warning "Check your email - Vultr sends the password when the server is created"
echo ""
read -p "Press Enter when you have the password ready..."

# Create deployment package
print_step "Creating deployment package..."
cd backend
tar -czf ../deploy.tar.gz . --exclude=node_modules --exclude=.env.example
cd ..

print_success "Package created"

echo ""
print_step "Uploading to server..."
scp deploy.tar.gz root@$SERVER_IP:/root/

print_step "Setting up server..."
ssh root@$SERVER_IP << 'ENDSSH'
# Extract files
cd /opt/payitforward
tar -xzf /root/deploy.tar.gz
rm /root/deploy.tar.gz

# Install dependencies
npm install --production

# Run migrations
npm run migrate

# Seed database with demo data
npm run seed

# Start with PM2
pm2 start src/server.js --name payitforward-api
pm2 save
pm2 startup

echo "Backend deployed successfully!"
ENDSSH

print_success "Backend deployed!"

# Cleanup
rm deploy.tar.gz

echo ""
print_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Deployment Complete!"
print_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend API: http://$SERVER_IP:3000"
echo ""
echo "Next steps:"
echo "1. Set up Auth0 (see docs/DEPLOYMENT.md)"
echo "2. Add Auth0 credentials to backend/.env"
echo "3. Add Gemini API key to backend/.env"
echo "4. Deploy frontend to Cloudflare Pages"
echo ""
print_warning "Save these credentials somewhere safe:"
echo "  Server IP: $SERVER_IP"
echo "  Database Host: $DB_HOST"
echo "  Database User: $DB_USER"
echo "  Database Password: $DB_PASS"
echo ""
