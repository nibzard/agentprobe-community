# AgentProbe Community - Deployment Guide

This guide covers deploying the AgentProbe Community backend to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally with `pnpm add -g wrangler`
3. **Node.js**: Version 18-22 recommended (v23+ may have compatibility issues with some dependencies)
4. **Git**: For version control and CI/CD

## Current Deployment Status

✅ **Successfully Deployed:**
- **Production**: https://agentprobe-community-production.nikola-balic.workers.dev
- **Staging**: https://agentprobe-community-staging.nikola-balic.workers.dev
- **Local Development**: http://localhost:8787

All environments are healthy and operational with D1 databases fully migrated.

## Initial Setup

### 1. Authentication

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 2. Environment Setup

```bash
# Install dependencies
pnpm install

# Get your Cloudflare Account ID
wrangler whoami
```

**Note**: If you encounter native compilation errors with `better-sqlite3`, use `--ignore-scripts` flag. This package is only used for local development; production uses Cloudflare D1.

### 3. Database Setup

**Manual Database Creation** (recommended approach):

```bash
# Create databases for each environment
wrangler d1 create agentprobe-community-dev
wrangler d1 create agentprobe-community-staging
wrangler d1 create agentprobe-community-prod
```

This will create three D1 databases:
- `agentprobe-community-dev` (development)
- `agentprobe-community-staging` (staging)
- `agentprobe-community-prod` (production)

**Note**: If you get authentication errors, try `wrangler logout && wrangler login` to refresh your token.

### 4. Update Configuration

Update `wrangler.toml` with the database IDs from the database creation output:

```toml
# Development environment
[[d1_databases]]
binding = "DB"
database_name = "agentprobe-community-dev"
database_id = "your-dev-database-id"

# Production environment
[[env.production.d1_databases]]
binding = "DB"
database_name = "agentprobe-community-prod"
database_id = "your-prod-database-id"

# Staging environment
[[env.staging.d1_databases]]
binding = "DB"
database_name = "agentprobe-community-staging"
database_id = "your-staging-database-id"
```

### 5. Generate and Run Migrations

**Due to Node.js v23+ compatibility issues**, manually create migrations:

```bash
# Create migrations directory
mkdir -p migrations

# Apply migrations to each environment
wrangler d1 migrations apply agentprobe-community-dev --local
wrangler d1 migrations apply DB --env staging --remote
wrangler d1 migrations apply DB --env production --remote
```

**Note**: Use the binding name `DB` with `--env` flag for staging and production environments.

## Manual Deployment

### Development Deployment

```bash
# Test locally first
pnpm run dev

# Deploy to development (default environment)
pnpm run deploy
```

### Staging Deployment

```bash
pnpm run deploy:staging
```

### Production Deployment

```bash
pnpm run deploy:prod
```

## GitHub Actions CI/CD

### Required Secrets

Set these secrets in your GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID

### Deployment Triggers

- **Staging**: Pushes to `develop` branch
- **Production**: Pushes to `main` branch
- **Testing**: All pull requests

### Workflow Features

- Type checking and linting
- Unit tests
- Security scanning
- Automated migrations
- Health checks
- Rollback on failure

## Environment Configuration

### Development
- Database: `agentprobe-community-dev`
- CORS: `http://localhost:3000,https://agentprobe.dev`
- Log level: `debug`
- URL: http://localhost:8787

### Staging
- Database: `agentprobe-community-staging`
- CORS: `https://staging.agentprobe.dev`
- Log level: `info`
- URL: https://agentprobe-community-staging.nikola-balic.workers.dev

### Production
- Database: `agentprobe-community-prod`
- CORS: `https://agentprobe.dev,https://www.agentprobe.dev`
- Log level: `info`
- URL: https://agentprobe-community-production.nikola-balic.workers.dev

## Monitoring and Maintenance

### Health Checks

```bash
# Check staging
curl https://agentprobe-community-staging.nikola-balic.workers.dev/health

# Check production
curl https://agentprobe-community-production.nikola-balic.workers.dev/health

# Check local development
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2025-08-04T18:32:56.705Z",
  "uptime": 407,
  "checks": {
    "database": "healthy",
    "api": "healthy"
  },
  "stats": {
    "total_results": 0,
    "total_tools": 0,
    "total_scenarios": 0,
    "last_submission": null
  }
}
```

### Viewing Logs

```bash
# Staging logs
pnpm run logs:staging

# Production logs
pnpm run logs:production
```

### Database Management

```bash
# Open database studio
pnpm run db:studio

# Create new migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate:prod
```

## Custom Domain Setup

1. Add your domain to Cloudflare
2. Configure DNS settings
3. Update CORS settings in `wrangler.toml`
4. Deploy with updated configuration

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database IDs in `wrangler.toml`
   - Check API token permissions
   - Ensure migrations are applied
   - Try `wrangler logout && wrangler login` to refresh authentication

2. **Analytics Engine Errors**
   ```
   You need to enable Analytics Engine
   ```
   **Solution**: Comment out `analytics_engine_datasets` sections in `wrangler.toml` or enable Analytics Engine in Cloudflare Dashboard

3. **Node.js Compatibility Issues**
   ```
   Error [ERR_PACKAGE_PATH_NOT_EXPORTED]
   ```
   **Solution**: Use Node.js v18-22, avoid v23+. Use `pnpm install` for dependencies - pnpm handles native compilation issues automatically.

4. **Better-sqlite3 Compilation Errors**
   ```
   gyp ERR! build error
   ```
   **Solution**: Use `pnpm install`. pnpm handles native compilation issues automatically and this package is only for local development.

5. **Migration Application Errors**
   ```
   Couldn't find a D1 DB with the name
   ```
   **Solution**: Use `wrangler d1 migrations apply DB --env staging --remote` format with environment flags.

6. **CORS Errors**
   - Update allowed origins in `wrangler.toml`
   - Redeploy after configuration changes

7. **CI/CD Failures**
   - Check GitHub secrets are set correctly
   - Verify Cloudflare API token has required permissions
   - Review GitHub Actions logs

### Rollback Procedure

If a deployment fails:

1. Check the GitHub Actions logs
2. Identify the last working commit
3. Create a new deployment from the working commit
4. Monitor health checks

### Support

- **Cloudflare Workers Docs**: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)
- **D1 Database Docs**: [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1)
- **Wrangler CLI Docs**: [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler)

## Security Considerations

- API tokens should never be committed to version control
- Use environment-specific configurations
- Enable security headers in production (implemented automatically)
- Regular security audits via GitHub Actions
- Monitor for unusual API usage patterns
- Analytics Engine is disabled by default for security - enable only if needed
- All endpoints require API key authentication except `/health` and `/`
- Rate limiting is active on all environments

## Post-Deployment Steps

1. **Create Admin API Key**
   ```bash
   # Use the provided script to create initial admin key
   node scripts/create-admin-key.js
   ```

2. **Test API Endpoints**
   ```bash
   # Test with the health endpoint
   curl https://your-domain.workers.dev/health
   
   # Test API root
   curl https://your-domain.workers.dev/
   ```

3. **Monitor Security Events**
   - Check security events via admin API
   - Monitor rate limiting patterns
   - Review authentication failures

4. **Set up Custom Domains** (Optional)
   - Add domains to Cloudflare
   - Update CORS settings
   - Redeploy with updated configuration