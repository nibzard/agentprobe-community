#!/bin/bash

# Deployment verification script for AgentProbe Community
# This script verifies that the application is ready for deployment

set -e

echo "🔍 Verifying AgentProbe Community deployment readiness..."

# Check if all dependencies are installed
echo "📦 Checking dependencies..."
if ! npm list >/dev/null 2>&1; then
    echo "❌ Dependencies not properly installed. Run: npm install"
    exit 1
fi
echo "✅ Dependencies are installed"

# Type checking
echo "📝 Running TypeScript type check..."
if ! npm run type-check >/dev/null 2>&1; then
    echo "❌ TypeScript type check failed"
    exit 1
fi
echo "✅ TypeScript types are valid"

# Build verification
echo "🔨 Verifying build process..."
if ! npm run build >/dev/null 2>&1; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"

# Check wrangler configuration
echo "⚙️ Checking wrangler configuration..."
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found"
    exit 1
fi

# Check for placeholder database IDs
if grep -q "placeholder" wrangler.toml; then
    echo "⚠️ WARNING: Found placeholder database IDs in wrangler.toml"
    echo "   You need to run the database setup script and update the database IDs"
    echo "   Run: ./scripts/setup-databases.sh"
fi

# Check migration files
echo "📊 Checking database migrations..."
if [ ! -d "migrations" ] || [ -z "$(ls -A migrations 2>/dev/null)" ]; then
    echo "❌ No migration files found"
    echo "   Run: npm run db:generate"
    exit 1
fi
echo "✅ Migration files found"

# Check for required environment variables (in .env.example)
echo "🔐 Checking environment configuration..."
if [ ! -f ".env.example" ]; then
    echo "⚠️ WARNING: .env.example not found"
else
    echo "✅ Environment example file found"
fi

# Wrangler authentication check
echo "🔑 Checking Cloudflare authentication..."
if ! npx wrangler whoami >/dev/null 2>&1; then
    echo "⚠️ WARNING: Not authenticated with Cloudflare"
    echo "   Run: npx wrangler login"
else
    echo "✅ Authenticated with Cloudflare"
fi

echo ""
echo "🎯 DEPLOYMENT READINESS SUMMARY:"
echo "=================================="

# Check database IDs
if grep -q "placeholder" wrangler.toml; then
    echo "❌ Database setup: PENDING"
    echo "   Action needed: Run ./scripts/setup-databases.sh"
else
    echo "✅ Database setup: READY"
fi

# Check authentication
if ! npx wrangler whoami >/dev/null 2>&1; then
    echo "❌ Authentication: PENDING"
    echo "   Action needed: Run npx wrangler login"
else
    echo "✅ Authentication: READY"
fi

echo "✅ TypeScript: READY"
echo "✅ Dependencies: READY"
echo "✅ Build process: READY"

echo ""
echo "📋 NEXT STEPS FOR DEPLOYMENT:"
echo "=============================="
echo "1. Authenticate with Cloudflare: npx wrangler login"
echo "2. Create databases: ./scripts/setup-databases.sh"
echo "3. Update wrangler.toml with real database IDs"
echo "4. Run migrations: npm run db:migrate:dev"
echo "5. Test locally: npm run dev"
echo "6. Deploy to staging: npm run deploy:staging"
echo "7. Deploy to production: npm run deploy:prod"

echo ""
echo "🚀 Ready to deploy!"