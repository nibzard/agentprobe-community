# API Endpoints Reference

*Auto-generated from source code analysis*

This document provides a complete reference of all available API endpoints in the AgentProbe Community API.

## Base URLs

- **Production**: `https://agentprobe-community-production.nikola-balic.workers.dev`
- **Staging**: `https://agentprobe-community-staging.nikola-balic.workers.dev`
- **Local**: `http://localhost:8787`

## Authentication

Most endpoints require API key authentication. Include your API key in one of these headers:
- `Authorization: Bearer <api_key>`
- `X-API-Key: <api_key>`

## Permission Levels

- `read` - Access to view data and statistics  
- `write` - Access to submit test results
- `admin` - Full administrative access
- `manage_keys` - Manage API keys

## Endpoints

### Public

#### `GET /`

Root endpoint

#### `GET /health`

Routes

### Authentication

#### `GET /api/v1/auth/keys` *requires: manage_keys*

API keys list query validation schema

#### `POST /api/v1/auth/keys` *requires: admin*

Authentication endpoints

#### `GET /api/v1/auth/keys/:keyId` *requires: manage_keys*

Get API key details (key management permission required)

#### `PUT /api/v1/auth/keys/:keyId` *requires: manage_keys*

Update API key (key management permission required)

#### `DELETE /api/v1/auth/keys/:keyId` *requires: manage_keys*

Deactivate API key (key management permission required)

#### `GET /api/v1/auth/rate-limit` *requires: read*

Get rate limit status for current key

#### `GET /api/v1/auth/security-events` *requires: admin*

Cap at 1000 for performance

### Data Submission

#### `GET /api/v1/results` *requires: read*

Query results (requires read permission)

#### `POST /api/v1/results` *requires: write*

Data endpoints

#### `POST /api/v1/results/batch` *requires: write*

Batch submission endpoint (requires write permission)

### Statistics

#### `GET /api/v1/leaderboard` *optional auth*

Leaderboard (public access for dashboard)

#### `GET /api/v1/stats/aggregate` *optional auth*

Aggregate statistics endpoint (public access for dashboard)

#### `GET /api/v1/stats/scenario/:tool/:scenario` *requires: read*

Scenario statistics (requires read permission)

#### `GET /api/v1/stats/tool/:tool` *requires: read*

Tool statistics (requires read permission)

### Analysis

#### `POST /api/v1/compare/tools` *requires: read*

Tool comparison endpoint (requires read permission)

#### `POST /api/v1/export` *requires: read*

Data export endpoint (requires read permission)

#### `GET /api/v1/scenarios/difficulty` *optional auth*

Scenario difficulty ranking endpoint (public access for dashboard)

## Response Format

All endpoints return responses in this format:

```json
{
  "status": "success" | "error",
  "data": <response_data>,
  "message": "<optional_message>",
  "timestamp": "<iso_timestamp>",
  "error": "<error_message>",    // Only present on errors
  "code": "<error_code>",        // Only present on errors
  "path": "<request_path>"       // Only present on errors
}
```

## Rate Limits

- IP-based: 1000 requests per hour per IP
- API key-based: Configurable per key (default varies by permission level)
- Batch operations: Higher limits for efficient data submission

*Last updated: 2025-08-05T15:26:26.765Z*
