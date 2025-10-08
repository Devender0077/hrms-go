#!/bin/bash

###############################################################################
# HRMS Deployment Script
# Supports: Local, VPS, Cloud (AWS, DigitalOcean, Linode, etc.)
# Author: HRMS Team
# Version: 2.5.1
###############################################################################

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}➜${NC} ${GREEN}$1${NC}\n"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_warning "Running as root. This is not recommended for production."
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/debian_version ]; then
            DISTRO="debian"
        elif [ -f /etc/redhat-release ]; then
            DISTRO="redhat"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    
    log_info "Detected OS: $OS"
}

# Install dependencies
install_dependencies() {
    log_step "Step 1: Installing system dependencies"
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            log_info "Installing dependencies for Debian/Ubuntu..."
            sudo apt-get update
            sudo apt-get install -y curl git build-essential
        elif [ "$DISTRO" == "redhat" ]; then
            log_info "Installing dependencies for RHEL/CentOS..."
            sudo yum update -y
            sudo yum install -y curl git gcc-c++ make
        fi
    elif [ "$OS" == "macos" ]; then
        log_info "Installing dependencies for macOS..."
        if ! command -v brew &> /dev/null; then
            log_warning "Homebrew not found. Installing..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
    fi
    
    log_success "System dependencies installed"
}

# Install Node.js
install_nodejs() {
    log_step "Step 2: Installing Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "Node.js already installed: $NODE_VERSION"
        
        # Check if version is >= 18
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -lt 18 ]; then
            log_warning "Node.js version is too old. Upgrading..."
        else
            log_success "Node.js version is compatible"
            return
        fi
    fi
    
    log_info "Installing Node.js 20 LTS..."
    
    if [ "$OS" == "linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ "$OS" == "macos" ]; then
        brew install node@20
    fi
    
    log_success "Node.js installed: $(node -v)"
}

# Install MySQL
install_mysql() {
    log_step "Step 3: Installing MySQL"
    
    if command -v mysql &> /dev/null; then
        log_info "MySQL already installed"
        log_success "MySQL version: $(mysql --version)"
        return
    fi
    
    log_info "Installing MySQL..."
    
    if [ "$OS" == "linux" ]; then
        if [ "$DISTRO" == "debian" ]; then
            sudo apt-get install -y mysql-server
            sudo systemctl start mysql
            sudo systemctl enable mysql
        elif [ "$DISTRO" == "redhat" ]; then
            sudo yum install -y mysql-server
            sudo systemctl start mysqld
            sudo systemctl enable mysqld
        fi
    elif [ "$OS" == "macos" ]; then
        brew install mysql
        brew services start mysql
    fi
    
    log_success "MySQL installed"
    log_warning "Please run 'mysql_secure_installation' to secure your MySQL installation"
}

# Install PM2
install_pm2() {
    log_step "Step 4: Installing PM2 Process Manager"
    
    if command -v pm2 &> /dev/null; then
        log_info "PM2 already installed: $(pm2 --version)"
        return
    fi
    
    log_info "Installing PM2 globally..."
    sudo npm install -g pm2
    
    # Setup PM2 startup script
    pm2 startup | tail -n 1 | sudo bash
    
    log_success "PM2 installed and configured"
}

# Setup project
setup_project() {
    log_step "Step 5: Setting up project"
    
    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd src/backend
    npm install
    cd ../..
    
    log_success "Project dependencies installed"
}

# Configure environment
configure_environment() {
    log_step "Step 6: Configuring environment"
    
    if [ ! -f "src/backend/.env" ]; then
        log_info "Creating .env file..."
        
        read -p "Enter MySQL database name [hrmgo_hero]: " DB_NAME
        DB_NAME=${DB_NAME:-hrmgo_hero}
        
        read -p "Enter MySQL username [root]: " DB_USER
        DB_USER=${DB_USER:-root}
        
        read -sp "Enter MySQL password: " DB_PASSWORD
        echo
        
        read -p "Enter backend port [8000]: " PORT
        PORT=${PORT:-8000}
        
        cat > src/backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)

# Server Configuration
PORT=$PORT
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000
EOF
        
        log_success ".env file created"
    else
        log_info ".env file already exists"
    fi
}

# Setup database
setup_database() {
    log_step "Step 7: Setting up database"
    
    log_info "Running database setup script..."
    cd src/backend
    node setup-database.js
    cd ../..
    
    log_success "Database setup complete"
}

# Build frontend
build_frontend() {
    log_step "Step 8: Building frontend"
    
    log_info "Building production frontend..."
    npm run build
    
    log_success "Frontend built successfully"
}

# Start services
start_services() {
    log_step "Step 9: Starting services"
    
    # Create logs directory
    mkdir -p logs
    
    # Start backend with PM2
    log_info "Starting backend server with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    log_success "Backend server started"
    
    # Show PM2 status
    pm2 list
}

# Setup Nginx (optional)
setup_nginx() {
    log_step "Step 10: Setting up Nginx (optional)"
    
    read -p "Do you want to setup Nginx reverse proxy? (y/N) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Skipping Nginx setup"
        return
    fi
    
    if ! command -v nginx &> /dev/null; then
        log_info "Installing Nginx..."
        if [ "$OS" == "linux" ]; then
            sudo apt-get install -y nginx
        elif [ "$OS" == "macos" ]; then
            brew install nginx
        fi
    fi
    
    read -p "Enter your domain name (e.g., hrms.example.com): " DOMAIN
    
    sudo tee /etc/nginx/sites-available/hrms << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Frontend
    location / {
        root $(pwd)/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    
    log_success "Nginx configured for domain: $DOMAIN"
    log_info "To enable HTTPS, run: sudo certbot --nginx -d $DOMAIN"
}

# Display summary
display_summary() {
    echo
    echo "================================================================"
    log_success "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "================================================================"
    echo
    log_info "Backend API: http://localhost:8000"
    log_info "Frontend: http://localhost:5173 (dev) or serve dist/ folder"
    echo
    log_info "Default Login Credentials:"
    echo "  Super Admin: admin@example.com / admin123"
    echo "  Company Admin: company@example.com / company123"
    echo "  HR Manager: hr@example.com / hr123"
    echo "  Employee: employee@example.com / employee123"
    echo
    log_info "Useful PM2 Commands:"
    echo "  pm2 list          - List all processes"
    echo "  pm2 logs          - View logs"
    echo "  pm2 restart all   - Restart all processes"
    echo "  pm2 stop all      - Stop all processes"
    echo "  pm2 monit         - Monitor processes"
    echo
    echo "================================================================"
    echo
}

# Main deployment flow
main() {
    echo
    echo "================================================================"
    echo "           HRMS Deployment Script v2.5.1"
    echo "================================================================"
    echo
    
    detect_os
    check_root
    
    install_dependencies
    install_nodejs
    install_mysql
    install_pm2
    setup_project
    configure_environment
    setup_database
    build_frontend
    start_services
    setup_nginx
    
    display_summary
}

# Run main function
main
