#!/bin/bash

# Preparation script for AgentProbe Community deployment
# This script helps prepare for deployment when you can't run database setup directly

set -e

echo "🛠️ Preparing AgentProbe Community for deployment..."

# Ensure wrangler is up to date
echo "📦 Updating wrangler to latest version..."
npm install --save-dev wrangler@latest

# Run verification
echo "🔍 Running deployment verification..."
./scripts/verify-deployment.sh

echo ""
echo "🗂️ MANUAL SETUP INSTRUCTIONS:"
echo "=============================="
echo ""
echo "Since database creation requires Cloudflare authentication,"
echo "please follow these manual steps:"
echo ""
echo "1. AUTHENTICATE WITH CLOUDFLARE:"
echo "   npx wrangler login"
echo ""
echo "2. CREATE D1 DATABASES:"
echo "   npx wrangler d1 create agentprobe-community-dev"
echo "   npx wrangler d1 create agentprobe-community-staging"
echo "   npx wrangler d1 create agentprobe-community-prod"
echo ""
echo "3. UPDATE wrangler.toml WITH DATABASE IDs:"
echo "   Replace 'placeholder' values with actual database IDs from step 2"
echo ""
echo "4. RUN DATABASE MIGRATIONS:"
echo "   npm run db:migrate:dev     # For development (local)"
echo "   npm run db:migrate:staging # For staging (remote)"
echo "   npm run db:migrate:prod    # For production (remote)"
echo ""
echo "5. TEST DEPLOYMENT:"
echo "   npm run dev                # Test locally"
echo "   npm run deploy:staging     # Deploy to staging"
echo "   npm run deploy:prod        # Deploy to production"
echo ""

echo "📋 ENVIRONMENT SETUP CHECKLIST:"
echo "==============================="
echo "□ Install dependencies (npm install)"
echo "□ Authenticate with Cloudflare (wrangler login)"
echo "□ Create D1 databases"
echo "□ Update wrangler.toml with database IDs"
echo "□ Run database migrations"
echo "□ Test local development"
echo "□ Deploy to staging"
echo "□ Run tests against staging"
echo "□ Deploy to production"
echo ""

echo "💡 HELPFUL COMMANDS:"
echo "===================="
echo "Check auth status:        npx wrangler whoami"
echo "List databases:           npx wrangler d1 list"
echo "Check deployment status:  npx wrangler deployments list"
echo "View logs:                npx wrangler tail"
echo "Local development:        npm run dev"
echo ""

echo "✅ Preparation complete! Follow the manual steps above."