# AgentProbe Community

A comprehensive platform for collecting and visualizing CLI test results from the community, consisting of a secure API backend and an intuitive dashboard frontend.

## 🏗️ Project Structure

This is a monorepo containing two main packages:

```
agentprobe-community/
├── packages/
│   ├── api/          # Backend API (Cloudflare Workers + Hono)
│   └── dashboard/    # Frontend Dashboard (Next.js)
├── .github/
│   └── workflows/    # Separate CI/CD for API and Dashboard
└── docs/            # Shared documentation
```

## 🚀 Current Deployments

### API (Backend)
- **Production**: https://agentprobe-community-production.nikola-balic.workers.dev
- **Staging**: https://agentprobe-community-staging.nikola-balic.workers.dev
- **Local Development**: http://localhost:8787

### Dashboard (Frontend)
- **Production**: https://dashboard.agentprobe.dev
- **Staging**: https://staging-dashboard.agentprobe.dev
- **Local Development**: http://localhost:3000

## 🛠️ Technology Stack

### API Backend (`packages/api/`)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: API Key based

### Dashboard Frontend (`packages/dashboard/`)
- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query
- **Charts**: Recharts
- **Deployment**: Cloudflare Pages

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended package manager)
- Cloudflare account (for deployment)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd agentprobe-community
   pnpm install
   ```

2. **Development - Both Services**
   ```bash
   # Start both API and dashboard in development mode with Turbopack
   pnpm run dev
   
   # Run in background with logs
   pnpm run dev > dev.log 2>&1 &
   
   # Or start individually:
   pnpm run dev:api      # API only (localhost:8787)
   pnpm run dev:dashboard # Dashboard only (localhost:3000) - uses Turbopack
   ```

3. **Building**
   ```bash
   # Build both packages
   pnpm run build
   
   # Or build individually:
   pnpm run build:api
   pnpm run build:dashboard
   ```

## 📦 Package Details

### API Package (`packages/api/`)

A secure backend service for collecting and sharing CLI test results, featuring:

- **Security**: API key authentication, rate limiting, security event logging
- **Database**: Comprehensive schema for results, statistics, and user management
- **API**: RESTful endpoints for data submission, querying, and export
- **Monitoring**: Health checks, analytics, and error tracking

**Key Endpoints:**
- `POST /api/v1/results` - Submit test results
- `GET /api/v1/stats/tool/{tool}` - Get tool statistics
- `GET /api/v1/leaderboard` - Get tool leaderboard
- `POST /api/v1/export` - Export data (CSV/JSON)

For detailed API documentation, see [`packages/api/README.md`](packages/api/README.md)

### Dashboard Package (`packages/dashboard/`)

A modern web interface for visualizing community test results, featuring:

- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Charts**: Success rates, performance trends, tool comparisons
- **Data Export**: Export charts and data in various formats
- **Real-time Updates**: Live data from the API backend

**Key Features:**
- Tool leaderboard with success rates
- Scenario-specific performance analytics
- Historical trend analysis
- Exportable reports and visualizations

For detailed dashboard documentation, see [`packages/dashboard/README.md`](packages/dashboard/README.md)

## 🏗️ Deployment

Both packages have separate deployment pipelines:

### API Deployment
- **Platform**: Cloudflare Workers
- **Trigger**: Push to `main` (production) or `develop` (staging)
- **Workflow**: `.github/workflows/deploy.yml`

```bash
# Manual deployment
cd packages/api
pnpm run deploy:prod     # Production
pnpm run deploy:staging  # Staging
```

### Dashboard Deployment
- **Platform**: Cloudflare Pages
- **Trigger**: Push to `main` (production) or `develop` (staging)
- **Workflow**: `.github/workflows/deploy-dashboard.yml`

```bash
# Manual deployment
cd packages/dashboard
pnpm run export  # Build static export
# Then deploy via Cloudflare Pages dashboard
```

For detailed deployment instructions, see:
- [API Deployment Guide](packages/api/DEPLOYMENT.md)
- [Dashboard Deployment Guide](packages/dashboard/DEPLOYMENT.md)

## 🔧 Development Commands

### Workspace Commands (from root)
```bash
# Install dependencies for all packages
pnpm install

# Run development servers for both packages
pnpm run dev

# Build both packages
pnpm run build

# Run tests
pnpm run test

# Type checking across all packages
pnpm run type-check
```

### Package-Specific Commands
```bash
# Work on API only
pnpm --filter @agentprobe/api dev
pnpm --filter @agentprobe/api build
pnpm --filter @agentprobe/api test

# Work on Dashboard only
pnpm --filter @agentprobe/dashboard dev
pnpm --filter @agentprobe/dashboard build
pnpm --filter @agentprobe/dashboard lint
```

## 🧪 API Usage Example

```bash
# Submit a test result to the API
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2025-01-01T00:00:00Z",
    "tool": "claude-cli",
    "scenario": "file-operations",
    "client_info": {
      "agentprobe_version": "1.0.0",
      "os": "macOS",
      "python_version": "3.9.0"
    },
    "execution": {
      "duration": 45.2,
      "total_turns": 8,
      "success": true
    }
  }'

# View results in the dashboard
open https://dashboard.agentprobe.dev/
```

## 🛡️ Security

- **API Security**: Authentication, rate limiting, input validation, audit logging
- **Frontend Security**: Secure API communication, XSS prevention, secure export
- **Infrastructure**: Cloudflare's security features, HTTPS by default
- **Data Protection**: Privacy-focused design, secure data handling

## 📊 Monitoring

### Health Checks
```bash
# API Health
curl https://agentprobe-community-production.nikola-balic.workers.dev/health

# Dashboard Health
curl https://dashboard.agentprobe.dev/
```

### Metrics
- API performance and error rates (Cloudflare Analytics)
- Dashboard usage analytics (Cloudflare Web Analytics)
- Database performance (D1 metrics)
- Security events and rate limiting

## 🤝 Contributing

1. **Setup Development Environment**
   ```bash
   pnpm install
   pnpm run dev
   ```

2. **Make Changes**
   - API changes: Work in `packages/api/`
   - Dashboard changes: Work in `packages/dashboard/`
   - Shared changes: Update root documentation

3. **Testing**
   ```bash
   pnpm run test
   pnpm run type-check
   ```

4. **Submit PR**
   - Separate workflows will test API and dashboard changes
   - Both must pass before merging

## 📝 Documentation

- [API Documentation](packages/api/README.md)
- [Dashboard Documentation](packages/dashboard/README.md)
- [API Deployment Guide](packages/api/DEPLOYMENT.md)
- [Dashboard Deployment Guide](packages/dashboard/DEPLOYMENT.md)

## 📝 License

MIT License - see LICENSE file for details.