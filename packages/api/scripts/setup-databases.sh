#!/bin/bash

# Setup script for creating Cloudflare D1 databases
# Run this script to set up databases for all environments

set -e

echo "🔧 Setting up Cloudflare D1 databases..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    exit 1
fi

echo "📋 Creating databases for all environments..."

# Create development database
echo "Creating development database..."
DEV_DB_OUTPUT=$(wrangler d1 create agentprobe-community-dev)
DEV_DB_ID=$(echo "$DEV_DB_OUTPUT" | grep "database_id" | sed 's/.*database_id = "\([^"]*\)".*/\1/')

# Create staging database
echo "Creating staging database..."
STAGING_DB_OUTPUT=$(wrangler d1 create agentprobe-community-staging)
STAGING_DB_ID=$(echo "$STAGING_DB_OUTPUT" | grep "database_id" | sed 's/.*database_id = "\([^"]*\)".*/\1/')

# Create production database
echo "Creating production database..."
PROD_DB_OUTPUT=$(wrangler d1 create agentprobe-community-prod)
PROD_DB_ID=$(echo "$PROD_DB_OUTPUT" | grep "database_id" | sed 's/.*database_id = "\([^"]*\)".*/\1/')

echo ""
echo "✅ Databases created successfully!"
echo ""
echo "📝 Please update your wrangler.toml file with the following database IDs:"
echo ""
echo "Development database ID: $DEV_DB_ID"
echo "Staging database ID:     $STAGING_DB_ID"
echo "Production database ID:  $PROD_DB_ID"
echo ""
echo "🔄 Also update your GitHub repository secrets with:"
echo "CLOUDFLARE_D1_DATABASE_ID_DEV=$DEV_DB_ID"
echo "CLOUDFLARE_D1_DATABASE_ID_STAGING=$STAGING_DB_ID"
echo "CLOUDFLARE_D1_DATABASE_ID_PROD=$PROD_DB_ID"
echo ""
echo "🗂️ Next steps:"
echo "1. Update wrangler.toml with the database IDs above"
echo "2. Run: npm run db:generate"
echo "3. Run: npm run db:migrate:dev"
echo "4. Run: npm run db:migrate:staging"
echo "5. Run: npm run db:migrate:prod"