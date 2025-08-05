# Documentation Scripts

Automated documentation generation and maintenance scripts.

## Scripts

- `generate-llms-txt.js` - Main script that generates `/llms.txt` from all documentation
- `extract-api-endpoints.js` - Parses API source code for endpoint documentation  
- `extract-components.js` - Analyzes dashboard components for documentation

## Usage

```bash
# Generate llms.txt file
node generate-llms-txt.js

# Extract API endpoints documentation
node extract-api-endpoints.js

# Extract dashboard components documentation  
node extract-components.js
```

## Build Integration

These scripts are automatically run during the dashboard build process to ensure documentation is always up-to-date.