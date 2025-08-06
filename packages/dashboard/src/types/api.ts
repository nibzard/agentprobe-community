// API Response Types - matching backend implementation
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  path?: string;
  code?: string;
}

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    api: 'healthy' | 'unhealthy';
  };
  stats: {
    total_results: number;
    total_tools: number;
    total_scenarios: number;
    last_submission: string | null;
  };
}

// Leaderboard
export interface LeaderboardEntry {
  tool: string;
  total_runs: number;
  success_rate: number;
}

// Tool Statistics
export interface ToolStatsResponse {
  tool: string;
  total_runs: number;
  success_rate: number;
  avg_duration: number;
  median_duration: number;
  p95_duration: number;
  max_duration: number;
  avg_cost: number;
  common_friction_points: string[];
  common_versions: string[]; // New: common tool versions
  scenarios: Record<string, {
    total_runs: number;
    success_rate: number;
    avg_duration: number;
    median_duration: number;
    p95_duration: number;
    max_duration: number;
  }>;
}

// Aggregate Statistics
export interface AggregateStatsResponse {
  period: 'week' | 'month' | 'quarter' | 'year';
  start_date: string;
  end_date: string;
  total_runs: number;
  unique_tools: number;
  unique_scenarios: number;
  overall_success_rate: number;
  trends: Array<{
    date: string;
    runs: number;
    success_rate: number;
    avg_duration: number;
  }>;
  top_tools: Array<{
    tool: string;
    runs: number;
    success_rate: number;
  }>;
  top_scenarios: Array<{
    scenario: string;
    runs: number;
    success_rate: number;
  }>;
}

// Tool Comparison
export interface ToolComparisonResponse {
  tools: Array<{
    tool: string;
    total_runs: number;
    success_rate: number;
    avg_duration: number;
    median_duration: number;
    p95_duration: number;
    max_duration: number;
    common_friction_points: string[];
    scenarios: Record<string, {
      total_runs: number;
      success_rate: number;
      avg_duration: number;
      median_duration: number;
      p95_duration: number;
      max_duration: number;
    }>;
  }>;
  comparison_matrix: Record<string, Record<string, number>>;
}

// Scenario Difficulty
export interface ScenarioDifficultyEntry {
  scenario: string;
  difficulty_score: number;
  total_runs: number;
  avg_success_rate: number;
  avg_duration: number;
  median_duration: number;
  p95_duration: number;
  max_duration: number;
  friction_point_count: number;
  tools_tested: number;
}

export interface ScenarioDifficultyResponse {
  scenarios: ScenarioDifficultyEntry[];
  methodology: {
    factors: string[];
    description: string;
  };
}

// Query Parameters
export interface QueryParams {
  tool?: string;
  scenario?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface AggregateStatsRequest {
  period: 'week' | 'month' | 'quarter' | 'year';
  tool?: string;
  scenario?: string;
  start_date?: string;
  end_date?: string;
}

export interface ToolComparisonRequest {
  tools: string[];
  scenario?: string;
  metric?: 'success_rate' | 'avg_duration' | 'total_runs';
}