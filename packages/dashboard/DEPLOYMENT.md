# AgentProbe Community Dashboard - Deployment Guide

## 🚀 Cloudflare Workers Deployment

### Prerequisites
- Cloudflare account
- GitHub repository for the dashboard code
- AgentProbe Community API deployed and accessible

### Method 1: Wrangler CLI (Recommended)

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
   cd packages/dashboard
   pnpm run export
   ```

4. **Deploy to Workers**
   ```bash
   # Deploy to staging
   wrangler deploy --env staging
   
   # Deploy to production
   wrangler deploy --env production
   ```

5. **Configuration**
   The deployment uses `wrangler.toml` configuration with staging and production environments pre-configured.

### Method 2: Monorepo Scripts (From Root)

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Deploy to Staging**
   ```bash
   pnpm run deploy:dashboard:staging
   ```

3. **Deploy to Production**
   ```bash
   pnpm run deploy:dashboard:production
   ```

4. **Deploy to Default Environment**
   ```bash
   pnpm run deploy:dashboard
   ```

### Custom Domain Setup

1. **Add Custom Domain**
   - In Cloudflare Workers dashboard, go to your Worker
   - Click "Settings" > "Triggers"
   - Add a custom domain (e.g., `dashboard.agentprobe.dev`)

2. **DNS Configuration**
   - Add a CNAME record pointing to your `*.workers.dev` URL
   - Or use Cloudflare as your DNS provider for automatic setup

## 🔧 Build Configuration

### Environment Variables

**Production Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://agentprobe-community-production.your-username.workers.dev
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard
```

**Staging Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://agentprobe-community-staging.your-username.workers.dev
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard (Staging)
```

### Static Export Configuration

The dashboard is configured for static export to work with Cloudflare Workers static assets:

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

The dashboard uses GitHub Actions for automatic deployment. See `.github/workflows/deploy-dashboard.yml`:

```yaml
name: Deploy Dashboard to Cloudflare Workers

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

      - name: Deploy to Cloudflare Workers
        run: pnpm wrangler deploy --env production
        working-directory: packages/dashboard
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `NEXT_PUBLIC_API_URL`: Your production API URL

## 🔄 Multiple Environments

### Production
- **Worker**: `agentprobe-dashboard`
- **URL**: `https://agentprobe-dashboard.nikola-balic.workers.dev` (or custom domain)
- **API**: `https://agentprobe-community-production.nikola-balic.workers.dev`
- **Branch**: `main`

### Staging
- **Worker**: `agentprobe-dashboard-staging`
- **URL**: `https://agentprobe-dashboard-staging.nikola-balic.workers.dev` (or custom domain)
- **API**: `https://agentprobe-community-staging.nikola-balic.workers.dev`
- **Branch**: `develop`

Environment-specific configurations are managed through `wrangler.toml` environments.

## 📊 Performance Optimization

### Bundle Analysis
```bash
cd dashboard
npm run build
# Check the out/ directory size - should be optimized for static serving
```

### Caching Strategy
Cloudflare Workers with static assets automatically provides:
- Static asset caching with optimal cache headers
- Global CDN distribution
- Automatic compression (gzip/brotli)
- Enhanced performance through Workers runtime

## 🧪 Testing Deployment

### Local Testing
```bash
cd packages/dashboard
pnpm run export
# Static file testing
npx serve out

# Or test with Workers runtime
wrangler dev
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
1. Go to Cloudflare Workers dashboard
2. Navigate to your Worker's "Deployments" tab
3. Find the previous working version
4. Click "Rollback" to that version

### Git-based Rollback
1. Revert the problematic commit
2. Push to main branch
3. Automatic deployment will trigger

## 📞 Support Resources

- **Cloudflare Workers Documentation**: https://developers.cloudflare.com/workers/
- **Workers Static Assets**: https://developers.cloudflare.com/workers/static-assets/
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **GitHub Actions**: https://docs.github.com/en/actions

---

**Current Status**: Migrated to Cloudflare Workers
**Recommended Domain**: `dashboard.agentprobe.dev`
**Build Output**: Static files served via Workers with enhanced performance