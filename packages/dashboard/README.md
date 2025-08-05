# AgentProbe Community Dashboard

A modern web interface for visualizing community CLI test results, built with Next.js and deployed on Cloudflare Workers.

## 🚀 Current Deployments

- **Production**: https://dashboard.agentprobe.dev
- **Staging**: https://staging-dashboard.agentprobe.dev
- **Local Development**: http://localhost:3000

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **UI Components**: Custom components with class-variance-authority
- **Icons**: Lucide React
- **Deployment**: Cloudflare Workers (Static Assets)

## ✨ Features

### Interactive Visualizations
- **Tool Leaderboard**: Success rates and performance rankings
- **Success Rate Charts**: Historical trends and comparisons
- **Performance Analytics**: Duration, turn counts, and efficiency metrics
- **Scenario Analysis**: Difficulty rankings and success patterns

### Data Export
- **Chart Export**: Save visualizations as images
- **Data Export**: Export filtered data as CSV/JSON
- **Custom Reports**: Generate reports for specific time periods or tools

### User Experience
- **Responsive Design**: Optimized for desktop and mobile
- **Real-time Updates**: Live data from the API backend
- **Intuitive Navigation**: Clean, modern interface
- **Loading States**: Smooth loading experiences with skeletons

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Local Development

1. **Install Dependencies** (from project root)
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   # From project root
   pnpm run dev:dashboard
   
   # Or from this package
   cd packages/dashboard
   pnpm run dev
   ```
   Dashboard will be available at http://localhost:3000

### Environment Variables

Create a `.env.local` file in this package directory:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8787

# App Configuration
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard
```

For production deployments, these are configured in the GitHub Actions workflow:
```env
NEXT_PUBLIC_API_URL=https://agentprobe-community-production.nikola-balic.workers.dev
NEXT_PUBLIC_APP_NAME=AgentProbe Community Dashboard
```

## 📱 Pages Overview

### Home Page (`/`)
- Overview of community statistics
- Quick access to key metrics
- Recent activity summary

### Leaderboard (`/leaderboard`)
- Tool rankings by success rate
- Performance comparisons
- Sortable and filterable data
- Export functionality

### Scenarios (`/scenarios`)
- Scenario-specific analytics
- Difficulty rankings
- Success rate trends
- Tool performance by scenario

## 🔧 Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Build and export static files
pnpm run export

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Start production server (after build)
pnpm run start
```

## 🏗️ Architecture

### Components Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── leaderboard/       # Leaderboard page
│   └── scenarios/         # Scenarios page
├── components/
│   ├── charts/           # Chart components (Recharts)
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                # Utility functions and API client
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### API Integration
- **API Client**: Centralized HTTP client (`lib/api-client.ts`)
- **React Query**: Data fetching, caching, and synchronization
- **Error Handling**: Graceful error states and retry logic
- **Type Safety**: Full TypeScript integration with API types

## 🎨 Styling

### Tailwind CSS
- **Utility-first**: Rapid UI development
- **Custom Design System**: Consistent colors, spacing, typography
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Prepared for future dark mode support

### Component Patterns
- **Composition**: Reusable component building blocks
- **Variants**: Type-safe component variants with CVA
- **Accessibility**: WCAG-compliant components
- **Performance**: Optimized re-renders and lazy loading

## 📊 Data Visualization

### Chart Types
- **Line Charts**: Time-series data and trends
- **Bar Charts**: Comparative data and rankings
- **Area Charts**: Cumulative metrics
- **Custom Charts**: Domain-specific visualizations

### Chart Features
- **Interactive**: Hover states, tooltips, click handlers
- **Responsive**: Automatic resizing and mobile optimization
- **Exportable**: Save charts as images
- **Accessible**: Screen reader friendly

## 🚀 Deployment

### Cloudflare Workers
The dashboard is deployed as static assets on Cloudflare Workers:

1. **Build Process**: Next.js static export
2. **Workers Runtime**: Enhanced performance and features
3. **Automatic Deployments**: GitHub Actions integration
4. **Environment Deployments**: Staging and production environments

### Manual Deployment
```bash
# Build static export
pnpm run export

# Deploy to Cloudflare Workers (from project root)
pnpm run deploy:dashboard:staging    # Staging
pnpm run deploy:dashboard:production # Production

# Or from dashboard directory
wrangler deploy --env staging        # Staging  
wrangler deploy --env production     # Production
```

### Deployment Configuration
- **Output**: Static files in `out/` directory
- **Routing**: File-based routing with trailing slashes
- **Assets**: Optimized images and static resources
- **Headers**: Security headers and caching policies

## 🔧 Configuration

### Next.js Configuration (`next.config.js`)
```javascript
const nextConfig = {
  output: 'export',           // Static export for Cloudflare Workers
  trailingSlash: true,        // Consistent routing
  images: {
    unoptimized: true,        // Required for static export
  },
  experimental: {
    // Future Next.js features
  },
};
```

### Environment-Specific Settings
- **Development**: Local API, debug logging
- **Staging**: Staging API, error reporting
- **Production**: Production API, analytics, optimizations

## 🧪 Testing

### Testing Strategy
```bash
# Type checking (current)
pnpm run type-check

# Linting (current)  
pnpm run lint

# Unit tests (future)
pnpm run test

# E2E tests (future)
pnpm run test:e2e
```

### Quality Assurance
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality and consistency
- **Next.js**: Built-in optimizations and best practices
- **React Query**: Data fetching reliability

## 🛡️ Security

### Data Security
- **API Communication**: Secure HTTPS connections
- **No Sensitive Data**: No API keys stored in frontend
- **Input Sanitization**: Safe handling of user inputs
- **XSS Prevention**: React's built-in protections

### Privacy
- **No User Tracking**: Privacy-focused analytics only
- **GDPR Compliance**: No personal data collection
- **Secure Exports**: Safe data export without injection risks

## 🤝 Contributing

### Development Workflow
1. **Setup**: Follow local development instructions
2. **Changes**: Make changes in appropriate component directories
3. **Testing**: Run type-check and lint
4. **Preview**: Test in development server
5. **Submit**: Create PR with clear description

### Code Standards
- **TypeScript**: Strict type checking enabled
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes
- **Performance**: Optimize renders and bundle size

## 📝 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Component Library](./src/components/README.md) (future)
- [API Integration](./src/lib/README.md) (future)

## 🔄 Future Enhancements

- **Real-time Updates**: WebSocket integration
- **Advanced Filtering**: More sophisticated data queries
- **Custom Dashboards**: User-configurable views
- **Offline Support**: Progressive Web App features
- **Dark Mode**: Theme switching capability

## 📝 License

MIT License - see LICENSE file for details.