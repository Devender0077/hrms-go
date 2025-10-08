# 🚀 HRMS Deployment Guide

Complete guide for deploying HRMS on any environment: Local, VPS, Cloud, or Docker.

## 📋 Table of Contents

1. [Quick Start (Local Development)](#quick-start-local-development)
2. [Production Deployment (VPS/Cloud)](#production-deployment-vpscloud)
3. [Docker Deployment](#docker-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Troubleshooting](#troubleshooting)

---

## 🏠 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))
- Git

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Devender0077/hrms-go.git
cd hrms-go

# Make setup script executable
chmod +x setup-project.sh

# Run automated setup
./setup-project.sh

# Start backend server
./start-servers.sh
```

### Manual Setup

```bash
# 1. Install dependencies
npm install
cd src/backend && npm install && cd ../..

# 2. Configure environment
cp src/backend/.env.example src/backend/.env
# Edit src/backend/.env with your database credentials

# 3. Setup database
cd src/backend
node setup-database.js
cd ../..

# 4. Start servers
# Terminal 1: Backend
cd src/backend && node server.js

# Terminal 2: Frontend
npm run dev
```

### Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Health: http://localhost:8000/api/v1/health

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | admin123 |
| Company Admin | company@example.com | company123 |
| HR Manager | hr@example.com | hr123 |
| Employee | employee@example.com | employee123 |

---

## 🌐 Production Deployment (VPS/Cloud)

### Supported Platforms
- ✅ AWS EC2
- ✅ DigitalOcean Droplets
- ✅ Linode
- ✅ Google Cloud Platform
- ✅ Azure VMs
- ✅ Any VPS with Ubuntu/Debian/CentOS

### Automated Deployment

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone repository
git clone https://github.com/Devender0077/hrms-go.git
cd hrms-go

# 3. Make deployment script executable
chmod +x deploy.sh

# 4. Run deployment script
./deploy.sh
```

The script will:
- ✅ Install Node.js, MySQL, PM2
- ✅ Setup database and run migrations
- ✅ Build frontend
- ✅ Start backend with PM2
- ✅ Configure Nginx (optional)
- ✅ Setup SSL with Let's Encrypt (optional)

### Manual Production Deployment

#### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install -y nginx
```

#### Step 2: Clone and Setup Project

```bash
# Clone repository
git clone https://github.com/Devender0077/hrms-go.git
cd hrms-go

# Install dependencies
npm install
cd src/backend && npm install && cd ../..

# Configure environment
cp src/backend/.env.example src/backend/.env
nano src/backend/.env  # Edit with your settings
```

#### Step 3: Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE hrmgo_hero;"

# Run setup script
cd src/backend
node setup-database.js
cd ../..
```

#### Step 4: Build Frontend

```bash
npm run build
```

#### Step 5: Start with PM2

```bash
# Start backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

#### Step 6: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hrms

# Add this configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/hrms-go/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### PM2 Management Commands

```bash
# List all processes
pm2 list

# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Monitor resources
pm2 monit

# Delete process
pm2 delete all
```

---

## 🐳 Docker Deployment

### Prerequisites
- Docker 20+
- Docker Compose 2+

### Quick Start with Docker

```bash
# 1. Clone repository
git clone https://github.com/Devender0077/hrms-go.git
cd hrms-go

# 2. Create environment file
cp .env.example .env
# Edit .env with your settings

# 3. Start with Docker Compose
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop containers
docker-compose down
```

### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f hrms-app

# Access MySQL
docker-compose exec mysql mysql -u root -p

# Restart services
docker-compose restart

# Stop and remove
docker-compose down -v  # -v removes volumes
```

### Production Docker Deployment

```bash
# Build for production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale backend (multiple instances)
docker-compose up -d --scale hrms-app=3
```

---

## 🔧 Environment Variables

### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrmgo_hero

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Server
PORT=8000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Optional Variables

```env
# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloud Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Redis (Caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

## 💾 Database Setup

### Automatic Setup (Recommended)

```bash
cd src/backend
node setup-database.js
```

This script will:
- ✅ Create database if it doesn't exist
- ✅ Run all migrations
- ✅ Seed default data (users, permissions, settings)
- ✅ Verify setup

### Manual Database Setup

```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE hrmgo_hero;"

# 2. Import schema (if available)
mysql -u root -p hrmgo_hero < database/schema.sql

# 3. Run migrations
cd src/backend/migrations/migrations
# Run each migration file in order
```

### Database Backup

```bash
# Backup database
mysqldump -u root -p hrmgo_hero > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p hrmgo_hero < backup_20250108.sql
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=8001
```

#### 2. Database Connection Error

```bash
# Check MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check credentials in .env
cat src/backend/.env
```

#### 3. Permission Denied

```bash
# Fix file permissions
chmod +x setup-project.sh
chmod +x deploy.sh
chmod +x start-servers.sh
chmod +x stop-servers.sh

# Fix directory permissions
chmod -R 755 src/
```

#### 4. Node Modules Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

cd src/backend
rm -rf node_modules package-lock.json
npm install
cd ../..
```

#### 5. Migration Errors

```bash
# Reset database (CAUTION: This will delete all data)
mysql -u root -p -e "DROP DATABASE hrmgo_hero; CREATE DATABASE hrmgo_hero;"

# Run setup again
cd src/backend
node setup-database.js
```

#### 6. PM2 Not Starting

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs

# Restart PM2
pm2 restart all

# Delete and restart
pm2 delete all
pm2 start ecosystem.config.js
```

### Getting Help

1. **Check Logs**
   ```bash
   # Backend logs
   pm2 logs hrms-backend
   
   # Nginx logs
   sudo tail -f /var/log/nginx/error.log
   
   # MySQL logs
   sudo tail -f /var/log/mysql/error.log
   ```

2. **Verify Services**
   ```bash
   # Check if services are running
   sudo systemctl status mysql
   sudo systemctl status nginx
   pm2 status
   ```

3. **Test API**
   ```bash
   # Health check
   curl http://localhost:8000/api/v1/health
   
   # Test login
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

## 📄 License

This project is licensed under a Proprietary License. See LICENSE file for details.

---

**HRMS v2.5.1** - Built with ❤️ for modern HR management
