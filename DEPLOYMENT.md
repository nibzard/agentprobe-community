# AgentProbe Community - Deployment Guide

This guide covers deploying the AgentProbe Community backend to Cloudflare Workers.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **Node.js**: Version 18+ recommended
4. **Git**: For version control and CI/CD

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
npm install

# Copy environment template
cp .env.example .env

# Get your Cloudflare Account ID
wrangler whoami
```

### 3. Database Setup

Run the automated setup script:

```bash
./scripts/setup-databases.sh
```

This will create three D1 databases:
- `agentprobe-community-dev` (development)
- `agentprobe-community-staging` (staging)
- `agentprobe-community-prod` (production)

### 4. Update Configuration

Update `wrangler.toml` with the database IDs from the setup script:

```toml
[[d1_databases]]
binding = "DB"
database_name = "agentprobe-community-dev"
database_id = "your-dev-database-id"

# ... repeat for staging and production
```

### 5. Generate and Run Migrations

```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations to each environment
npm run db:migrate:dev
npm run db:migrate:staging
npm run db:migrate:prod
```

## Manual Deployment

### Development Deployment

```bash
# Test locally first
npm run dev

# Deploy to development (default environment)
npm run deploy
```

### Staging Deployment

```bash
npm run deploy:staging
```

### Production Deployment

```bash
npm run deploy:prod
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
- CORS: `http://localhost:3000`
- Log level: `debug`

### Staging
- Database: `agentprobe-community-staging`
- CORS: `https://staging.agentprobe.dev`
- Log level: `info`

### Production
- Database: `agentprobe-community-prod`
- CORS: `https://agentprobe.dev,https://www.agentprobe.dev`
- Log level: `info`

## Monitoring and Maintenance

### Health Checks

```bash
# Check staging
./scripts/health-check.sh staging https://agentprobe-community-staging.your-subdomain.workers.dev

# Check production
./scripts/health-check.sh production https://agentprobe-community.your-subdomain.workers.dev
```

### Viewing Logs

```bash
# Staging logs
npm run logs:staging

# Production logs
npm run logs:production
```

### Database Management

```bash
# Open database studio
npm run db:studio

# Create new migration
npm run db:generate

# Apply migrations
npm run db:migrate:prod
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

2. **CORS Errors**
   - Update allowed origins in `wrangler.toml`
   - Redeploy after configuration changes

3. **CI/CD Failures**
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
- Enable security headers in production
- Regular security audits via GitHub Actions
- Monitor for unusual API usage patterns