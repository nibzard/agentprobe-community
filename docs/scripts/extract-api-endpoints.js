#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Extracts API endpoints from the Hono API source code
 * Analyzes packages/api/src/index.ts to generate documentation
 */

const API_SOURCE_PATH = path.join(__dirname, '../../packages/api/src/index.ts');
const OUTPUT_PATH = path.join(__dirname, '../api/endpoints.md');

function extractEndpoints() {
  try {
    const sourceCode = fs.readFileSync(API_SOURCE_PATH, 'utf8');
    
    // Parse the source code to extract endpoint information
    const endpoints = [];
    
    // Regex patterns to match different endpoint definitions
    const patterns = {
      get: /app\.get\(['"`]([^'"`]+)['"`]/g,
      post: /app\.post\(['"`]([^'"`]+)['"`]/g,
      put: /app\.put\(['"`]([^'"`]+)['"`]/g,
      delete: /app\.delete\(['"`]([^'"`]+)['"`]/g,
    };
    
    // Extract endpoints by method
    Object.entries(patterns).forEach(([method, pattern]) => {
      let match;
      while ((match = pattern.exec(sourceCode)) !== null) {
        const route = match[1];
        
        // Skip internal or cleanup routes
        if (route.includes('internal') || route.includes('cleanup')) {
          continue;
        }
        
        // Determine if authentication is required by looking at middleware
        const routeIndex = match.index;
        const lineStart = sourceCode.lastIndexOf('\n', routeIndex);
        const lineEnd = sourceCode.indexOf('\n', routeIndex);
        const routeLine = sourceCode.substring(lineStart, lineEnd);
        
        let auth = 'none';
        let permissions = [];
        
        if (routeLine.includes('adminOnly()')) {
          auth = 'required';
          permissions = ['admin'];
        } else if (routeLine.includes('keyManagement()')) {
          auth = 'required';
          permissions = ['manage_keys'];
        } else if (routeLine.includes('writeAccess()')) {
          auth = 'required';
          permissions = ['write'];
        } else if (routeLine.includes('readOnly()')) {
          auth = 'required';
          permissions = ['read'];
        } else if (routeLine.includes('optionalAuthMiddleware()')) {
          auth = 'optional';
        }
        
        // Extract description from nearby comments
        const beforeRoute = sourceCode.substring(Math.max(0, routeIndex - 500), routeIndex);
        const commentMatch = beforeRoute.match(/\/\/ (.+)$/m);
        const description = commentMatch ? commentMatch[1] : getDefaultDescription(method, route);
        
        endpoints.push({
          method: method.toUpperCase(),
          route,
          auth,
          permissions,
          description
        });
      }
    });
    
    // Sort endpoints by route for better organization
    endpoints.sort((a, b) => a.route.localeCompare(b.route));
    
    return endpoints;
  } catch (error) {
    console.error('Error extracting endpoints:', error);
    return [];
  }
}

function getDefaultDescription(method, route) {
  // Generate default descriptions based on common patterns
  if (route === '/health') return 'Health check with database status';
  if (route === '/') return 'API information and endpoint listing';
  if (route.includes('/auth/keys')) {
    if (method === 'POST') return 'Create new API key';
    if (method === 'GET' && route.includes(':keyId')) return 'Get API key details';
    if (method === 'GET') return 'List API keys';
    if (method === 'PUT') return 'Update API key';
    if (method === 'DELETE') return 'Deactivate API key';
  }
  if (route.includes('/results')) {
    if (method === 'POST' && route.includes('batch')) return 'Batch submit test results';
    if (method === 'POST') return 'Submit test result';
    if (method === 'GET') return 'Query test results';
  }
  if (route.includes('/stats/tool')) return 'Get tool statistics';
  if (route.includes('/stats/scenario')) return 'Get scenario statistics';
  if (route.includes('/stats/aggregate')) return 'Get aggregate statistics';
  if (route.includes('/leaderboard')) return 'Get tool leaderboard';
  if (route.includes('/compare/tools')) return 'Compare multiple tools';
  if (route.includes('/scenarios/difficulty')) return 'Get scenario difficulty ranking';
  if (route.includes('/export')) return 'Export data in CSV/JSON format';
  if (route.includes('/rate-limit')) return 'Get rate limit status';
  if (route.includes('/security-events')) return 'View security events';
  
  return `${method} ${route}`;
}

function generateMarkdown(endpoints) {
  let markdown = `# API Endpoints Reference

*Auto-generated from source code analysis*

This document provides a complete reference of all available API endpoints in the AgentProbe Community API.

## Base URLs

- **Production**: \`https://agentprobe-community-production.nikola-balic.workers.dev\`
- **Staging**: \`https://agentprobe-community-staging.nikola-balic.workers.dev\`
- **Local**: \`http://localhost:8787\`

## Authentication

Most endpoints require API key authentication. Include your API key in one of these headers:
- \`Authorization: Bearer <api_key>\`
- \`X-API-Key: <api_key>\`

## Permission Levels

- \`read\` - Access to view data and statistics  
- \`write\` - Access to submit test results
- \`admin\` - Full administrative access
- \`manage_keys\` - Manage API keys

## Endpoints

`;

  // Group endpoints by category
  const categories = {
    'Public': endpoints.filter(e => e.auth === 'none'),
    'Authentication': endpoints.filter(e => e.route.includes('/auth/')),
    'Data Submission': endpoints.filter(e => e.route.includes('/results')),
    'Statistics': endpoints.filter(e => e.route.includes('/stats') || e.route.includes('/leaderboard')),
    'Analysis': endpoints.filter(e => e.route.includes('/compare') || e.route.includes('/scenarios') || e.route.includes('/export')),
  };

  Object.entries(categories).forEach(([category, categoryEndpoints]) => {
    if (categoryEndpoints.length === 0) return;
    
    markdown += `### ${category}\n\n`;
    
    categoryEndpoints.forEach(endpoint => {
      const authBadge = endpoint.auth === 'none' ? '' : 
                       endpoint.auth === 'optional' ? ' *optional auth*' :
                       ` *requires: ${endpoint.permissions.join(', ')}*`;
      
      markdown += `#### \`${endpoint.method} ${endpoint.route}\`${authBadge}\n\n`;
      markdown += `${endpoint.description}\n\n`;
    });
  });

  markdown += `## Response Format

All endpoints return responses in this format:

\`\`\`json
{
  "status": "success" | "error",
  "data": <response_data>,
  "message": "<optional_message>",
  "timestamp": "<iso_timestamp>",
  "error": "<error_message>",    // Only present on errors
  "code": "<error_code>",        // Only present on errors
  "path": "<request_path>"       // Only present on errors
}
\`\`\`

## Rate Limits

- IP-based: 1000 requests per hour per IP
- API key-based: Configurable per key (default varies by permission level)
- Batch operations: Higher limits for efficient data submission

*Last updated: ${new Date().toISOString()}*
`;

  return markdown;
}

function main() {
  console.log('🔍 Extracting API endpoints from source code...');
  
  const endpoints = extractEndpoints();
  console.log(`📋 Found ${endpoints.length} endpoints`);
  
  const markdown = generateMarkdown(endpoints);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_PATH, markdown, 'utf8');
  console.log(`✅ Generated API documentation: ${OUTPUT_PATH}`);
  
  return endpoints;
}

if (require.main === module) {
  main();
}

module.exports = { extractEndpoints, generateMarkdown };