# AgentProbe Community Dashboard - Deployment Guide

## 🚀 Cloudflare Pages Deployment

### Prerequisites
- Cloudflare account
- GitHub repository for the dashboard code
- AgentProbe Community API deployed and accessible

### Method 1: Cloudflare Pages Dashboard (Recommended)

1. **Connect Repository**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages > Create a project
   - Connect your GitHub account
   - Select the `agentprobe-community` repository
   - Choose the `dashboard` folder as the root directory

2. **Build Configuration**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: out
   Root directory: dashboard (if deploying from subdirectory)
   ```

3. **Environment Variables**
   Add these in the Cloudflare Pages dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.workers.dev
   NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard
   NODE_VERSION=18
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your site
   - You'll get a `*.pages.dev` URL

### Method 2: Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate**
   ```bash
   wrangler login
   ```

3. **Build for Production**
   ```bash
   cd dashboard
   npm run build
   ```

4. **Deploy to Pages**
   ```bash
   wrangler pages deploy out --project-name agentprobe-dashboard
   ```

### Custom Domain Setup

1. **Add Custom Domain**
   - In Cloudflare Pages dashboard, go to your project
   - Click "Custom domains" tab
   - Add your domain (e.g., `dashboard.agentprobe.dev`)

2. **DNS Configuration**
   - Add a CNAME record pointing to your `*.pages.dev` URL
   - Or use Cloudflare as your DNS provider for automatic setup

## 🔧 Build Configuration

### Environment Variables

**Production Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://agentprobe-community-production.your-username.workers.dev
NEXT_PUBLIC_API_KEY=ap_your_dashboard_key_here  # Optional: for authenticated features
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard
```

**Staging Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://agentprobe-community-staging.your-username.workers.dev
NEXT_PUBLIC_API_KEY=ap_your_staging_dashboard_key_here  # Optional: for authenticated features
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard (Staging)
```

### Dashboard API Key Configuration

For authenticated dashboard features, you may optionally configure an API key:

**When do you need an API key?**
- The dashboard's public endpoints (leaderboard, stats, scenarios) work without authentication
- API keys are only needed for authenticated dashboard features or to avoid potential issues with invalid authentication headers
- If you encounter "Invalid API key" errors, you should either generate a valid key or ensure no API key is being sent

**Generating a Dashboard API Key:**
```bash
cd packages/api
node scripts/create-admin-key.js dashboard-key read
```

This will generate a key with read permissions suitable for dashboard usage.

**Adding the API Key to Environments:**

1. **GitHub Actions**: Add `NEXT_PUBLIC_API_KEY` to repository secrets
2. **Cloudflare Pages**: Add `NEXT_PUBLIC_API_KEY` to environment variables in Pages dashboard
3. **Local Development**: Add to `.env.local` file

**Important Notes:**
- The `NEXT_PUBLIC_API_KEY` is optional for public dashboard features
- If set to an invalid value, it will cause authentication errors
- You can omit this variable entirely if you only need public dashboard features
- Make sure the API key has `read` permissions at minimum

### Static Export Configuration

The dashboard is configured for static export to work with Cloudflare Pages:

```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
```

## 🚦 CI/CD with GitHub Actions

Create `.github/workflows/deploy-dashboard.yml`:

```yaml
name: Deploy Dashboard to Cloudflare Pages

on:
  push:
    branches: [main]
    paths: ['dashboard/**']
  pull_request:
    branches: [main]
    paths: ['dashboard/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: dashboard/package-lock.json

      - name: Install dependencies
        working-directory: dashboard
        run: npm ci

      - name: Build
        working-directory: dashboard
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_APP_NAME: AgentProbe Community Dashboard

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: agentprobe-dashboard
          directory: dashboard/out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `NEXT_PUBLIC_API_URL`: Your production API URL

## 🔄 Multiple Environments

### Production
- **URL**: `https://dashboard.agentprobe.dev` (or your custom domain)
- **API**: `https://agentprobe-community-production.workers.dev`
- **Branch**: `main`

### Staging
- **URL**: `https://staging-dashboard.agentprobe.dev`
- **API**: `https://agentprobe-community-staging.workers.dev`
- **Branch**: `develop`

Set up different Pages projects for each environment with appropriate environment variables.

## 📊 Performance Optimization

### Bundle Analysis
```bash
cd dashboard
npm run build
# Check the out/ directory size - should be optimized for static serving
```

### Caching Strategy
Cloudflare Pages automatically provides:
- Static asset caching with optimal cache headers
- Global CDN distribution
- Automatic compression (gzip/brotli)

## 🧪 Testing Deployment

### Local Testing
```bash
cd dashboard
npm run build
npx serve out
```

### Production Testing
1. Verify all pages load correctly
2. Test API connectivity (should show error states gracefully if API is down)
3. Check mobile responsiveness
4. Verify export functionality works
5. Test navigation between pages

## 🔍 Monitoring

### Cloudflare Analytics
- Page views and unique visitors
- Performance metrics (Core Web Vitals)
- Geographic distribution
- Device and browser analytics

### Error Monitoring
Consider adding error monitoring service:
- Sentry for JavaScript errors
- LogRocket for user session recordings
- Custom error boundaries for graceful error handling

## 🛠️ Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**API Connection Issues**
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check CORS settings on the API
- Ensure API is deployed and accessible

**API Key Authentication Errors**
- **"Invalid API key" errors**: Either generate a valid API key or remove the `NEXT_PUBLIC_API_KEY` environment variable entirely
- **500 Internal Server Error**: Usually caused by invalid API key format - check that the key follows the format `ap_keyid_secret`
- **Authentication working locally but failing in production**: Verify the `NEXT_PUBLIC_API_KEY` is set correctly in both GitHub Actions secrets and Cloudflare Pages environment variables
- **"Failed to load leaderboard data"**: Often indicates an API key issue - try removing the `NEXT_PUBLIC_API_KEY` environment variable if you only need public features

**Static Export Issues**
- Make sure you're using `next export` compatible features
- Avoid server-side only Next.js features
- Use `unoptimized: true` for images

**Routing Issues**
- Enable `trailingSlash: true` in Next.js config
- Use Next.js `Link` component for internal navigation
- Configure `_redirects` file if needed

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Custom domain setup (if applicable)
- [ ] API connectivity verified
- [ ] All pages render correctly
- [ ] Mobile responsiveness tested
- [ ] Export functionality works
- [ ] Navigation between pages works
- [ ] Error states display properly when API is unavailable
- [ ] Performance metrics acceptable (< 3s load time)
- [ ] Analytics/monitoring setup

## 🔄 Rollback Procedure

### Quick Rollback
1. Go to Cloudflare Pages dashboard
2. Navigate to your project's Deployments tab
3. Find the previous working deployment
4. Click "Retry deployment" or "Promote to production"

### Git-based Rollback
1. Revert the problematic commit
2. Push to main branch
3. Automatic deployment will trigger

## 📞 Support Resources

- **Cloudflare Pages Documentation**: https://developers.cloudflare.com/pages/
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Current Status**: Ready for deployment
**Recommended Domain**: `dashboard.agentprobe.dev`
**Build Output**: Static files optimized for CDN serving