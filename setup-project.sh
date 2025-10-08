#!/bin/bash

# HRMS Project Setup Script
# This script ensures consistent setup across different environments

echo "🚀 Starting HRMS Project Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MySQL is running
check_mysql() {
    print_status "Checking MySQL connection..."
    if command -v mysql &> /dev/null; then
        if mysql -u root -e "SELECT 1;" &> /dev/null; then
            print_success "MySQL is running and accessible"
        else
            print_warning "MySQL is not accessible. Please ensure MySQL is running and root user has no password or update the connection settings."
        fi
    else
        print_warning "MySQL client not found. Please ensure MySQL is installed and running."
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    if [ -f "package.json" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Frontend dependencies installed successfully"
        else
            print_error "Failed to install frontend dependencies"
            exit 1
        fi
    else
        print_error "package.json not found in current directory"
        exit 1
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    if [ -d "src/backend" ] && [ -f "src/backend/package.json" ]; then
        cd src/backend
        npm install
        if [ $? -eq 0 ]; then
            print_success "Backend dependencies installed successfully"
            cd ../..
        else
            print_error "Failed to install backend dependencies"
            exit 1
        fi
    else
        print_error "Backend directory or package.json not found"
        exit 1
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    if [ ! -f "src/backend/.env" ]; then
        cat > src/backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=hrmgo_hero

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:3000
EOF
        print_success "Environment file created at src/backend/.env"
    else
        print_warning "Environment file already exists at src/backend/.env"
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running comprehensive database setup..."
    if [ -f "src/backend/setup-database.js" ]; then
        cd src/backend
        node setup-database.js
        if [ $? -eq 0 ]; then
            print_success "Database setup completed successfully"
            cd ../..
        else
            print_error "Database setup failed"
            cd ../..
            exit 1
        fi
    else
        print_error "Database setup script not found"
        exit 1
    fi
}

# Legacy migration function (keeping for backward compatibility)
run_legacy_migrations() {
    print_status "Running legacy database migrations..."
    if [ -d "src/backend/migrations" ]; then
        cd src/backend
        node -e "
        const mysql = require('mysql2/promise');
        const fs = require('fs');
        const path = require('path');
        
        async function runMigrations() {
            const pool = mysql.createPool({
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: '',
                database: 'hrmgo_hero',
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            
            try {
                const migrationFiles = fs.readdirSync('./migrations').filter(file => file.endsWith('.js'));
                console.log('Found', migrationFiles.length, 'migration files');
                
                for (const file of migrationFiles) {
                    console.log('Running migration:', file);
                    const migration = require('./migrations/' + file);
                    await migration.up(pool);
                }
                
                console.log('All migrations completed successfully');
            } catch (error) {
                console.error('Migration error:', error.message);
            } finally {
                await pool.end();
            }
        }
        
        runMigrations();
        "
        cd ../..
        print_success "Database migrations completed"
    else
        print_warning "No migrations directory found"
    fi
}

# Create database if it doesn't exist
create_database() {
    print_status "Creating database if it doesn't exist..."
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS hrmgo_hero;" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_success "Database 'hrmgo_hero' is ready"
    else
        print_warning "Could not create database. Please ensure MySQL is running and accessible."
    fi
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    if [ -f "src/backend/server.js" ]; then
        cd src/backend
        print_success "Backend server starting on port 8000..."
        print_status "You can access the API at: http://localhost:8000/api/v1/health"
        print_status "Press Ctrl+C to stop the server"
        node server.js
    else
        print_error "Backend server file not found"
        exit 1
    fi
}

# Main setup function
main() {
    echo "=========================================="
    echo "  HRMS Project Setup Script"
    echo "=========================================="
    echo ""
    
    check_node
    check_mysql
    create_database
    install_frontend_deps
    install_backend_deps
    create_env_file
    run_migrations
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the backend server: ./setup-project.sh start-backend"
    echo "2. In another terminal, start the frontend: npm run dev"
    echo "3. Access the application at: http://localhost:5173"
    echo ""
    echo "Default login credentials:"
    echo "  Super Admin: admin@example.com / admin123"
    echo "  Company Admin: company@example.com / company123"
    echo "  HR Manager: hr@example.com / hr123"
    echo "  Manager: manager@example.com / manager123"
    echo "  Employee: employee@example.com / employee123"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    "start-backend")
        start_backend
        ;;
    "check")
        check_node
        check_mysql
        ;;
    "migrate")
        run_migrations
        ;;
    *)
        main
        ;;
esac
