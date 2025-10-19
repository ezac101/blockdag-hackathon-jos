#!/bin/bash

# Syspec Drop - Development Setup Script
# This script automates the initial setup process

echo "🔐 Syspec Drop - Development Setup"
echo "=================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    echo "   Try running 'npm install' manually"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Syspec Drop Environment Variables

# IPFS Gateway (default: public gateway)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io

# BlockDAG Explorer URL
NEXT_PUBLIC_EXPLORER_URL=https://explorer.example.com

# Enable mock mode for development (true/false)
NEXT_PUBLIC_MOCK_MODE=true
EOF
    echo "✅ .env.local created"
else
    echo "ℹ️  .env.local already exists (skipping)"
fi

echo ""
echo "=================================="
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev      # Start development server"
echo "2. Open http://localhost:3000"
echo "3. Start coding! 🚀"
echo ""
echo "Need help? Check SETUP.md for detailed instructions"
