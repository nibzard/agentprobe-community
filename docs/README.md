# AgentProbe Community Documentation

This is the centralized documentation hub for the AgentProbe Community project. Documentation is organized into logical sections and automatically generates the `/llms.txt` file for AI-readable project information.

## 📁 Documentation Structure

### `/api/` - Backend API Documentation
- **endpoints.md** - Complete API reference (auto-generated)
- **authentication.md** - API key setup and security
- **database.md** - Database schema and setup
- **deployment.md** - Production deployment guide

### `/dashboard/` - Frontend Dashboard Documentation  
- **components.md** - UI component library (auto-generated)
- **pages.md** - Page structure and routing
- **deployment.md** - Dashboard deployment guide

### `/user-guides/` - End-User Documentation
- **getting-started.md** - Quick setup and onboarding
- **api-usage.md** - API integration examples
- **dashboard-guide.md** - Dashboard feature walkthrough

### `/developer/` - Developer Resources
- **contributing.md** - Development guidelines
- **architecture.md** - System architecture overview
- **troubleshooting.md** - Common issues and solutions

### `/scripts/` - Documentation Tools
- **generate-llms-txt.js** - Generates `/llms.txt` from documentation
- **extract-api-endpoints.js** - Parses API code for endpoint documentation
- **extract-components.js** - Analyzes dashboard components

## 🤖 LLMs.txt Generation

The `/llms.txt` file is automatically generated from this documentation during the build process. It provides AI models with a comprehensive overview of the project structure, APIs, and resources.

### Generation Process:
1. Scans all documentation files in this `/docs` folder
2. Extracts live API endpoints from code analysis
3. Creates structured markdown following llms.txt specification
4. Outputs to `/packages/dashboard/public/llms.txt`

### Manual Generation:
```bash
cd docs/scripts
node generate-llms-txt.js
```

## 🔄 Maintenance

Documentation is maintained through a combination of:
- **Manual curation** - User guides, architecture docs, troubleshooting
- **Automated extraction** - API endpoints, component inventory, database schema
- **Build integration** - Automatic regeneration on code changes

See [DOCS.md](../DOCS.md) in the project root for detailed maintenance guidelines.

## 🌐 Live Documentation

When deployed, this documentation is accessible at:
- **Production**: https://dashboard.agentprobe.dev/docs/
- **LLMs.txt**: https://dashboard.agentprobe.dev/llms.txt

## 📝 Contributing

When adding new documentation:
1. Place files in the appropriate category folder
2. Follow existing markdown structure and style
3. Update relevant index files
4. Test llms.txt generation locally before committing

For detailed contribution guidelines, see `/developer/contributing.md`.