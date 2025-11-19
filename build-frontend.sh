#!/bin/bash

echo "🏗️  Building Task Management Frontend for Production..."
echo "========================================================"

cd "$(dirname "$0")/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo "📁 Build output is in: frontend/dist/"
    echo ""
    echo "To preview the build locally, run:"
    echo "  cd frontend && npm run preview"
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
