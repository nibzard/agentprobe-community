#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generates llms.txt file from project documentation
 * Following the llms.txt specification: https://llmstxt.org/
 */

const PROJECT_ROOT = path.join(__dirname, '../..');
const DOCS_ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'packages/dashboard/public/llms.txt');

// Import endpoint extraction
const { extractEndpoints } = require('./extract-api-endpoints');

function readProjectInfo() {
  try {
    // Read main README for project description
    const mainReadme = fs.readFileSync(path.join(PROJECT_ROOT, 'README.md'), 'utf8');
    
    // Extract title and description
    const titleMatch = mainReadme.match(/^# (.+)/m);
    const title = titleMatch ? titleMatch[1] : 'AgentProbe Community';
    
    // Extract the main description (first paragraph after title)
    const descMatch = mainReadme.match(/^# .+\n\n(.+)/m);
    const description = descMatch ? descMatch[1] : 'A comprehensive platform for collecting and visualizing CLI test results from the community.';
    
    return { title, description };
  } catch (error) {
    console.warn('Could not read project info, using defaults:', error.message);
    return {
      title: 'AgentProbe Community',
      description: 'A comprehensive platform for collecting and visualizing CLI test results from the community, consisting of a secure API backend and an intuitive dashboard frontend.'
    };
  }
}

function getDeploymentInfo() {
  return {
    api: {
      production: 'https://agentprobe-community-production.nikola-balic.workers.dev',
      staging: 'https://agentprobe-community-staging.nikola-balic.workers.dev'
    },
    dashboard: {
      production: 'https://dashboard.agentprobe.dev',
      staging: 'https://staging-dashboard.agentprobe.dev'
    }
  };
}

function scanDocumentationFiles() {
  const docs = [];
  
  function scanDirectory(dir, baseUrl = '') {
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && item !== 'scripts' && item !== 'node_modules') {
          scanDirectory(fullPath, `${baseUrl}/${item}`);
        } else if (item.endsWith('.md') && item !== 'README.md') {
          const relativePath = path.relative(DOCS_ROOT, fullPath);
          const urlPath = relativePath.replace(/\\/g, '/').replace('.md', '/');
          
          // Try to extract title from the markdown file
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const titleMatch = content.match(/^# (.+)/m);
            const title = titleMatch ? titleMatch[1] : path.basename(item, '.md');
            
            // Extract first paragraph as description
            const descMatch = content.match(/^# .+\n\n(.+)/m);
            const description = descMatch ? descMatch[1].split('\n')[0] : '';
            
            docs.push({
              title,
              path: urlPath,
              description,
              category: path.dirname(relativePath).split(path.sep)[0]
            });
          } catch (err) {
            console.warn(`Could not read ${fullPath}:`, err.message);
          }
        }
      });
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error.message);
    }
  }
  
  scanDirectory(DOCS_ROOT);
  return docs;
}

