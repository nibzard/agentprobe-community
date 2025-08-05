# Getting Started with AgentProbe Community

Welcome to AgentProbe Community! This guide will help you get started with using both the API and dashboard to submit test results and analyze community data.

## Overview

AgentProbe Community consists of two main components:

- **API Backend**: Secure service for submitting and querying test results
- **Dashboard**: Web interface for visualizing community statistics and insights

## Quick Start

### 1. View Community Data (No Setup Required)

You can immediately explore community insights through the dashboard:

**🌐 Visit**: https://dashboard.agentprobe.dev

**Key Features**:
- Tool performance leaderboard
- Scenario difficulty rankings  
- Success rate trends over time
- Community statistics and metrics

### 2. Submit Your Test Results

To contribute test results to the community, you'll need an API key.

#### Request API Access

Contact the project maintainers to request an API key:
- Include your use case and expected submission volume
- API keys are granted for legitimate research and development purposes
- Community contributions are encouraged and prioritized

#### API Key Setup

Once you receive your API key:

```bash
# Set your API key as an environment variable
export AGENTPROBE_API_KEY="your_api_key_here"

# Or include in requests directly
curl -H "X-API-Key: your_api_key_here" \
  https://agentprobe-community-production.nikola-balic.workers.dev/health
```

### 3. Submit Your First Test Result

```bash
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results \
  -H "X-API-Key: $AGENTPROBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "run_id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2025-01-01T12:00:00Z",
    "tool": "your-cli-tool",
    "scenario": "basic-file-operations",
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
```

## Understanding the Data Model

### Test Result Structure

Every test result submission includes:

**Core Information**:
- `run_id`: Unique identifier for this test run
- `timestamp`: When the test was executed  
- `tool`: Name of the CLI tool being tested
- `scenario`: Test scenario identifier

**Client Environment**:
- `agentprobe_version`: Version of testing framework
- `os`: Operating system (macOS, Linux, Windows)
- `python_version`: Python runtime version

**Execution Metrics**:
- `duration`: Test execution time in seconds
- `total_turns`: Number of interaction turns
- `success`: Whether the test passed or failed
- `error_message`: Error details if test failed

**Analysis Data**:
- `friction_points`: Issues encountered during execution
- `help_usage_count`: How often help was requested
- `recommendations`: Suggested improvements

### Common Scenarios

Popular test scenarios in the community:

- `file-operations`: Basic file creation, reading, writing
- `code-generation`: Generating code files and projects
- `data-analysis`: Processing and analyzing data files
- `debugging`: Identifying and fixing code issues
- `system-admin`: System administration tasks
- `web-scraping`: Extracting data from web sources

## Dashboard Navigation

### Home Page
- **Overview Statistics**: Community-wide metrics
- **Success Rate Trends**: Performance over time
- **Recent Activity**: Latest submissions

### Leaderboard  
- **Tool Rankings**: Performance comparison
- **Success Rates**: Sortable by various metrics
- **Export**: Download data for analysis

### Scenarios
- **Difficulty Analysis**: Which scenarios are hardest
- **Success Patterns**: Performance by scenario type
- **Tool Comparisons**: How tools perform on specific scenarios

## API Integration Patterns

### Batch Submissions

For submitting multiple results efficiently:

```bash
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/results/batch \
  -H "X-API-Key: $AGENTPROBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "results": [
      { /* result 1 */ },
      { /* result 2 */ },
      { /* result 3 */ }
    ],
    "metadata": {
      "batch_id": "batch_2025_01_01",
      "source": "automated_testing",
      "description": "Daily regression tests"
    }
  }'
```

### Query Data

Retrieve community data for analysis:

```bash
# Get tool statistics
curl -H "X-API-Key: $AGENTPROBE_API_KEY" \
  https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/stats/tool/claude-cli

# Get leaderboard  
curl -H "X-API-Key: $AGENTPROBE_API_KEY" \
  https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/leaderboard

# Export data
curl -X POST https://agentprobe-community-production.nikola-balic.workers.dev/api/v1/export \
  -H "X-API-Key: $AGENTPROBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "filters": {
      "tool": "claude-cli",
      "start_date": "2025-01-01T00:00:00Z"
    }
  }'
```

## Best Practices

### Data Quality
- Use consistent tool and scenario names
- Include detailed error messages for failed tests
- Provide accurate timing measurements
- Submit results promptly after execution

### Privacy and Security
- Never include sensitive data in submissions
- Use generic identifiers for client information
- API keys should be kept secure and rotated regularly
- Review data before submission

### Community Guidelines
- Submit legitimate test results only
- Avoid duplicate or spam submissions
- Use descriptive scenario names
- Contribute to scenario standardization efforts

## Troubleshooting

### Common Issues

**Authentication Errors**:
```bash
# Verify your API key works
curl -H "X-API-Key: $AGENTPROBE_API_KEY" \
  https://agentprobe-community-production.nikola-balic.workers.dev/health
```

**Rate Limiting**:
- Default limits: 1000 requests/hour per IP
- API key limits vary by permission level
- Use batch submissions for efficiency

**Data Validation**:
- Ensure all required fields are included
- Check timestamp format (ISO 8601)
- Verify numeric values are within expected ranges

### Getting Help

- **Documentation**: https://dashboard.agentprobe.dev/docs/
- **Issues**: Report bugs via project repository
- **Community**: Join discussions in project forums

## Next Steps

1. **Explore the Dashboard**: Familiarize yourself with community data
2. **Start Small**: Submit a few test results to understand the API
3. **Automate**: Integrate API calls into your testing workflows
4. **Analyze**: Use the data to improve your tools and processes
5. **Contribute**: Help improve scenarios and documentation

Welcome to the AgentProbe Community! 🚀