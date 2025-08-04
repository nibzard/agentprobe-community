# AgentProbe Community Authentication Setup

This document provides a comprehensive guide for setting up and managing the authentication system in AgentProbe Community.

## Overview

The authentication system provides:
- **API Key Authentication**: Secure token-based authentication using industry-standard cryptographic practices
- **Role-Based Permissions**: Granular permissions for different operations
- **Rate Limiting**: Configurable rate limits per API key
- **Security Auditing**: Comprehensive logging of security events
- **Cloudflare Workers Compatible**: Designed specifically for edge computing environments

## Quick Start

### 1. Database Setup

First, apply the authentication migration to your D1 database:

```bash
npx wrangler d1 execute agentprobe-db --file=./migrations/001_add_auth_tables.sql
```

### 2. Generate Bootstrap Admin Key

```bash
node scripts/create-admin-key.js
```

This will output an SQL statement to insert your first admin API key. Execute this in your D1 database:

```bash
npx wrangler d1 execute agentprobe-db --command="INSERT INTO api_keys (key_id, hashed_key, name, permissions, is_active, rate_limit, created_by) VALUES ('ap_...', 'salt:hash...', 'Bootstrap Admin Key', '[\"admin\"]', 1, 10000, 'bootstrap');"
```

### 3. Test Authentication

Test your admin key:

```bash
curl -H "Authorization: Bearer ap_your_generated_key_here" \
  https://your-worker.your-subdomain.workers.dev/health
```

## API Key Management

### Creating API Keys

Only users with `admin` or `manage_keys` permissions can create new API keys:

```bash
curl -X POST \
  -H "Authorization: Bearer your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Submission Key",
    "permissions": ["write"],
    "rateLimit": 500
  }' \
  https://your-api.workers.dev/api/v1/auth/keys
```

### Listing API Keys

```bash
curl -H "Authorization: Bearer your_admin_key" \
  https://your-api.workers.dev/api/v1/auth/keys
```

### Updating API Keys

```bash
curl -X PUT \
  -H "Authorization: Bearer your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Key Name",
    "rateLimit": 1000,
    "isActive": false
  }' \
  https://your-api.workers.dev/api/v1/auth/keys/ap_keyid
```

## Permission System

### Available Permissions

- **`read`**: Access to view data and statistics
- **`write`**: Access to submit test results and data
- **`admin`**: Full administrative access (includes all permissions)
- **`manage_keys`**: Ability to create and manage API keys

### Permission Requirements by Endpoint

| Endpoint | Required Permission |
|----------|-------------------|
| `GET /health` | None (public) |
| `GET /` | None (public) |
| `POST /api/v1/results` | `write` |
| `POST /api/v1/results/batch` | `write` |
| `GET /api/v1/results` | `read` |
| `GET /api/v1/stats/*` | `read` |
| `GET /api/v1/leaderboard` | `read` |
| `POST /api/v1/compare/tools` | `read` |
| `POST /api/v1/export` | `read` |
| `POST /api/v1/auth/keys` | `admin` |
| `GET /api/v1/auth/keys` | `manage_keys` |
| `PUT /api/v1/auth/keys/*` | `manage_keys` |
| `DELETE /api/v1/auth/keys/*` | `manage_keys` |
| `GET /api/v1/auth/security-events` | `admin` |

## Rate Limiting

### Per-API-Key Rate Limiting

Each API key has a configurable rate limit (requests per hour):
- Default: 100 requests/hour
- Maximum: 10,000 requests/hour
- Tracked using sliding window algorithm

### IP-Based Rate Limiting

Additional protection against abuse:
- 1,000 requests per hour per IP address
- Applies before API key validation
- Blocked IPs receive 429 status code

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1641234567
```

## Security Features

### Cryptographic Security

- **Key Generation**: Uses Web Crypto API with 256-bit entropy
- **Password Hashing**: PBKDF2 with SHA-256, 100,000 iterations
- **Constant-Time Comparison**: Prevents timing attacks
- **Secure Random Generation**: Cryptographically secure random numbers

### Input Validation & Sanitization

- All inputs are validated and sanitized
- XSS prevention through HTML encoding
- SQL injection prevention through parameterized queries
- Length limits to prevent DOS attacks

### Security Headers

Standard security headers are automatically applied:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'
```

### Audit Logging

All security events are logged:
- Authentication attempts (success/failure)
- Rate limit violations
- Suspicious requests
- API key management actions
- Permission violations

## API Usage Examples

### Using API Keys

API keys can be provided in two ways:

1. **Authorization Header (Recommended)**:
```bash
curl -H "Authorization: Bearer ap_1234567890abcdef_fedcba0987654321" \
  https://your-api.workers.dev/api/v1/results
```

