#!/bin/bash

# Health check script for deployed Workers
# Usage: ./scripts/health-check.sh <environment> <base-url>

set -e

ENVIRONMENT=${1:-production}
BASE_URL=${2:-"https://agentprobe-community.your-subdomain.workers.dev"}

echo "🏥 Running health check for $ENVIRONMENT environment..."
echo "📍 Base URL: $BASE_URL"

# Test basic health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BASE_URL/")
HEALTH_CODE=$(echo $HEALTH_RESPONSE | tail -c 4)

if [ "$HEALTH_CODE" != "200" ]; then
    echo "❌ Health check failed with status code: $HEALTH_CODE"
    cat /tmp/health_response.json
    exit 1
fi

# Check if response contains expected structure
if ! grep -q "AgentProbe Community API" /tmp/health_response.json; then
    echo "❌ Health response doesn't contain expected content"
    cat /tmp/health_response.json
    exit 1
fi

echo "✅ Health check passed!"

# Test API endpoints
echo "Testing API endpoints..."

# Test leaderboard endpoint
echo "Testing leaderboard endpoint..."
LEADERBOARD_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/leaderboard_response.json "$BASE_URL/api/v1/leaderboard")
LEADERBOARD_CODE=$(echo $LEADERBOARD_RESPONSE | tail -c 4)

if [ "$LEADERBOARD_CODE" != "200" ]; then
    echo "⚠️ Leaderboard endpoint returned status code: $LEADERBOARD_CODE"
    echo "This might be expected for a new deployment with no data"
else
    echo "✅ Leaderboard endpoint working"
fi

# Test results endpoint with GET
echo "Testing results query endpoint..."
RESULTS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/results_response.json "$BASE_URL/api/v1/results")
RESULTS_CODE=$(echo $RESULTS_RESPONSE | tail -c 4)

if [ "$RESULTS_CODE" != "200" ]; then
    echo "⚠️ Results endpoint returned status code: $RESULTS_CODE"
    echo "This might be expected for a new deployment with no data"
else
    echo "✅ Results endpoint working"
fi

echo ""
echo "🎉 All health checks completed!"
echo "📊 Summary:"
echo "  - Health endpoint: ✅"
echo "  - Leaderboard endpoint: $([ "$LEADERBOARD_CODE" = "200" ] && echo "✅" || echo "⚠️")"
echo "  - Results endpoint: $([ "$RESULTS_CODE" = "200" ] && echo "✅" || echo "⚠️")"

# Cleanup
rm -f /tmp/health_response.json /tmp/leaderboard_response.json /tmp/results_response.json