#!/bin/bash

echo "🚀 Starting Full Stack Task Management Application"
echo "===================================================="
echo ""

# Get the directory where this script is located
DIR="$(cd "$(dirname "$0")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start Backend
echo "1️⃣  Starting Backend Server..."
cd "$DIR/backend"

if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f "venv/bin/uvicorn" ]; then
    echo "   Installing backend dependencies..."
    pip install -q -r requirements.txt
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

echo "   ✅ Backend started (PID: $BACKEND_PID)"
echo "   📚 API Docs: http://localhost:8000/docs"
echo ""

# Wait for backend to be ready
sleep 3

# Start Frontend  
echo "2️⃣  Starting Frontend Server..."
cd "$DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

# Wait for frontend to be ready
sleep 5

echo "===================================================="
echo "✅ Application is running!"
echo "===================================================="
echo ""
echo "🌐 Frontend:  http://localhost:5174"
echo "🔧 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait
