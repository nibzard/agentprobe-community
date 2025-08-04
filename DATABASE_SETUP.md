# Database Setup Guide

This guide provides step-by-step instructions for setting up D1 databases for AgentProbe Community.

## Prerequisites

- Cloudflare account with Workers plan
- Wrangler CLI installed and authenticated
- Project dependencies installed (`npm install`)

## Manual Database Setup Process

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create D1 Databases

Run these commands to create databases for each environment:

```bash
# Development database
npx wrangler d1 create agentprobe-community-dev

# Staging database  
npx wrangler d1 create agentprobe-community-staging

# Production database
npx wrangler d1 create agentprobe-community-prod
```

**Important**: Save the database IDs that are displayed after each creation command.

### 3. Update wrangler.toml Configuration

Replace the placeholder database IDs in `wrangler.toml` with the actual IDs from step 2:

```toml
# Development environment (default)
[[d1_databases]]
binding = "DB"
database_name = "agentprobe-community-dev"
database_id = "REPLACE_WITH_DEV_DATABASE_ID"

# Staging environment
[[env.staging.d1_databases]]
binding = "DB"
database_name = "agentprobe-community-staging" 
database_id = "REPLACE_WITH_STAGING_DATABASE_ID"

# Production environment
[[env.production.d1_databases]]
binding = "DB"
database_name = "agentprobe-community-prod"
database_id = "REPLACE_WITH_PROD_DATABASE_ID"
```

### 4. Run Database Migrations

Apply the database schema to each environment:

```bash
# Development (local D1 instance)
npm run db:migrate:dev

# Staging (remote D1 database)
npm run db:migrate:staging

# Production (remote D1 database)
npm run db:migrate:prod
```

## Automated Setup Script

Alternatively, you can use the automated setup script:

```bash
./scripts/setup-databases.sh
```

This script will:
1. Check authentication status
2. Create all three databases
3. Display the database IDs for manual update
4. Provide next steps

## Database Schema

The migration creates these tables:

### `results`
- Stores individual test execution results
- Primary key: `id` (auto-increment)
- Unique constraint: `run_id`
- Indexes on: `tool`, `scenario`, `timestamp`, `success`, `client_id`

### `tool_stats`
- Aggregated statistics per tool/scenario combination
- Updated automatically when results are submitted
- Indexes on: `tool`, `(tool, scenario)`, `success_rate`

### `friction_point_stats`
- Tracks common friction points per tool
- Updated automatically from result submissions
- Indexes on: `tool`, `count`, `(tool, friction_point)`

## Environment-Specific Configuration

### Development
- **Database**: `agentprobe-community-dev`
- **Migration Command**: `npm run db:migrate:dev`
- **Local D1**: Uses `.wrangler/state/v3/d1/` for local development

### Staging
- **Database**: `agentprobe-community-staging`
- **Migration Command**: `npm run db:migrate:staging`
- **Remote D1**: Uses Cloudflare's edge network

### Production
- **Database**: `agentprobe-community-prod`
- **Migration Command**: `npm run db:migrate:prod`
- **Remote D1**: Uses Cloudflare's edge network

## Verification

### Check Database Creation

```bash
# List all D1 databases
npx wrangler d1 list
```

### Test Database Connectivity

```bash
# Test development database
npx wrangler d1 execute agentprobe-community-dev --local --command="SELECT COUNT(*) FROM results"

# Test staging database
npx wrangler d1 execute agentprobe-community-staging --remote --command="SELECT COUNT(*) FROM results"

# Test production database
npx wrangler d1 execute agentprobe-community-prod --remote --command="SELECT COUNT(*) FROM results"
```

### Verify Migration Status

```bash
# Check migration history
npx wrangler d1 migrations list agentprobe-community-dev
npx wrangler d1 migrations list agentprobe-community-staging
npx wrangler d1 migrations list agentprobe-community-prod
```

## GitHub Repository Secrets

For automated CI/CD, add these secrets to your GitHub repository:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Run `npx wrangler whoami` to check login status
   - Re-authenticate with `npx wrangler login`

2. **Database Creation Fails**
   - Ensure you have Workers plan enabled
   - Check API token permissions include D1 access

3. **Migration Fails**
   - Verify database IDs in `wrangler.toml` are correct
   - Check the migration files exist in `./migrations/`
   - Ensure target database exists

4. **Permission Denied**
   - Check API token has D1:edit permissions
   - Verify account ID is correct

### Recovery Commands

```bash
# Delete and recreate a database (if needed)
npx wrangler d1 delete agentprobe-community-dev
npx wrangler d1 create agentprobe-community-dev

# Force re-apply migrations
npx wrangler d1 migrations apply agentprobe-community-dev --local --force
```

## Database Management

### Backup Data

```bash
# Export data to SQL
npx wrangler d1 export agentprobe-community-prod --output=backup.sql
```

### Query Database

```bash
# Interactive SQL console
npx wrangler d1 execute agentprobe-community-dev --local

# Execute specific query
npx wrangler d1 execute agentprobe-community-prod --remote --command="SELECT tool, COUNT(*) FROM results GROUP BY tool"
```

---

**Note**: Replace database IDs in this guide with your actual values after running the setup commands.