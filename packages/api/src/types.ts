// Types matching the original AgentProbe data model

export interface ClientInfo {
  agentprobe_version: string;
  os: string;
  python_version: string;
}

export interface ExecutionInfo {
  duration: number;
  total_turns: number;
  success: boolean;
  error_message?: string;
  cost?: number | null;
}

export interface AnalysisInfo {
  friction_points: string[];
  help_usage_count: number;
  recommendations: string[];
  agent_summary?: string;
  ax_score?: string;
}

// Tool version detection info (new)
export interface ToolVersionInfo {
  tool_version?: string;
  version_detection_method?: string;
  version_detection_success?: boolean;
}

export interface ResultSubmission {
  run_id: string;
  timestamp: string;
  tool: string;
  scenario: string;
  client_info: ClientInfo;
  tool_version_info?: ToolVersionInfo; // New tool version data
  execution: ExecutionInfo;
  analysis: AnalysisInfo;
  full_output?: string; // Complete structured output JSON
  client_id?: string; // Generated server-side if not provided
}

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
  scenarios: Record<string, ScenarioStats>;
}

export interface ScenarioStats {
  total_runs: number;
  success_rate: number;
  avg_duration: number;
  median_duration: number;
  p95_duration: number;
  max_duration: number;
}

export interface LeaderboardEntry {
  tool: string;
  success_rate: number;
  total_runs: number;
}

export interface QueryParams {
  tool?: string;
  scenario?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  status: 'error';
  error: string;
  message?: string;
  code?: string;
  timestamp: string;
  path?: string;
}

// Batch submission types
export interface BatchSubmissionRequest {
  results: ResultSubmission[];
  metadata?: {
    batch_id?: string;
    source: string;
    description?: string;
  };
}

export interface BatchSubmissionResponse {
  status: 'success' | 'partial' | 'error';
  processed: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
  batch_id?: string;
}

// Aggregate statistics types
export interface AggregateStatsRequest {
  period: 'week' | 'month' | 'quarter' | 'year';
  tool?: string;
  scenario?: string;
  start_date?: string;
  end_date?: string;
}

export interface AggregateStatsResponse {
  period: string;
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

// Tool comparison types
export interface ToolComparisonRequest {
  tools: string[];
  scenario?: string;
  metric?: 'success_rate' | 'avg_duration' | 'total_runs';
}

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
    scenarios: Record<string, ScenarioStats>;
  }>;
  comparison_matrix: Record<string, Record<string, number>>;
}

// Scenario difficulty ranking types
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

// Export types
export interface ExportRequest {
  format: 'csv' | 'json';
  filters?: {
    tool?: string;
    scenario?: string;
    success?: boolean;
    start_date?: string;
    end_date?: string;
  };
  fields?: string[];
}

export interface ExportResponse {
  status: 'success' | 'error';
  download_url?: string;
  expires_at?: string;
  error?: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
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

// Enhanced result data (includes all new fields)
export interface EnhancedResult {
  id: number;
  run_id: string;
  timestamp: string;
  tool: string;
  scenario: string;
  
  // Client info
  agentprobe_version: string;
  os: string;
  python_version: string;
  
  // Tool version info
  tool_version?: string;
  version_detection_method?: string;
  version_detection_success?: boolean;
  
  // Execution data
  duration: number;
  total_turns: number;
  success: boolean;
  error_message?: string;
  cost?: number;
  
  // Enhanced analysis
  agent_summary?: string;
  ax_score?: string;
  friction_points: string[];
  help_usage_count: number;
  recommendations: string[];
  full_output?: string;
  
  // Client ID
  client_id: string;
}

// Authentication types
export interface AuthContext {
  keyId: string;
  permissions: string[];
  rateLimit: number;
  authenticated: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: string;
}

export interface CreateApiKeyResponse {
  keyId: string;
  secretKey: string; // Only returned once
  name: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: string;
  warning: string;
}

export interface ApiKeyInfo {
  keyId: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  rateLimit: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  window: string;
}

export interface SecurityEventInfo {
  eventType: string;
  keyId?: string;
  ipAddress?: string;
  endpoint?: string;
  timestamp: string;
  details?: any;
}