2. **X-API-Key Header**:
```bash
curl -H "X-API-Key: ap_1234567890abcdef_fedcba0987654321" \
  https://your-api.workers.dev/api/v1/results
```

### Submitting Data

```bash
curl -X POST \
  -H "Authorization: Bearer your_write_key" \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-01T12:00:00Z",
    "tool": "gpt-4",
    "scenario": "data_analysis",
    "client_info": {
      "agentprobe_version": "1.0.0",
      "os": "linux",
      "python_version": "3.11"
    },
    "execution": {
      "duration": 45.5,
      "total_turns": 3,
      "success": true
    },
    "analysis": {
      "friction_points": ["api_rate_limit"],
      "help_usage_count": 1,
      "recommendations": ["optimize_prompts"]
    }
  }' \
  https://your-api.workers.dev/api/v1/results
```

### Reading Data

```bash
curl -H "Authorization: Bearer your_read_key" \
  "https://your-api.workers.dev/api/v1/results?tool=gpt-4&limit=10"
```

## Monitoring & Maintenance

### Check Rate Limit Status

```bash
curl -H "Authorization: Bearer your_key" \
  https://your-api.workers.dev/api/v1/auth/rate-limit
```

### View Security Events (Admin)

```bash
curl -H "Authorization: Bearer your_admin_key" \
  "https://your-api.workers.dev/api/v1/auth/security-events?limit=50"
```

### Periodic Cleanup

The system includes automatic cleanup of old data:
- Rate limit records older than 24 hours
- Expired API keys (deactivated automatically)

For manual cleanup, call the internal endpoint:
```bash
curl https://your-api.workers.dev/api/v1/internal/cleanup
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check API key format
   - Verify key is active and not expired
   - Ensure key has required permissions

2. **429 Rate Limited**
   - Check rate limit headers
   - Wait for rate limit window to reset
   - Consider requesting higher rate limits

3. **403 Forbidden**
   - Verify API key has required permissions
   - Check if request appears suspicious to filters

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_MISSING` | No API key provided |
| `AUTH_INVALID_FORMAT` | API key format is invalid |
| `AUTH_INVALID` | API key not found or invalid secret |
| `AUTH_INACTIVE` | API key has been deactivated |
| `AUTH_EXPIRED` | API key has expired |
| `AUTH_INSUFFICIENT_PERMISSIONS` | API key lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | API key rate limit exceeded |
| `IP_RATE_LIMIT` | IP address rate limit exceeded |
| `SUSPICIOUS_REQUEST` | Request blocked by security filters |

## Best Practices

### API Key Management

1. **Use Specific Permissions**: Grant only the minimum required permissions
2. **Regular Rotation**: Rotate API keys periodically
3. **Monitor Usage**: Review security logs regularly
4. **Separate Keys**: Use different keys for different applications
5. **Secure Storage**: Store API keys securely (environment variables, secrets managers)

### Rate Limiting

1. **Set Appropriate Limits**: Configure rate limits based on actual usage patterns
2. **Handle Rate Limits**: Implement exponential backoff in client code
3. **Monitor Limits**: Track rate limit usage to anticipate needs

### Security

1. **Use HTTPS**: Always use HTTPS in production
2. **Log Monitoring**: Monitor security event logs
3. **Regular Updates**: Keep dependencies updated
4. **Access Review**: Regularly review API key access and permissions

## Development & Testing

### Local Development

For local development, you can disable authentication by setting an environment variable:

```bash
export AGENTPROBE_DEV_MODE=true
```

### Testing

The authentication system includes comprehensive test coverage. Run tests with:

```bash
npm test
```

### Debugging

Enable debug logging by setting:

```bash
export DEBUG=agentprobe:auth
```

## Production Deployment

### Environment Variables

Configure these in your Cloudflare Workers environment:

```bash
# Optional: Disable authentication for development
AGENTPROBE_DEV_MODE=false

# Optional: Custom rate limits
DEFAULT_RATE_LIMIT=100
MAX_RATE_LIMIT=10000

# Optional: Additional allowed origins for CORS
ALLOWED_ORIGINS=https://agentprobe.dev,https://dashboard.agentprobe.dev
```

### Wrangler Configuration

Update your `wrangler.toml`:

```toml
[env.production]
name = "agentprobe-community-prod"
vars = { ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "agentprobe-prod"
database_id = "your-d1-database-id"
```

### Deployment

```bash
npx wrangler deploy --env production
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review security event logs for authentication issues
3. Consult the AgentProbe Community documentation
4. Open an issue in the project repository

---

**⚠️ Security Notice**: This authentication system handles sensitive data. Always follow security best practices and regularly review access logs.