#!/bin/bash

# WhatsApp Business Portal Setup Script

echo "🚀 Setting up WhatsApp Business Portal..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Supabase credentials"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Supabase URL and anon key"
echo "2. Create the required tables in your Supabase database (see README-DYNAMIC.md)"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed instructions, see README-DYNAMIC.md"
