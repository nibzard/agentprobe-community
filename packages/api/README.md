# AgentProbe Community API

A secure backend service for collecting and sharing CLI test results from the community, built with Cloudflare Workers, Hono, and D1 database.

## 🚀 Current Deployments

- **Production**: https://agentprobe-community-production.nikola-balic.workers.dev
- **Staging**: https://agentprobe-community-staging.nikola-balic.workers.dev
- **Local Development**: http://localhost:8787

## 🛠️ Technology Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: API Key based

## 🔐 Security Features

### Authentication & Authorization
- **API Key Authentication**: Secure API keys with Bearer token or X-API-Key header support
- **Permission-based Access Control**: Granular permissions (read, write, admin, manage_keys)
- **Rate Limiting**: Multi-layered rate limiting (IP-based, API key-based)
- **Security Event Logging**: Comprehensive audit trail of security events

### API Security
- **Input Validation**: Comprehensive input validation and sanitization with Zod
- **CORS Configuration**: Production-ready CORS settings
- **Security Headers**: Helmet.js equivalent security headers
- **Request Filtering**: Suspicious request pattern detection
- **CSV Injection Protection**: Secure data export with formula injection prevention

### Data Protection
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **XSS Prevention**: Input sanitization and secure response handling
- **Secure Export**: Safe CSV/JSON export with injection prevention
- **Data Anonymization**: Client ID hashing for privacy

## 📡 API Endpoints

### Public Endpoints
- `GET /` - API information and endpoint listing
- `GET /health` - Health check with database status

### Authentication Endpoints (Admin/Key Management Required)
- `POST /api/v1/auth/keys` - Create new API key (admin only)
- `GET /api/v1/auth/keys` - List API keys (key management permission)
- `GET /api/v1/auth/keys/{keyId}` - Get API key details
- `PUT /api/v1/auth/keys/{keyId}` - Update API key
- `DELETE /api/v1/auth/keys/{keyId}` - Deactivate API key
- `GET /api/v1/auth/rate-limit` - Get rate limit status
- `GET /api/v1/auth/security-events` - View security events (admin only)

### Data Endpoints (Read/Write Permissions Required)
- `POST /api/v1/results` - Submit test result (write permission)
- `POST /api/v1/results/batch` - Batch submit results (write permission)
- `GET /api/v1/results` - Query test results (read permission)
- `GET /api/v1/stats/tool/{tool}` - Get tool statistics
- `GET /api/v1/stats/scenario/{tool}/{scenario}` - Get scenario statistics
- `GET /api/v1/stats/aggregate` - Get aggregate statistics
- `GET /api/v1/leaderboard` - Get tool leaderboard
- `POST /api/v1/compare/tools` - Compare multiple tools
- `GET /api/v1/scenarios/difficulty` - Get scenario difficulty ranking
- `POST /api/v1/export` - Export data (CSV/JSON)

## 🗄️ Database Schema

### Core Tables
- **results**: Test execution results with metadata
- **tool_stats**: Aggregated statistics per tool/scenario
- **friction_point_stats**: Common friction points tracking
- **api_keys**: API key management and permissions
- **rate_limits**: API usage rate limiting
- **security_events**: Security audit logging

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Cloudflare account
- Wrangler CLI: `pnpm add -g wrangler`

### Local Development

1. **Install Dependencies** (from project root)
   ```bash
   pnpm install
   ```

2. **Authenticate with Cloudflare**
   ```bash
   wrangler login
   ```

3. **Start Development Server**
   ```bash
   # From project root
   pnpm run dev:api
   
   # Or from this package
   cd packages/api
   pnpm run dev
   ```
   Server will be available at http://localhost:8787

### API Usage Example

```bash
# Create an API key (requires admin privileges)
curl -X POST https://your-domain.workers.dev/api/v1/auth/keys \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "permissions": ["read", "write"]}'

# Submit a test result
curl -X POST https://your-domain.workers.dev/api/v1/results \
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
    },
    "analysis": {
      "friction_points": ["slow-response"],
      "help_usage_count": 1,
      "recommendations": ["optimize-prompts"]
    }
  }'

# Get tool statistics
curl -H "X-API-Key: YOUR_API_KEY" \
  https://your-domain.workers.dev/api/v1/stats/tool/claude-cli
```

## 🏗️ Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment:
```bash
# Deploy to staging
pnpm run deploy:staging

# Deploy to production  
pnpm run deploy:prod
```

## 📊 Monitoring

### Health Checks
```bash
curl https://your-domain.workers.dev/health
```

### Security Monitoring
- Security events are logged to the database
- Failed authentication attempts are tracked
- Rate limit violations are monitored
- Suspicious request patterns are flagged

## 🔧 Configuration

### Environment Variables (in wrangler.toml)
- `ENVIRONMENT`: Runtime environment (development/staging/production)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `CORS_ORIGINS`: Comma-separated list of allowed origins

### Permission Levels
- **read**: Access to view data and statistics
- **write**: Access to submit test results
- **admin**: Full administrative access
- **manage_keys**: Manage API keys

## 🛡️ Security Best Practices

- Never commit API keys or secrets to version control
- Use environment-specific configurations
- Monitor security events regularly
- Implement proper CORS for production domains
- Regularly rotate API keys
- Monitor rate limiting patterns for abuse

## 🤝 Contributing

1. Follow secure coding practices
2. Add input validation for new endpoints
3. Include comprehensive error handling
4. Update documentation for API changes
5. Test security implications of changes

## 📝 Documentation

- [Authentication Setup](./AUTH_SETUP.md)
- [Database Setup](./DATABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 📝 License

MIT License - see LICENSE file for details.