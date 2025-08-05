import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  HealthCheckResponse,
  LeaderboardEntry,
  ToolStatsResponse,
  AggregateStatsResponse,
  ToolComparisonResponse,
  ScenarioDifficultyResponse,
  AggregateStatsRequest,
  ToolComparisonRequest,
} from '@/types/api';

// Health check
export function useHealth(options?: UseQueryOptions<HealthCheckResponse>) {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (likely auth issues)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Leaderboard
export function useLeaderboard(options?: UseQueryOptions<LeaderboardEntry[]>) {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.getLeaderboard(),
    refetchInterval: 60000, // Refetch every minute
    ...options,
  });
}

// Tool statistics
export function useToolStats(
  tool: string,
  options?: UseQueryOptions<ToolStatsResponse>
) {
  return useQuery({
    queryKey: ['tool-stats', tool],
    queryFn: () => apiClient.getToolStats(tool),
    enabled: !!tool,
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options,
  });
}

// Aggregate statistics
export function useAggregateStats(
  params: AggregateStatsRequest,
  options?: UseQueryOptions<AggregateStatsResponse>
) {
  return useQuery({
    queryKey: ['aggregate-stats', params],
    queryFn: () => apiClient.getAggregateStats(params),
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (likely auth issues)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Tool comparison
export function useToolComparison(
  request: ToolComparisonRequest,
  options?: UseQueryOptions<ToolComparisonResponse>
) {
  return useQuery({
    queryKey: ['tool-comparison', request],
    queryFn: () => apiClient.compareTools(request),
    enabled: request.tools.length >= 2,
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options,
  });
}

// Scenario difficulty
export function useScenarioDifficulty(
  options?: UseQueryOptions<ScenarioDifficultyResponse>
) {
  return useQuery({
    queryKey: ['scenario-difficulty'],
    queryFn: () => apiClient.getScenarioDifficulty(),
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options,
  });
}