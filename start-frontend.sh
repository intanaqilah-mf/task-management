#!/bin/bash

echo "🚀 Starting Task Management Frontend..."
echo "========================================="

cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "✅ Starting development server..."
npm run dev
