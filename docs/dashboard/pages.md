# Dashboard Pages

This document describes the page structure and routing of the AgentProbe Community Dashboard.

## Page Structure

The dashboard uses Next.js 15 App Router with file-based routing:

```
src/app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page (/)
├── leaderboard/
│   └── page.tsx       # Leaderboard page (/leaderboard)
└── scenarios/
    └── page.tsx       # Scenarios page (/scenarios)
```

## Pages Overview

### Home Page (`/`)
**File**: `src/app/page.tsx`

Dashboard overview with community statistics and recent activity.

**Features**:
- **Stats Overview**: Key metrics cards showing total results, success rates, and active tools
- **Success Rate Trends**: Interactive chart displaying community-wide trends over time
- **Recent Activity**: Latest test submissions and updates
- **Quick Navigation**: Links to detailed analysis pages

**Components Used**:
- `StatsOverview` - Overview statistics cards
- `SuccessRateChart` - Time-series success rate visualization
- `Card` components for content organization

### Leaderboard Page (`/leaderboard`)
**File**: `src/app/leaderboard/page.tsx`

Tool performance rankings and comparative analysis.

**Features**:
- **Tool Rankings**: Sortable table of tools by success rate and performance
- **Performance Metrics**: Success rates, total runs, and average execution times
- **Filtering**: Filter by time period, scenario, or other criteria
- **Export**: Export leaderboard data in CSV/JSON formats
- **Comparative Charts**: Visual comparisons between tools

**Data Sources**:
- `GET /api/v1/leaderboard` - Tool performance rankings
- `GET /api/v1/stats/tool/{tool}` - Individual tool statistics

### Scenarios Page (`/scenarios`)
**File**: `src/app/scenarios/page.tsx`

Scenario-specific analytics and difficulty rankings.

**Features**:
- **Scenario Difficulty**: Ranking scenarios by difficulty score
- **Success Patterns**: Analysis of success rates across different scenarios
- **Tool Performance by Scenario**: How different tools perform on specific scenarios
- **Friction Point Analysis**: Common issues and pain points
- **Trend Analysis**: Success rate trends over time for each scenario

**Data Sources**:
- `GET /api/v1/scenarios/difficulty` - Scenario difficulty rankings
- `GET /api/v1/stats/scenario/{tool}/{scenario}` - Scenario-specific statistics

## Shared Layout

### Root Layout (`layout.tsx`)
**File**: `src/app/layout.tsx`

Provides consistent structure across all pages.

**Features**:
- **HTML Setup**: Document head with metadata and fonts
- **Global Styles**: Tailwind CSS and custom styling
- **Dashboard Layout**: Wraps all pages with consistent navigation
- **SEO Optimization**: Proper meta tags and structured data

**Metadata**:
- Title: "AgentProbe Community Dashboard"
- Description: "Community statistics and insights for CLI tool testing results"
- Keywords: AgentProbe, CLI, testing, community, statistics

## Navigation

The dashboard includes persistent navigation elements:

- **Header**: Always visible with project branding and main navigation
- **Mobile Menu**: Collapsible navigation for mobile devices
- **Breadcrumbs**: Page context and navigation hierarchy

## Data Loading

Pages use modern data loading patterns:

- **React Query**: Caching and synchronization for API data
- **Loading States**: Skeleton components during data fetching
- **Error Handling**: Graceful error states with retry options
- **Real-time Updates**: Automatic refresh of live data

## Responsive Design

All pages are optimized for different screen sizes:

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Responsive design using Tailwind CSS breakpoints
- **Touch Friendly**: Interactive elements sized for touch input
- **Progressive Enhancement**: Core functionality works without JavaScript

## Performance Optimization

- **Static Generation**: Pages pre-rendered where possible
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting per route
- **Bundle Analysis**: Optimized bundle sizes and tree shaking

## Future Pages

Planned additional pages:

- `/tools/{tool}` - Individual tool detail pages
- `/scenarios/{scenario}` - Individual scenario analysis
- `/analytics` - Advanced analytics and reporting
- `/docs` - Embedded documentation viewer

*Last updated: ${new Date().toISOString()}*