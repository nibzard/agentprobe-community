'use client';

import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentActivity } from '@/components/dashboard/recent-activity';
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
        
        <RecentActivity />
      </div>
    </div>
  );
}