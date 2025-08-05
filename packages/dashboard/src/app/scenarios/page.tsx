'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/dashboard/export-button';
import { useScenarioDifficulty } from '@/hooks/use-api';
import { formatPercentage, formatNumber, formatDuration } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

export default function ScenariosPage() {
  const { data: scenarioData, isLoading, error } = useScenarioDifficulty();

  const getDifficultyColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getDifficultyLabel = (score: number) => {
    if (score >= 70) return 'Hard';
    if (score >= 40) return 'Medium';
    return 'Easy';
  };

  const getDifficultyIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (score >= 40) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenario Analysis</h1>
          <p className="text-muted-foreground">
            Difficulty rankings and performance insights
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load scenario data</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Scenario Analysis</h1>
          <p className="text-muted-foreground">
            Difficulty rankings based on success rates, duration, and friction points
          </p>
        </div>
        <ExportButton filename="scenario-difficulty-data" />
      </div>

      {scenarioData?.methodology && (
        <Card>
          <CardHeader>
            <CardTitle>Methodology</CardTitle>
            <CardDescription>{scenarioData.methodology.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {scenarioData.methodology.factors.map((factor, index) => (
                <div key={index} className="text-sm">
                  • {factor}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scenario Difficulty Ranking</CardTitle>
          <CardDescription>
            Scenarios ranked by difficulty score (0-100, higher = more challenging)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                      <div className="h-3 bg-muted animate-pulse rounded w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                    <div className="h-4 bg-muted animate-pulse rounded w-12" />
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : scenarioData?.scenarios && scenarioData.scenarios.length > 0 ? (
            <div className="space-y-2">
              {scenarioData.scenarios.map((scenario, index) => (
                <div
                  key={scenario.scenario}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getDifficultyIcon(scenario.difficulty_score)}
                      <span className="w-8 text-center font-bold text-muted-foreground">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{scenario.scenario}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(scenario.total_runs)} runs across {scenario.tools_tested} tools
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className={`font-bold ${getDifficultyColor(scenario.difficulty_score)}`}>
                        {scenario.difficulty_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getDifficultyLabel(scenario.difficulty_score)}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold">
                        {formatPercentage(scenario.avg_success_rate / 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold">
                        {formatDuration(scenario.avg_duration)}
                      </div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold">
                        {scenario.friction_point_count.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Friction</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scenario data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Scenario analysis will appear once community members start submitting test results
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {scenarioData?.scenarios && scenarioData.scenarios.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Challenging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{scenarioData.scenarios[0]?.scenario || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                Difficulty score: {scenarioData.scenarios[0]?.difficulty_score.toFixed(1) || '0'}/100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Tested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {scenarioData.scenarios.reduce((max, scenario) => 
                  scenario.total_runs > max.total_runs ? scenario : max, scenarioData.scenarios[0]
                )?.scenario || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(Math.max(...scenarioData.scenarios.map(s => s.total_runs)))} test runs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {(scenarioData.scenarios.reduce((sum, s) => sum + s.difficulty_score, 0) / scenarioData.scenarios.length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {scenarioData.scenarios.length} scenarios
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}