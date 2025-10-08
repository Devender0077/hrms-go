#!/bin/bash

# HRMS Server Management Script
# This script stops all HRMS servers cleanly

echo "🛑 Stopping HRMS Servers..."

# Kill backend server processes
echo "🧹 Stopping backend server..."
pkill -f "node server.js" 2>/dev/null
pkill -f "nohup node server.js" 2>/dev/null

# Kill any processes using port 8000
echo "🔌 Freeing up port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "Port 8000 is already free"

sleep 2

# Verify servers are stopped
echo "🔍 Verifying servers are stopped..."
if curl -s "http://localhost:8000/api/v1/health" > /dev/null 2>&1; then
    echo "⚠️  Warning: Server still responding on port 8000"
else
    echo "✅ All servers stopped successfully"
fi

echo "🎉 HRMS servers have been stopped!"