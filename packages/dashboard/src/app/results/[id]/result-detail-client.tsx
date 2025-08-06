'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grade, PerformanceIndicator } from '@/components/ui/grade';
import { QuickComparison } from '@/components/dashboard/community-comparison';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatDuration, formatPercentage, formatCost } from '@/lib/utils';
import { calculateGrade } from '@/lib/grades';
import { 
  ArrowLeft, 
  Clock, 
  Activity, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Code2,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EnhancedResult {
  id: number;
  runId: string;
  timestamp: string;
  tool: string;
  scenario: string;
  agentprobeVersion: string;
  os: string;
  pythonVersion: string;
  toolVersion?: string;
  versionDetectionMethod?: string;
  versionDetectionSuccess?: boolean;
  duration: number;
  totalTurns: number;
  success: boolean;
  errorMessage?: string;
  cost?: number;
  agentSummary?: string;
  axScore?: string;
  frictionPoints: string[];
  helpUsageCount: number;
  recommendations: string[];
  fullOutput?: string;
  clientId: string;
}

interface ResultDetailClientProps {
  resultId: string;
}

export function ResultDetailClient({ resultId }: ResultDetailClientProps) {
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['result', resultId],
    queryFn: async () => {
      // This would need to be implemented in the API
      const response = await fetch(`/api/v1/results/${resultId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Result not found');
        }
        throw new Error('Failed to fetch result');
      }
      return response.json();
    },
  });

  if (error && error.message.includes('404')) {
    notFound();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Result Details</h1>
          <p className="text-muted-foreground">
            Detailed view of an AgentProbe test result
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load result data</p>
              <p className="text-sm text-red-500 mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div>
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data = result?.data as EnhancedResult;
  if (!data) {
    notFound();
  }

  const grade = data.axScore || calculateGrade(data.success ? 1 : 0);
  const formatTimeAgo = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data.tool} / {data.scenario}
          </h1>
          <p className="text-muted-foreground">
            Test result from {formatTimeAgo(data.timestamp)}
          </p>
        </div>
      </div>

      {/* Result Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {data.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Grade grade={grade as any} size="md" showLabel />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-bold">{formatDuration(data.duration)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalTurns} turns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCost(data.cost || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              API usage cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tool Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {data.toolVersion ? `v${data.toolVersion}` : 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.versionDetectionSuccess ? 'Detected' : 'Not detected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Experience Summary */}
      {data.agentSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Experience Summary</CardTitle>
            <CardDescription>
              What happened during this test run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{data.agentSummary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Friction Points */}
        {data.frictionPoints && data.frictionPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>CLI Friction Points</span>
              </CardTitle>
              <CardDescription>
                Usability issues encountered during testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.frictionPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <span>Top Improvements for CLI</span>
              </CardTitle>
              <CardDescription>
                Suggested enhancements to improve tool usability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 font-medium mt-1">{index + 1}.</span>
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Technical Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium">AgentProbe Version</p>
              <p className="text-sm text-muted-foreground">{data.agentprobeVersion}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Operating System</p>
              <p className="text-sm text-muted-foreground">{data.os}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Python Version</p>
              <p className="text-sm text-muted-foreground">{data.pythonVersion}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Run ID</p>
              <p className="text-sm text-muted-foreground font-mono">{data.runId}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Help Usage Count</p>
              <p className="text-sm text-muted-foreground">{data.helpUsageCount}</p>
            </div>
            {data.errorMessage && (
              <div className="col-span-full">
                <p className="text-sm font-medium text-red-600">Error Message</p>
                <p className="text-sm text-red-500 font-mono mt-1">{data.errorMessage}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Output (if available) */}
      {data.fullOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Structured Output</CardTitle>
            <CardDescription>
              Full JSON output from AgentProbe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(JSON.parse(data.fullOutput), null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}