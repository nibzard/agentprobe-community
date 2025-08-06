'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grade } from '@/components/ui/grade';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatDuration, formatPercentage } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { Clock, User } from 'lucide-react';
import Link from 'next/link';

interface Result {
  id: number;
  runId: string;
  timestamp: string;
  tool: string;
  scenario: string;
  duration: number;
  totalTurns: number;
  success: boolean;
  cost?: number;
  toolVersion?: string;
  agentSummary?: string;
  axScore?: string;
}

export function RecentActivity() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['recent-results'],
    queryFn: async () => {
      const response = await apiClient.queryResults({ limit: 10, offset: 0 });
      return response as Result[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest test submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest test submissions from the community</CardDescription>
      </CardHeader>
      <CardContent>
        {results && results.length > 0 ? (
          <div className="space-y-4">
            {results.slice(0, 8).map((result) => {
              const grade = result.axScore || calculateGrade(result.success ? 1 : 0);
              return (
                <div key={result.runId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Grade grade={grade as any} size="sm" />
                      <div className="flex-1">
                        <Link 
                          href={`/results/${result.runId}`}
                          className="block hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{result.tool}</span>
                            {result.toolVersion && result.toolVersion !== 'unknown' && (
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                v{result.toolVersion}
                              </span>
                            )}
                            <span className="text-muted-foreground">/</span>
                            <span className="text-sm">{result.scenario}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(result.duration)}</span>
                            </span>
                            <span>{result.totalTurns} turns</span>
                            {result.cost && result.cost > 0 && (
                              <span>${result.cost.toFixed(3)}</span>
                            )}
                            <span>{formatTimeAgo(result.timestamp)}</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {result.agentSummary && (
                    <div className="ml-10 text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                      {result.agentSummary.length > 100 
                        ? `${result.agentSummary.substring(0, 100)}...`
                        : result.agentSummary
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">
              Recent test submissions will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}