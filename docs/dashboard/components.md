# Dashboard Components

*Auto-generated from component analysis*

This document provides an overview of the UI components used in the AgentProbe Community Dashboard.

## Component Structure

The dashboard is built with Next.js 15 and uses a modular component architecture:

```
src/components/
├── charts/           # Data visualization components
├── dashboard/        # Dashboard-specific components  
└── ui/              # Reusable UI components
```

## Chart Components (`/charts`)

### SuccessRateChart
**File**: `src/components/charts/success-rate-chart.tsx`

Interactive chart component for displaying success rate trends over time.

**Features**:
- Time-series visualization using Recharts
- Responsive design for mobile and desktop
- Hover tooltips with detailed metrics
- Configurable time periods

**Usage**:
```tsx
import { SuccessRateChart } from '@/components/charts/success-rate-chart';

<SuccessRateChart />
```

## Dashboard Components (`/dashboard`)

### DashboardLayout  
**File**: `src/components/dashboard/layout.tsx`

Main layout wrapper providing consistent navigation and structure.

**Features**:
- Responsive navigation header
- Consistent spacing and typography
- Mobile-friendly sidebar navigation

### Header
**File**: `src/components/dashboard/header.tsx`

Dashboard header with navigation and branding.

**Features**:
- Project branding and title
- Navigation links to main sections
- Responsive design

### StatsOverview
**File**: `src/components/dashboard/stats-overview.tsx`

Overview cards displaying key community statistics.

**Features**:
- Real-time data from API
- Loading states with skeletons
- Responsive grid layout
- Key metrics: total results, success rates, active tools

### ExportButton
**File**: `src/components/dashboard/export-button.tsx`

Button component for exporting data and charts.

**Features**:
- Multiple export formats (CSV, JSON, PNG)
- Progress indicators during export
- Error handling and user feedback

## UI Components (`/ui`)

### Button
**File**: `src/components/ui/button.tsx`

Reusable button component with variants and sizes.

**Variants**:
- `default` - Primary action button
- `secondary` - Secondary action button  
- `outline` - Outlined button style
- `ghost` - Minimal button style

**Sizes**:
- `sm` - Small button
- `default` - Default size
- `lg` - Large button

**Usage**:
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">
  Click me
</Button>
```

### Card
**File**: `src/components/ui/card.tsx`

Flexible card component for content organization.

**Components**:
- `Card` - Main card container
- `CardHeader` - Card header section
- `CardTitle` - Card title component
- `CardDescription` - Card description text
- `CardContent` - Main card content area

**Usage**:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

## Styling System

Components use a consistent design system built with:

- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Consistent color palette and spacing
- **Class Variance Authority (CVA)**: Type-safe component variants
- **Responsive Design**: Mobile-first approach

## Component Guidelines

### Accessibility
- All interactive components include proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

### Performance
- Components use React.memo() where appropriate
- Lazy loading for heavy chart components
- Optimized re-renders with proper dependencies

### Testing
- Components include TypeScript for compile-time validation
- Props are validated with proper TypeScript interfaces
- Error boundaries for graceful failure handling

*Last updated: ${new Date().toISOString()}*