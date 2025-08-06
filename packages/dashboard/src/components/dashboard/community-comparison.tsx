'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceIndicator } from '@/components/ui/grade';
import { CheckCircle, XCircle, Clock, Activity, Users } from 'lucide-react';
import { formatDuration, formatPercentage, formatNumber } from '@/lib/utils';

interface CommunityComparisonProps {
  tool: string;
  scenario: string;
  userDuration?: number;
  userSuccess?: boolean;
  communityStats: {
    avgDuration: number;
    successRate: number;
    totalRuns: number;
  };
}

export function CommunityComparison({ 
  tool, 
  scenario, 
  userDuration, 
  userSuccess,
  communityStats 
}: CommunityComparisonProps) {
  const formatComparisonText = (userValue: number, avgValue: number, type: 'duration' | 'success') => {
    if (type === 'duration') {
      return `${formatDuration(userValue)} vs ${formatDuration(avgValue)} avg`;
    }
    return `${formatPercentage(userValue)} vs ${formatPercentage(avgValue)} avg`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <span className="text-lg">🌍</span>
          <CardTitle>Community Comparison for {tool}/{scenario}</CardTitle>
        </div>
        <CardDescription>
          How this result compares to the community average
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Success Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {userSuccess ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">Success</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">Failed</span>
                </>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              ({formatPercentage(communityStats.successRate)} community success rate)
            </span>
          </div>

          {/* Duration Comparison */}
          {userDuration && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Duration:</span>
                <span>{formatComparisonText(userDuration, communityStats.avgDuration, 'duration')}</span>
              </div>
              <PerformanceIndicator 
                value={userDuration}
                average={communityStats.avgDuration}
                type="duration"
              />
            </div>
          )}

          {/* Community Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-muted-foreground">
                Based on {formatNumber(communityStats.totalRuns)} community runs
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickComparisonProps {
  tool: string;
  scenario: string;
  result: {
    duration: number;
    success: boolean;
    turns: number;
  };
  communityStats: {
    avgDuration: number;
    successRate: number;
    totalRuns: number;
  };
}

export function QuickComparison({ tool, scenario, result, communityStats }: QuickComparisonProps) {
  const successIcon = result.success ? '✅' : '❌';
  const successText = result.success 
    ? result.success === (communityStats.successRate >= 0.5) 
      ? 'matches community average' 
      : 'above community average'
    : 'below community average';
  
  const durationComparison = result.duration <= communityStats.avgDuration 
    ? 'faster than average'
    : result.duration <= (communityStats.avgDuration * 1.1)
    ? 'average speed'
    : 'slower than average';

  return (
    <div className="space-y-2 text-sm">
      <div className="font-medium text-center">
        🌍 Community Comparison for {tool}/{scenario}:
      </div>
      <div className="flex items-center space-x-1">
        <span>{successIcon}</span>
        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
          {result.success ? 'Success' : 'Failed'}
        </span>
        <span className="text-muted-foreground">({successText})</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>⏱️</span>
        <span>Duration: {formatDuration(result.duration)} vs {formatDuration(communityStats.avgDuration)} avg</span>
        <span className="text-muted-foreground">({durationComparison})</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>📊</span>
        <span className="text-muted-foreground">
          Based on {formatNumber(communityStats.totalRuns)} community runs
        </span>
      </div>
    </div>
  );
}