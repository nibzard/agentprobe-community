# API Usage Guide

Complete guide to integrating with the AgentProbe Community API, including authentication, data submission, querying, and best practices.

## Base URLs

- **Production**: `https://agentprobe-community-production.nikola-balic.workers.dev`
- **Staging**: `https://agentprobe-community-staging.nikola-balic.workers.dev`
- **Local Development**: `http://localhost:8787`

## Authentication

### API Key Headers

Include your API key in requests using either header format:

```bash
# Bearer token format
Authorization: Bearer your_api_key_here

# Custom header format (recommended)
X-API-Key: your_api_key_here
```

### Permission Levels

- **read**: View data and statistics
- **write**: Submit test results  
- **admin**: Full administrative access
- **manage_keys**: Create and manage API keys

## Core API Operations

### 1. Health Check

Verify API connectivity and get system status:

```bash
curl https://agentprobe-community-production.nikola-balic.workers.dev/health
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "production",
    "checks": {
      "database": "healthy",
      "api": "healthy"
    },
    "stats": {
      "total_results": 15420,
      "total_tools": 28,
      "total_scenarios": 45,
      "last_submission": "2025-01-01T12:00:00Z"
    }
  }
}
```

### 2. Submit Test Results

Submit individual test results:

```bash
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-01-01T14:30:00Z",
    "tool": "claude-cli",
    "scenario": "file-operations",
    "client_info": {
      "agentprobe_version": "1.2.0",
      "os": "macOS",
      "python_version": "3.11.0"
    },
    "execution": {
      "duration": 42.5,
      "total_turns": 6,
      "success": true,
      "error_message": null
    },
    "analysis": {
      "friction_points": ["initial-setup"],
      "help_usage_count": 0,
      "recommendations": ["cache-optimization"]
    },
    "client_id": "optional-client-identifier"
  }'
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Result submitted successfully",
  "timestamp": "2025-01-01T14:30:15Z"
}
```

### 3. Batch Submit Results

Submit multiple results efficiently:

```bash
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results/batch \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "results": [
      {
        "run_id": "550e8400-e29b-41d4-a716-446655440001",
        "timestamp": "2025-01-01T14:30:00Z",
        "tool": "claude-cli",
        "scenario": "code-generation",
        "client_info": { /* ... */ },
        "execution": { /* ... */ },
        "analysis": { /* ... */ }
      },
      {
        "run_id": "550e8400-e29b-41d4-a716-446655440002",
        "timestamp": "2025-01-01T14:31:00Z",
        "tool": "claude-cli", 
        "scenario": "debugging",
        "client_info": { /* ... */ },
        "execution": { /* ... */ },
        "analysis": { /* ... */ }
      }
    ],
    "metadata": {
      "batch_id": "daily_regression_2025_01_01",
      "source": "automated_testing",
      "description": "Daily regression test suite"
    }
  }'
```

### 4. Query Test Results

Retrieve test results with filtering:

```bash
# Get recent results
curl -H "X-API-Key: your_api_key" \
  "https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results?limit=50"

# Filter by tool
curl -H "X-API-Key: your_api_key" \
  "https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results?tool=claude-cli&limit=100"

# Filter by success/failure
curl -H "X-API-Key: your_api_key" \
  "https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results?success=false&limit=20"
```

### 5. Get Statistics

#### Tool Statistics
```bash
curl -H "X-API-Key: your_api_key" \
  https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/stats/tool/claude-cli
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "tool": "claude-cli",
    "total_runs": 1250,
    "success_rate": 0.89,
    "avg_duration": 38.7,
    "avg_cost": 0,
    "common_friction_points": [
      "initial-setup",
      "authentication",
      "slow-response"
    ],
    "scenarios": {
      "file-operations": {
        "total_runs": 420,
        "success_rate": 0.92,
        "avg_duration": 25.3
      },
      "code-generation": {
        "total_runs": 380,
        "success_rate": 0.87,
        "avg_duration": 45.2
      }
    }
  }
}
```

#### Leaderboard
```bash
curl -H "X-API-Key: your_api_key" \
  https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/leaderboard
```

#### Scenario Difficulty
```bash
curl https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/scenarios/difficulty
```

### 6. Export Data

Export filtered data in CSV or JSON format:

```bash
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/export \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "filters": {
      "tool": "claude-cli",
      "scenario": "file-operations",
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-01-31T23:59:59Z"
    },
    "fields": [
      "timestamp",
      "tool",
      "scenario", 
      "success",
      "duration",
      "total_turns"
    ]
  }'
```

## Integration Examples

### Python Integration

```python
import requests
import json
from datetime import datetime
import uuid

class AgentProbeClient:
    def __init__(self, api_key, base_url="https://agentprobe-community-production.nikola-balic.workers.dev"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }
    
    def submit_result(self, tool, scenario, success, duration, total_turns, 
                     friction_points=None, error_message=None):
        """Submit a single test result"""
        result = {
            "run_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "tool": tool,
            "scenario": scenario,
            "client_info": {
                "agentprobe_version": "1.0.0",
                "os": "Python Integration",
                "python_version": "3.9.0"
            },
            "execution": {
                "duration": duration,
                "total_turns": total_turns,
                "success": success,
                "error_message": error_message
            },
            "analysis": {
                "friction_points": friction_points or [],
                "help_usage_count": 0,
                "recommendations": []
            }
        }
        
        response = requests.post(
            f"{self.base_url}/api/v1/results",
            headers=self.headers,
            json=result
        )
        return response.json()
    
    def get_tool_stats(self, tool):
        """Get statistics for a specific tool"""
        response = requests.get(
            f"{self.base_url}/api/v1/stats/tool/{tool}",
            headers=self.headers
        )
        return response.json()
    
    def get_leaderboard(self):
        """Get the current leaderboard"""
        response = requests.get(
            f"{self.base_url}/api/v1/leaderboard",
            headers=self.headers
        )
        return response.json()

# Usage example
client = AgentProbeClient("your_api_key_here")

# Submit a test result
result = client.submit_result(
    tool="my-cli-tool",
    scenario="file-operations", 
    success=True,
    duration=35.2,
    total_turns=5,
    friction_points=["slow-startup"]
)
print("Submitted:", result)

# Get tool statistics
stats = client.get_tool_stats("my-cli-tool")
print("Tool stats:", stats)
```

