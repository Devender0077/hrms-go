# Multi-stage build for HRMS Application
FROM node:20-alpine AS frontend-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Backend stage
FROM node:20-alpine AS backend

# Install system dependencies
RUN apk add --no-cache \
    mysql-client \
    bash \
    curl

# Set working directory
WORKDIR /app

# Copy backend package files
COPY src/backend/package*.json ./src/backend/

# Install backend dependencies
RUN cd src/backend && npm ci --only=production

# Copy backend source
COPY src/backend ./src/backend

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy environment template
COPY src/backend/.env.example ./src/backend/.env

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Start application
CMD ["node", "src/backend/server.js"]