function generateLlmsTxt() {
  console.log('🔍 Scanning project for documentation...');
  
  const { title, description } = readProjectInfo();
  const deploymentInfo = getDeploymentInfo();
  const documentationFiles = scanDocumentationFiles();
  
  // Extract API endpoints for live documentation
  console.log('📡 Extracting API endpoints...');
  const endpoints = extractEndpoints();
  const endpointCount = endpoints.length;
  
  console.log('📝 Generating llms.txt content...');
  
  let content = `# ${title}

> ${description}

## Live Services

- [Production API](${deploymentInfo.api.production}): Backend API with ${endpointCount}+ endpoints for data submission and retrieval
- [Production Dashboard](${deploymentInfo.dashboard.production}): Interactive web interface for visualizing community test results
- [API Health Check](${deploymentInfo.api.production}/health): Live system status and statistics

## API Documentation

- [Complete API Reference](${deploymentInfo.dashboard.production}/docs/api/endpoints/): All ${endpointCount} endpoints with authentication and examples
- [Authentication Guide](${deploymentInfo.dashboard.production}/docs/api/authentication/): API key setup, permissions, and security
- [Database Schema](${deploymentInfo.dashboard.production}/docs/api/database/): Complete data model and relationships
- [Deployment Guide](${deploymentInfo.dashboard.production}/docs/api/deployment/): Production deployment and configuration

### Key API Endpoints
- \`POST /api/v1/results\`: Submit test results
- \`GET /api/v1/leaderboard\`: Tool performance rankings  
- \`GET /api/v1/stats/tool/{tool}\`: Tool-specific statistics
- \`POST /api/v1/export\`: Data export in CSV/JSON formats

## Dashboard Features

- [Live Dashboard](${deploymentInfo.dashboard.production}): Real-time community statistics and insights
- [Tool Leaderboard](${deploymentInfo.dashboard.production}/leaderboard/): Success rates and performance rankings
- [Scenario Analysis](${deploymentInfo.dashboard.production}/scenarios/): Difficulty rankings and success patterns
- [Component Documentation](${deploymentInfo.dashboard.production}/docs/dashboard/components/): UI component library and usage

## User Resources

- [Getting Started Guide](${deploymentInfo.dashboard.production}/docs/user-guides/getting-started/): Quick setup and API integration
- [API Usage Examples](${deploymentInfo.dashboard.production}/docs/user-guides/api-usage/): Code examples and integration patterns
- [Dashboard User Guide](${deploymentInfo.dashboard.production}/docs/user-guides/dashboard-guide/): Feature walkthrough and tips

## Developer Resources

- [Contributing Guidelines](${deploymentInfo.dashboard.production}/docs/developer/contributing/): Development setup and contribution process
- [System Architecture](${deploymentInfo.dashboard.production}/docs/developer/architecture/): Technical design and technology stack
- [Troubleshooting Guide](${deploymentInfo.dashboard.production}/docs/developer/troubleshooting/): Common issues and solutions

## Technology Stack

### Backend API
- **Runtime**: Cloudflare Workers with global edge deployment
- **Framework**: Hono.js for high-performance HTTP handling
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Authentication**: API key-based with granular permissions
- **Security**: Rate limiting, input validation, audit logging

### Frontend Dashboard  
- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for interactive data visualizations
- **Data**: React Query for state management and caching
- **Deployment**: Cloudflare Workers with static assets

## Project Structure

\`\`\`
agentprobe-community/
├── packages/
│   ├── api/          # Backend API (Cloudflare Workers + Hono)
│   └── dashboard/    # Frontend Dashboard (Next.js)
├── docs/            # Centralized documentation
└── .github/         # CI/CD workflows for deployment
\`\`\`

## Data & Analytics

The platform collects and analyzes:
- **Test Results**: Success rates, execution times, error patterns
- **Tool Performance**: Comparative analysis across CLI tools
- **Scenario Difficulty**: Ranking based on success rates and friction points
- **Community Metrics**: Usage patterns and adoption trends

## API Usage Example

\`\`\`bash
# Submit a test result
curl -X POST ${deploymentInfo.api.production}/api/v1/results \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "run_id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2025-01-01T00:00:00Z",
    "tool": "claude-cli",
    "scenario": "file-operations",
    "execution": {
      "duration": 45.2,
      "total_turns": 8,
      "success": true
    }
  }'
\`\`\`

## Security & Compliance

- **Authentication**: API key-based with role-based permissions
- **Rate Limiting**: Multi-layered protection against abuse
- **Data Privacy**: Anonymous data collection, no personal information
- **Security Monitoring**: Comprehensive audit logging and threat detection
- **Infrastructure**: Cloudflare's enterprise security features
`;

  // Add documentation sections if we have any
  if (documentationFiles.length > 0) {
    const categories = [...new Set(documentationFiles.map(doc => doc.category))];
    
    categories.forEach(category => {
      const categoryDocs = documentationFiles.filter(doc => doc.category === category);
      if (categoryDocs.length > 0) {
        content += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)} Documentation\n\n`;
        categoryDocs.forEach(doc => {
          const url = `${deploymentInfo.dashboard.production}/docs/${doc.path}`;
          const description = doc.description ? `: ${doc.description}` : '';
          content += `- [${doc.title}](${url})${description}\n`;
        });
      }
    });
  }

  content += `\n*Documentation automatically generated on ${new Date().toISOString()}*\n`;

  return content;
}

function main() {
  try {
    console.log('🚀 Generating llms.txt for AgentProbe Community...');
    
    const content = generateLlmsTxt();
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the llms.txt file
    fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
    
    console.log(`✅ Successfully generated llms.txt:`);
    console.log(`   File: ${OUTPUT_PATH}`);
    console.log(`   Size: ${(content.length / 1024).toFixed(1)} KB`);
    console.log(`   Lines: ${content.split('\n').length}`);
    
    // Also output to console for verification
    console.log('\n📄 Generated content preview:');
    console.log('='.repeat(50));
    console.log(content.split('\n').slice(0, 20).join('\n'));
    console.log('...');
    console.log('='.repeat(50));
    
    return true;
  } catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    return false;
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateLlmsTxt, readProjectInfo, scanDocumentationFiles };