### Node.js Integration

```javascript
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AgentProbeClient {
  constructor(apiKey, baseUrl = 'https://agentprobe-community-production.nikola-balic.workers.dev') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async submitResult(tool, scenario, success, duration, totalTurns, options = {}) {
    const result = {
      run_id: uuidv4(),
      timestamp: new Date().toISOString(),
      tool,
      scenario,
      client_info: {
        agentprobe_version: '1.0.0',
        os: 'Node.js Integration',
        python_version: 'N/A'
      },
      execution: {
        duration,
        total_turns: totalTurns,
        success,
        error_message: options.errorMessage || null
      },
      analysis: {
        friction_points: options.frictionPoints || [],
        help_usage_count: options.helpUsageCount || 0,
        recommendations: options.recommendations || []
      }
    };

    try {
      const response = await this.client.post('/api/v1/results', result);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit result: ${error.response?.data?.error || error.message}`);
    }
  }

  async getToolStats(tool) {
    try {
      const response = await this.client.get(`/api/v1/stats/tool/${tool}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get tool stats: ${error.response?.data?.error || error.message}`);
    }
  }

  async batchSubmit(results, metadata = {}) {
    const batchData = {
      results,
      metadata: {
        batch_id: metadata.batchId || `batch_${Date.now()}`,
        source: metadata.source || 'nodejs_integration',
        description: metadata.description
      }
    };

    try {
      const response = await this.client.post('/api/v1/results/batch', batchData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit batch: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Usage example
const client = new AgentProbeClient('your_api_key_here');

async function example() {
  try {
    // Submit a single result
    const result = await client.submitResult(
      'my-node-tool',
      'api-integration',
      true,
      28.5,
      4,
      {
        frictionPoints: ['authentication'],
        helpUsageCount: 1
      }
    );
    console.log('Submitted:', result);

    // Get tool statistics
    const stats = await client.getToolStats('my-node-tool');
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Error Handling

### Common Error Codes

- `AUTH_MISSING`: No API key provided
- `AUTH_INVALID`: Invalid API key format
- `AUTH_KEY_NOT_FOUND`: API key not found
- `AUTH_INSUFFICIENT_PERMISSIONS`: Missing required permissions
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `VALIDATION_ERROR`: Invalid request data
- `TOOL_NOT_FOUND`: Requested tool has no data
- `EXPORT_ERROR`: Data export failed

### Error Response Format

```json
{
  "status": "error",
  "error": "Rate limit exceeded",
  "message": "Too many requests from this API key",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-01-01T14:30:00Z",
  "path": "/api/v1/results"
}
```

### Retry Logic

Implement exponential backoff for rate limits:

```python
import time
import random

def submit_with_retry(client, data, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.submit_result(**data)
        except Exception as e:
            if 'rate limit' in str(e).lower() and attempt < max_retries - 1:
                # Exponential backoff with jitter
                delay = (2 ** attempt) + random.uniform(0, 1)
                time.sleep(delay)
                continue
            raise e
```

## Rate Limits & Performance

### Rate Limits
- **IP-based**: 1000 requests/hour per IP address
- **API key-based**: Varies by permission level and key configuration
- **Batch operations**: Higher limits for efficiency

### Performance Tips
- Use batch submissions for multiple results
- Implement client-side caching for statistics
- Include only necessary fields in queries
- Use appropriate pagination limits

### Monitoring Usage
```bash
# Check your current rate limit status
curl -H "X-API-Key: your_api_key" \
  https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/auth/rate-limit
```

## Best Practices

### Data Quality
1. **Consistent Naming**: Use standardized tool and scenario names
2. **Accurate Timing**: Measure execution time precisely
3. **Complete Data**: Include all relevant fields
4. **Error Details**: Provide meaningful error messages for failures

### Security
1. **API Key Management**: Keep keys secure, rotate regularly
2. **Environment Variables**: Store keys in environment variables
3. **No Sensitive Data**: Never include secrets in submissions
4. **HTTPS Only**: Always use HTTPS endpoints

### Performance
1. **Batch Submissions**: Group multiple results when possible
2. **Efficient Queries**: Use appropriate filters and limits
3. **Caching**: Cache statistics data that doesn't change frequently
4. **Error Handling**: Implement proper retry logic

### Community
1. **Standard Scenarios**: Use established scenario names
2. **Meaningful Tools**: Use descriptive tool identifiers
3. **Quality Data**: Submit legitimate test results only
4. **Documentation**: Document your integration patterns

This guide covers the essential patterns for integrating with the AgentProbe Community API. For additional examples and advanced usage, see the complete API reference documentation.