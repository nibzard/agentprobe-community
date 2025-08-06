'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grade, PerformanceIndicator } from '@/components/ui/grade';
import { ExportButton } from '@/components/dashboard/export-button';
import { useToolStats, useAggregateStats } from '@/hooks/use-api';
import { formatPercentage, formatNumber, formatDuration, formatCost } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { Activity, Target, Clock, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { notFound } from 'next/navigation';

interface ToolPageClientProps {
  toolName: string;
}

export function ToolPageClient({ toolName }: ToolPageClientProps) {
  const { data: toolStats, isLoading: statsLoading, error: statsError } = useToolStats(toolName);
  const { data: aggregateStats } = useAggregateStats({ period: 'month' });

  if (statsError && statsError.message.includes('404')) {
    notFound();
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{toolName}</h1>
          <p className="text-muted-foreground">
            Detailed analysis and performance metrics
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load tool data</p>
              <p className="text-sm text-red-500 mt-2">{statsError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grade = toolStats ? calculateGrade(toolStats.success_rate) : null;
  const scenarios = toolStats ? Object.entries(toolStats.scenarios) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{toolName}</h1>
          <p className="text-muted-foreground">
            Detailed analysis and performance metrics for {toolName}
          </p>
        </div>
        <ExportButton filename={`${toolName}-analysis`} />
      </div>

      {/* Tool Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            ) : grade ? (
              <Grade grade={grade} size="lg" showLabel />
            ) : (
              <span className="text-2xl font-bold text-gray-600">N/A</span>
            )}
            <p className="text-xs text-muted-foreground">
              Based on success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                formatPercentage(toolStats?.success_rate || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all scenarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                formatNumber(toolStats?.total_runs || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Community tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                formatDuration(toolStats?.avg_duration || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                formatCost(toolStats?.avg_cost || 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {toolStats?.avg_cost === 0 ? 'Cost data not available' : 'Per test run'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scenarios Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Scenarios Performance</CardTitle>
            <CardDescription>
              Success rates and performance across all {toolName} scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </div>
                ))}
              </div>
            ) : scenarios.length > 0 ? (
              <div className="space-y-4">
                {scenarios.map(([scenarioName, scenarioStats]) => {
                  const scenarioGrade = calculateGrade(scenarioStats.success_rate);
                  return (
                    <div key={scenarioName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Grade grade={scenarioGrade} size="sm" />
                        <span className="font-medium">{scenarioName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatPercentage(scenarioStats.success_rate)}</span>
                        <span>{formatDuration(scenarioStats.avg_duration)}</span>
                        <span>{formatNumber(scenarioStats.total_runs)} runs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No scenario data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friction Points */}
        <Card>
          <CardHeader>
            <CardTitle>Common Friction Points</CardTitle>
            <CardDescription>
              Most frequently reported usability issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : toolStats?.common_friction_points && toolStats.common_friction_points.length > 0 ? (
              <div className="space-y-2">
                {toolStats.common_friction_points.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No friction points reported</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This tool appears to work smoothly for AI agents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tool Versions */}
      {toolStats?.common_versions && toolStats.common_versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Tool Versions</CardTitle>
            <CardDescription>
              Versions of {toolName} commonly used in the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {toolStats.common_versions.map((version, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  v{version}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Comparison */}
      {aggregateStats?.top_tools && (
        <Card>
          <CardHeader>
            <CardTitle>Community Comparison</CardTitle>
            <CardDescription>
              How {toolName} compares to other tools in the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolStats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Success Rate</span>
                    <div className="text-right">
                      <div className="font-bold">{formatPercentage(toolStats.success_rate)}</div>
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-xs text-muted-foreground">
                          vs {formatPercentage(aggregateStats.overall_success_rate)} avg
                        </span>
                        <PerformanceIndicator 
                          value={toolStats.success_rate} 
                          average={aggregateStats.overall_success_rate}
                          type="success_rate"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Duration</span>
                    <div className="text-right">
                      <div className="font-bold">{formatDuration(toolStats.avg_duration)}</div>
                      <div className="text-xs text-muted-foreground">
                        average completion time
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Community Activity</span>
                    <div className="text-right">
                      <div className="font-bold">{formatNumber(toolStats.total_runs)}</div>
                      <div className="text-xs text-muted-foreground">
                        total community runs
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}