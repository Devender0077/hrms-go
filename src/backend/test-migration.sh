#!/bin/bash

echo "🔄 Testing database migration..."

# Get token from login (you'll need to replace this with a valid token)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBocm1nby5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJpYXQiOjE3NTg4MTIxMTYsImV4cCI6MTc1ODg5ODUxNn0.2KvUoZiuysWAph4uf_pFwhvx8saMfpL73Hiet8geZQY"

echo "📡 Calling migration endpoint..."

curl -X POST http://localhost:8000/api/v1/migrate-employee-fields \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -v

echo ""
echo "✅ Migration request sent!"
