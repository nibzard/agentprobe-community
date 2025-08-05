import {
  ApiResponse,
  HealthCheckResponse,
  LeaderboardEntry,
  ToolStatsResponse,
  AggregateStatsResponse,
  ToolComparisonResponse,
  ScenarioDifficultyResponse,
  AggregateStatsRequest,
  ToolComparisonRequest,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorCode = 'HTTP_ERROR';
        
        try {
          const errorData: ApiResponse<never> = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
          if (errorData.code) {
            errorCode = errorData.code;
          }
        } catch {
          // If we can't parse error JSON, use the default message
        }
        
        throw new ApiError(errorMessage, response.status, errorCode);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (data.status === 'error') {
        throw new ApiError(
          data.error || 'API Error',
          response.status,
          data.code
        );
      }

      // Ensure we always return a value, even if data.data is undefined
      return data.data!;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Health check
  async getHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>('/api/v1/leaderboard');
  }

  // Tool statistics
  async getToolStats(tool: string): Promise<ToolStatsResponse> {
    return this.request<ToolStatsResponse>(`/api/v1/stats/tool/${encodeURIComponent(tool)}`);
  }

  // Aggregate statistics
  async getAggregateStats(params: AggregateStatsRequest): Promise<AggregateStatsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('period', params.period);
    
    if (params.tool) searchParams.set('tool', params.tool);
    if (params.scenario) searchParams.set('scenario', params.scenario);
    if (params.start_date) searchParams.set('start_date', params.start_date);
    if (params.end_date) searchParams.set('end_date', params.end_date);

    return this.request<AggregateStatsResponse>(`/api/v1/stats/aggregate?${searchParams}`);
  }

  // Tool comparison
  async compareTools(request: ToolComparisonRequest): Promise<ToolComparisonResponse> {
    return this.request<ToolComparisonResponse>('/api/v1/compare/tools', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Scenario difficulty
  async getScenarioDifficulty(): Promise<ScenarioDifficultyResponse> {
    return this.request<ScenarioDifficultyResponse>('/api/v1/scenarios/difficulty');
  }

  // Export data
  async exportData(format: 'csv' | 'json', filters?: any): Promise<{
    content: string;
    content_type: string;
    record_count: number;
  }> {
    return this.request('/api/v1/export', {
      method: 'POST',
      body: JSON.stringify({ format, filters }),
    });
  }
}

export const apiClient = new ApiClient();
export { ApiError };