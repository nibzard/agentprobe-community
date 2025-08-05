'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAggregateStats } from '@/hooks/use-api';
import { formatPercentage } from '@/lib/utils';

export function SuccessRateChart() {
  const { data: stats, isLoading } = useAggregateStats({ period: 'month' });

  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading chart data...</div>
      </div>
    );
  }

  if (!stats?.trends || stats.trends.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">No trend data available</div>
      </div>
    );
  }

  const chartData = stats.trends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    successRate: trend.success_rate * 100, // Convert to percentage
    runs: trend.runs,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs fill-muted-foreground"
        />
        <YAxis 
          domain={[0, 100]}
          className="text-xs fill-muted-foreground"
          label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Date
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Success Rate
                      </span>
                      <span className="font-bold">
                        {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="successRate"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}