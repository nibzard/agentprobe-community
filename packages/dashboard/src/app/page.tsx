'use client';

import { StatsOverview } from '@/components/dashboard/stats-overview';
import { SuccessRateChart } from '@/components/charts/success-rate-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time statistics and insights from the AgentProbe community
        </p>
      </div>
      
      <StatsOverview />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Success Rate Trends</CardTitle>
            <CardDescription>
              Community-wide success rates over the past month
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SuccessRateChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest test submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Loading recent activity...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Real-time updates will appear here
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}