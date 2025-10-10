#!/bin/bash
echo "🔄 Restarting backend server..."
cd src/backend
pkill -f "node.*server.js" || echo "No existing server found"
sleep 2
echo "🚀 Starting backend server with new routes..."
nohup node server.js > server.log 2>&1 &
sleep 3
echo "✅ Backend server restarted successfully!"
echo "📊 Server status:"
ps aux | grep "node.*server.js" | grep -v grep || echo "Server not found in process list"
echo "📝 Latest server logs:"
tail -n 5 server.log 2>/dev/null || echo "No logs available yet"

