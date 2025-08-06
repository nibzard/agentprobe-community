'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grade } from '@/components/ui/grade';
import { ExportButton } from '@/components/dashboard/export-button';
import { useLeaderboard } from '@/hooks/use-api';
import { formatPercentage, formatNumber } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading, error } = useLeaderboard();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Leaderboard</h1>
          <p className="text-muted-foreground">
            Community rankings based on test success rates
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load leaderboard data</p>
              <p className="text-sm text-red-500 mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Leaderboard</h1>
          <p className="text-muted-foreground">
            Community rankings based on test success rates and volume
          </p>
        </div>
        <ExportButton filename="leaderboard-data" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tools</CardTitle>
          <CardDescription>
            Ranked by success rate with minimum 3 test runs for statistical significance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/6" />
                  </div>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  <div className="h-4 bg-muted animate-pulse rounded w-12" />
                </div>
              ))}
            </div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const grade = calculateGrade(entry.success_rate);
                return (
                  <div
                    key={entry.tool}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-4">
                      {getRankIcon(index)}
                      <div>
                        <Link
                          href={`/tools/${encodeURIComponent(entry.tool)}`}
                          className="font-semibold hover:underline"
                        >
                          {entry.tool}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(entry.total_runs)} test runs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatPercentage(entry.success_rate)}
                        </div>
                        <p className="text-sm text-muted-foreground">success rate</p>
                      </div>
                      <Grade grade={grade} size="md" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No leaderboard data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Leaderboard will appear once community members start submitting test results
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {leaderboard && leaderboard.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard[0]?.tool || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(leaderboard[0]?.success_rate || 0)} success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Tested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaderboard.reduce((max, entry) => 
                  entry.total_runs > max.total_runs ? entry : max, leaderboard[0]
                )?.tool || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(Math.max(...leaderboard.map(e => e.total_runs)))} test runs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboard.length}</div>
              <p className="text-xs text-muted-foreground">in leaderboard</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}