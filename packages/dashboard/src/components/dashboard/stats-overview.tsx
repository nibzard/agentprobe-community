'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealth, useAggregateStats } from '@/hooks/use-api';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { Activity, Users, Target, Clock } from 'lucide-react';

export function StatsOverview() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useAggregateStats({ 
    period: 'month' 
  });

  const isLoading = healthLoading || statsLoading;

  const overviewStats = [
    {
      title: 'Total Test Runs',
      value: health?.stats.total_results || 0,
      description: 'Community submissions',
      icon: Activity,
      loading: healthLoading,
      error: healthError,
    },
    {
      title: 'Active Tools',
      value: health?.stats.total_tools || 0,
      description: 'Tools being tested',
      icon: Users,
      loading: healthLoading,
      error: healthError,
    },
    {
      title: 'Success Rate',
      value: stats?.overall_success_rate || 0,
      description: 'This month',
      icon: Target,
      loading: statsLoading,
      error: statsError,
      format: 'percentage',
    },
    {
      title: 'Scenarios',
      value: health?.stats.total_scenarios || 0,
      description: 'Test scenarios',
      icon: Clock,
      loading: healthLoading,
      error: healthError,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.loading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : stat.error ? (
                  <span className="text-muted-foreground">--</span>
                ) : (
                  stat.format === 'percentage' 
                    ? formatPercentage(stat.value)
                    : formatNumber(stat.value)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.error ? 'API offline' : stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}