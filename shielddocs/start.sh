#!/bin/bash

echo "🚀 Starting ShieldDocs - Secure Document Management"
echo "=================================================="

# Detect correct project root
if [ -f "package.json" ]; then
    echo "📂 Running from correct project root"
elif [ -d "shielddocs" ] && [ -f "shielddocs/package.json" ]; then
    echo "📂 Adjusting into inner shielddocs folder..."
    cd shielddocs
else
    echo "❌ Could not find project root (package.json missing)"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start frontend in background
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start backend in background
echo "🔧 Starting backend server..."
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "🎉 ShieldDocs is starting up!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping ShieldDocs...'; kill $FRONTEND_PID $BACKEND_PID; exit" INT
wait
