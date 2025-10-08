#!/bin/bash

# HRMS Server Management Script
# This script ensures clean server startup

echo "🚀 Starting HRMS Server..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Kill any existing server processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "nohup node server.js" 2>/dev/null || true
sleep 2

# Kill any processes using port 8000
echo "🔌 Freeing up port 8000..."
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "Port 8000 is already free"
else
    echo "lsof not available, trying alternative method..."
    netstat -tulpn 2>/dev/null | grep :8000 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || echo "Port 8000 is already free"
fi
sleep 1

# Start backend server
echo "🖥️  Starting backend server..."
cd src/backend
nohup node server.js > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test server health
echo "🏥 Testing server health..."
if curl -s "http://localhost:8000/api/v1/health" > /dev/null 2>&1; then
    echo "✅ Backend server is running successfully!"
    echo "🔗 API URL: http://localhost:8000/api/v1"
    echo "📊 Health Check: http://localhost:8000/api/v1/health"
    echo "📝 Server logs: src/backend/server.log"
else
    echo "❌ Backend server failed to start"
    echo "📋 Check server.log for details:"
    if [ -f "server.log" ]; then
        tail -20 server.log
    else
        echo "No server.log found"
    fi
    exit 1
fi

echo ""
echo "🎉 HRMS server is ready!"
echo "📝 To stop server, run: ./stop-servers.sh"
echo "📊 To check server status, run: curl http://localhost:8000/api/v1/health"