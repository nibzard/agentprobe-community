# Documentation Maintenance Guide

This guide outlines how documentation is organized, maintained, and automatically generated for the AgentProbe Community project.

## 📁 Documentation Structure

```
/docs/                          # Centralized documentation hub
├── README.md                   # Main documentation index
├── api/                        # Backend API documentation
│   ├── endpoints.md           # Auto-generated from code analysis
│   ├── authentication.md      # Copied from packages/api/AUTH_SETUP.md
│   ├── database.md           # Copied from packages/api/DATABASE_SETUP.md
│   └── deployment.md         # Copied from packages/api/DEPLOYMENT.md
├── dashboard/                  # Frontend documentation
│   ├── components.md          # Auto-generated component inventory
│   ├── pages.md              # Page structure and routing
│   └── deployment.md         # Copied from packages/dashboard/DEPLOYMENT.md
├── user-guides/               # End-user documentation
│   ├── getting-started.md    # User onboarding guide
│   ├── api-usage.md          # API integration examples
│   └── dashboard-guide.md    # Dashboard feature walkthrough
└── scripts/                   # Documentation automation
    ├── generate-llms-txt.js   # Main llms.txt generator
    ├── extract-api-endpoints.js # API endpoint parser
    └── extract-components.js  # Component analyzer (future)
```

## 🤖 Automated Documentation

### LLMs.txt Generation

The `/llms.txt` file is automatically generated from all documentation sources and served at `https://dashboard.agentprobe.dev/llms.txt`.

**Generation Process**:
1. Scans `/docs` folder for all markdown files
2. Extracts API endpoints from source code analysis
3. Combines with deployment information and project structure
4. Generates comprehensive llms.txt following specification
5. Outputs to `/packages/dashboard/public/llms.txt`

**Automatic Triggers**:
- Before dashboard build: `pnpm run build` (via `prebuild` script)
- Before export: `pnpm run export` (via `preexport` script)

**Manual Generation**:
```bash
# From dashboard package
cd packages/dashboard
pnpm run docs:generate

# From project root
node docs/scripts/generate-llms-txt.js
```

### API Documentation

API endpoints are automatically extracted from `packages/api/src/index.ts`:

```bash
# Generate API documentation
cd packages/dashboard  
pnpm run docs:api

# Or directly
node docs/scripts/extract-api-endpoints.js
```

**What Gets Extracted**:
- All HTTP endpoints (GET, POST, PUT, DELETE)
- Authentication requirements and permissions
- Route parameters and descriptions
- Middleware usage (auth, rate limiting)

## 📝 Manual Documentation

### User Guides (`/user-guides/`)

**Maintained manually** - Update when features change:

- `getting-started.md` - User onboarding and first steps
- `api-usage.md` - Integration examples and patterns
- `dashboard-guide.md` - Dashboard feature walkthrough

### Developer Documentation (`/developer/`)

**Planned for future** - Development-focused content:

- `contributing.md` - Development setup and guidelines
- `architecture.md` - System design and technical overview
- `troubleshooting.md` - Common issues and solutions

### Package-Level Documentation

**Copied from package directories** during builds:

- API auth guide: `packages/api/AUTH_SETUP.md` → `docs/api/authentication.md`
- Database setup: `packages/api/DATABASE_SETUP.md` → `docs/api/database.md`
- API deployment: `packages/api/DEPLOYMENT.md` → `docs/api/deployment.md`
- Dashboard deployment: `packages/dashboard/DEPLOYMENT.md` → `docs/dashboard/deployment.md`

## 🔄 Maintenance Workflow

### When to Update Documentation

**Automatic Updates** (no action needed):
- API endpoints added/removed/changed
- Component structure changes
- Build process modifications

**Manual Updates Required**:
- User workflow changes
- New features or capabilities
- API usage patterns or examples
- Dashboard UI/UX changes
- Deployment procedure updates

### Documentation Review Process

1. **Code Changes**: When modifying API or dashboard code, check if documentation needs updates
2. **PR Reviews**: Include documentation impact in pull request reviews
3. **Release Notes**: Update user guides for significant feature changes
4. **Testing**: Verify llms.txt generation works after major changes

### Quality Guidelines

**Writing Style**:
- Clear, concise language
- Step-by-step instructions where appropriate
- Code examples with explanations
- Screenshots for UI/UX features (future)

**Content Standards**:
- Keep information current and accurate
- Include practical examples
- Link to related sections
- Maintain consistent formatting

**Technical Accuracy**:
- Test all code examples
- Verify API endpoints and parameters
- Check deployment instructions
- Validate external links

## 🚀 Deployment Integration

### Build Process Integration

Documentation generation is integrated into the dashboard build pipeline:

```json
{
  "scripts": {
    "prebuild": "node ../../docs/scripts/generate-llms-txt.js",
    "build": "next build",
    "preexport": "node ../../docs/scripts/generate-llms-txt.js", 
    "export": "next build"
  }
}
```

### Static File Serving

Generated `llms.txt` is served as a static file:
- Development: `http://localhost:3000/llms.txt`
- Production: `https://dashboard.agentprobe.dev/llms.txt`

### CI/CD Considerations

Documentation is automatically updated during deployment:
1. Code changes trigger build process
2. Build process runs documentation generation
3. Updated llms.txt is included in deployment
4. No manual intervention required

## 🛠️ Troubleshooting

### Common Issues

**Generation Script Fails**:
```bash
# Check Node.js version (requires 16+)
node --version

# Verify file permissions
ls -la docs/scripts/

# Run with verbose output
DEBUG=* node docs/scripts/generate-llms-txt.js
```

**Missing API Endpoints**:
- Check if new endpoints follow expected patterns
- Verify middleware usage matches detection logic
- Update extraction script if patterns change

**Broken Links in llms.txt**:
- Verify base URLs in generation script
- Check that referenced documentation files exist
- Test links manually after generation

**Build Integration Issues**:
- Ensure scripts are executable
- Check relative paths are correct
- Verify npm script dependencies

### Manual Fixes

**Force Regeneration**:
```bash
# Delete existing file and regenerate
rm packages/dashboard/public/llms.txt
pnpm run docs:generate
```

**Debug API Extraction**:
```bash
# Test endpoint extraction separately
node docs/scripts/extract-api-endpoints.js
cat docs/api/endpoints.md
```

## 📈 Future Improvements

### Planned Enhancements

1. **Component Documentation**: Auto-generate from TypeScript interfaces
2. **API Schema**: Generate OpenAPI/Swagger specifications
3. **Screenshot Automation**: Capture dashboard screenshots automatically
4. **Link Validation**: Verify all links in documentation
5. **Metrics Tracking**: Monitor documentation usage and effectiveness

### Contributing to Documentation

**For Developers**:
- Update user guides when adding features
- Include code examples in API changes
- Test documentation generation locally
- Review documentation impact in PRs

**For Users**:
- Report documentation issues via GitHub
- Suggest improvements or missing content
- Contribute examples and use cases

## 📚 References

- **LLMs.txt Specification**: https://llmstxt.org/
- **Next.js Static Files**: https://nextjs.org/docs/basic-features/static-file-serving
- **Markdown Guide**: https://www.markdownguide.org/

---

*This guide ensures documentation stays current and comprehensive as the project evolves.*