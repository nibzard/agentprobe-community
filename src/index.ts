import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createDb } from './db';
import { results, toolStats, frictionPointStats, apiKeys, securityEvents } from './db/schema';
import { eq, and, desc, sql, count, gte, lte, inArray } from 'drizzle-orm';
import type { 
  ResultSubmission, 
  ToolStatsResponse, 
  LeaderboardEntry, 
  QueryParams,
  BatchSubmissionRequest,
  BatchSubmissionResponse,
  AggregateStatsRequest,
  AggregateStatsResponse,
  ToolComparisonRequest,
  ToolComparisonResponse,
  ScenarioDifficultyResponse,
  ScenarioDifficultyEntry,
  ExportRequest,
  ExportResponse,
  HealthCheckResponse,
  ApiError,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  ApiKeyInfo,
  AuthContext,
  SecurityEventInfo
} from './types';

// Import authentication middleware and utilities
import { 
  authMiddleware, 
  optionalAuthMiddleware, 
  requirePermissions, 
  adminOnly, 
  readOnly, 
  writeAccess, 
  keyManagement,
  PERMISSIONS 
} from './auth/middleware';
import { 
  createApiKey, 
  listApiKeys, 
  getApiKey, 
  updateApiKey, 
  deactivateApiKey, 
  deleteApiKey 
} from './auth/api-keys';
import { 
  securityHeadersMiddleware, 
  sanitizationMiddleware, 
  SecurityUtils 
} from './auth/security';
import { cleanupRateLimits, getRateLimitStatus } from './auth/rate-limiter';

type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Database middleware - inject DB instance into context
app.use('*', async (c, next) => {
  const db = createDb(c.env.DB);
  c.set('db', db);
  await next();
});

// Security middleware
app.use('*', securityHeadersMiddleware());
app.use('*', sanitizationMiddleware());

// IP-based rate limiting middleware
app.use('*', async (c, next) => {
  const ip = SecurityUtils.getClientIp(c);
  
  // Check for suspicious patterns
  if (SecurityUtils.isSuspiciousRequest(c)) {
    const db = c.get('db');
    await db.insert(securityEvents).values({
      eventType: 'suspicious_request',
      ipAddress: ip,
      userAgent: c.req.header('User-Agent'),
      endpoint: `${c.req.method} ${c.req.path}`,
      details: JSON.stringify({ reason: 'suspicious_patterns' })
    });
    
    return c.json({
      status: 'error',
      error: 'Request blocked',
      code: 'SUSPICIOUS_REQUEST'
    }, 403);
  }
  
  // Basic IP rate limiting (1000 requests per hour per IP)
  if (!SecurityUtils.checkIpRateLimit(ip)) {
    return c.json({
      status: 'error',
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP address',
      code: 'IP_RATE_LIMIT'
    }, 429);
  }
  
  await next();
});

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://agentprobe.dev'], // Add your production domains
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(createErrorResponse(
    'Internal server error',
    err instanceof Error ? err.message : 'Unknown error occurred',
    'INTERNAL_ERROR',
    c.req.url
  ), 500);
});

// 404 handler
app.notFound((c) => {
  return c.json(createErrorResponse(
    'Endpoint not found',
    `The requested endpoint ${c.req.method} ${c.req.url} was not found`,
    'NOT_FOUND',
    c.req.url
  ), 404);
});

// Validation schemas
const resultSubmissionSchema = z.object({
  run_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  tool: z.string().min(1),
  scenario: z.string().min(1),
  client_info: z.object({
    agentprobe_version: z.string(),
    os: z.string(),
    python_version: z.string(),
  }),
  execution: z.object({
    duration: z.number().positive(),
    total_turns: z.number().int().positive(),
    success: z.boolean(),
    error_message: z.string().optional(),
  }),
  analysis: z.object({
    friction_points: z.array(z.string()),
    help_usage_count: z.number().int().min(0),
    recommendations: z.array(z.string()),
  }),
  client_id: z.string().optional(),
});

const queryParamsSchema = z.object({
  tool: z.string().optional(),
  scenario: z.string().optional(),
  success: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  limit: z.string().transform(val => parseInt(val) || 100).optional(),
  offset: z.string().transform(val => parseInt(val) || 0).optional(),
});

// Batch submission schema
const batchSubmissionSchema = z.object({
  results: z.array(resultSubmissionSchema),
  metadata: z.object({
    batch_id: z.string().optional(),
    source: z.string(),
    description: z.string().optional(),
  }).optional(),
});

// Aggregate stats schema
const aggregateStatsSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']),
  tool: z.string().optional(),
  scenario: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// Tool comparison schema
const toolComparisonSchema = z.object({
  tools: z.array(z.string()).min(2).max(10),
  scenario: z.string().optional(),
  metric: z.enum(['success_rate', 'avg_duration', 'total_runs']).optional(),
});

// Export schema
const exportSchema = z.object({
  format: z.enum(['csv', 'json']),
  filters: z.object({
    tool: z.string().optional(),
    scenario: z.string().optional(),
    success: z.boolean().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
  }).optional(),
  fields: z.array(z.string()).optional(),
});

// API Key schemas
const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.enum(['read', 'write', 'admin', 'manage_keys'])).optional(),
  rateLimit: z.number().int().min(1).max(10000).optional(),
  expiresAt: z.string().datetime().optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.enum(['read', 'write', 'admin', 'manage_keys'])).optional(),
  rateLimit: z.number().int().min(1).max(10000).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// SECURITY: Define valid security event types as constants
const VALID_SECURITY_EVENT_TYPES = [
  'auth_success',
  'auth_missing',
  'auth_invalid_format', 
  'auth_key_not_found',
  'auth_key_inactive',
  'auth_key_expired',
  'auth_invalid_secret',
  'rate_limit_exceeded',
  'auth_insufficient_permissions',
  'auth_error',
  'suspicious_request',
  'security_events_error'
] as const;

type SecurityEventType = typeof VALID_SECURITY_EVENT_TYPES[number];

// SECURITY: Validate security event types
function isValidSecurityEventType(eventType: string): eventType is SecurityEventType {
  return VALID_SECURITY_EVENT_TYPES.includes(eventType as SecurityEventType);
}

// Helper functions
function generateClientId(submission: ResultSubmission): string {
  const data = `${submission.client_info.os}-${submission.client_info.python_version}`;
  return btoa(data).slice(0, 16); // Simple hash for demo
}

function createErrorResponse(error: string, message?: string, code?: string, path?: string): ApiError {
  return {
    status: 'error',
    error,
    message,
    code,
    timestamp: new Date().toISOString(),
    path,
  };
}

function createSuccessResponse<T>(data: T, message?: string) {
  return {
    status: 'success' as const,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

function getPeriodDates(period: string): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { start, end: now };
}

function calculateDifficultyScore(
  successRate: number,
  avgDuration: number,
  frictionPointCount: number,
  totalRuns: number
): number {
  // Difficulty score algorithm (0-100, higher = more difficult)
  const successWeight = 0.4;
  const durationWeight = 0.3;
  const frictionWeight = 0.2;
  const volumeWeight = 0.1;
  
  const successScore = (1 - successRate) * 100;
  const durationScore = Math.min(avgDuration / 60, 10) * 10; // Cap at 10 minutes
  const frictionScore = Math.min(frictionPointCount, 10) * 10; // Cap at 10 points
  const volumeScore = Math.min(totalRuns / 100, 1) * 10; // More runs = more reliable
  
  return (
    successScore * successWeight +
    durationScore * durationWeight +
    frictionScore * frictionWeight +
    volumeScore * volumeWeight
  );
}

async function processSubmission(db: any, submission: ResultSubmission, clientId: string) {
  // Insert result
  await db.insert(results).values({
    runId: submission.run_id,
    timestamp: submission.timestamp,
    tool: submission.tool,
    scenario: submission.scenario,
    agentprobeVersion: submission.client_info.agentprobe_version,
    os: submission.client_info.os,
    pythonVersion: submission.client_info.python_version,
    duration: submission.execution.duration,
    totalTurns: submission.execution.total_turns,
    success: submission.execution.success,
    errorMessage: submission.execution.error_message,
    frictionPoints: JSON.stringify(submission.analysis.friction_points),
    helpUsageCount: submission.analysis.help_usage_count,
    recommendations: JSON.stringify(submission.analysis.recommendations),
    clientId,
  });
  
  // Update tool stats (upsert)
  const existingStats = await db.select()
    .from(toolStats)
    .where(and(
      eq(toolStats.tool, submission.tool),
      eq(toolStats.scenario, submission.scenario)
    ))
    .limit(1);
  
  if (existingStats.length > 0) {
    const stats = existingStats[0];
    const newTotalRuns = stats.totalRuns + 1;
    const newSuccessfulRuns = stats.successfulRuns + (submission.execution.success ? 1 : 0);
    const newSuccessRate = newSuccessfulRuns / newTotalRuns;
    const newAvgDuration = (stats.avgDuration * stats.totalRuns + submission.execution.duration) / newTotalRuns;
    
    await db.update(toolStats)
      .set({
        totalRuns: newTotalRuns,
        successfulRuns: newSuccessfulRuns,
        successRate: newSuccessRate,
        avgDuration: newAvgDuration,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(toolStats.id, stats.id));
  } else {
    await db.insert(toolStats).values({
      tool: submission.tool,
      scenario: submission.scenario,
      totalRuns: 1,
      successfulRuns: submission.execution.success ? 1 : 0,
      successRate: submission.execution.success ? 1 : 0,
      avgDuration: submission.execution.duration,
      lastUpdated: new Date().toISOString(),
    });
  }
  
  // Update friction point stats
  for (const frictionPoint of submission.analysis.friction_points) {
    const existing = await db.select()
      .from(frictionPointStats)
      .where(and(
        eq(frictionPointStats.tool, submission.tool),
        eq(frictionPointStats.frictionPoint, frictionPoint)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      await db.update(frictionPointStats)
        .set({
          count: existing[0].count + 1,
          lastSeen: new Date().toISOString(),
        })
        .where(eq(frictionPointStats.id, existing[0].id));
    } else {
      await db.insert(frictionPointStats).values({
        tool: submission.tool,
        frictionPoint,
        count: 1,
        lastSeen: new Date().toISOString(),
      });
    }
  }
}

// Routes

// Health check endpoint
app.get('/health', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const startTime = Date.now();
    
    // Test database connection
    let dbHealthy = true;
    let totalResults = 0;
    let totalTools = 0;
    let totalScenarios = 0;
    let lastSubmission: string | null = null;
    
    try {
      const resultCount = await db.select({ count: count() }).from(results);
      totalResults = resultCount[0]?.count || 0;
      
      const toolCount = await db.select({ count: count() }).from(toolStats);
      totalTools = toolCount[0]?.count || 0;
      
      const scenarioCount = await db.select({
        count: sql<number>`COUNT(DISTINCT scenario)`
      }).from(results);
      totalScenarios = scenarioCount[0]?.count || 0;
      
      const lastResult = await db.select({ timestamp: results.timestamp })
        .from(results)
        .orderBy(desc(results.timestamp))
        .limit(1);
      lastSubmission = lastResult[0]?.timestamp || null;
    } catch (error) {
      dbHealthy = false;
    }
    
    const responseTime = Date.now() - startTime;
    const status = dbHealthy ? 'healthy' : 'unhealthy';
    
    const healthResponse: HealthCheckResponse = {
      status,
      version: '1.0.0',
      environment: c.env.ENVIRONMENT || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: responseTime,
      checks: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
      stats: {
        total_results: totalResults,
        total_tools: totalTools,
        total_scenarios: totalScenarios,
        last_submission: lastSubmission,
      },
    };
    
    return c.json(healthResponse, status === 'healthy' ? 200 : 503);
  } catch (error) {
    return c.json(createErrorResponse(
      'Health check failed',
      'Unable to perform health check',
      'HEALTH_CHECK_ERROR'
    ), 503);
  }
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'AgentProbe Community API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    authentication: {
      required: true,
      type: 'API Key',
      header: 'Authorization: Bearer <api_key> or X-API-Key: <api_key>'
    },
    endpoints: {
      // Public endpoints
      health: '/health',
      
      // Authentication endpoints (admin only)
      auth: {
        create_key: 'POST /api/v1/auth/keys',
        list_keys: 'GET /api/v1/auth/keys',
        get_key: 'GET /api/v1/auth/keys/{keyId}',
        update_key: 'PUT /api/v1/auth/keys/{keyId}',
        deactivate_key: 'DELETE /api/v1/auth/keys/{keyId}',
        rate_limit_status: 'GET /api/v1/auth/rate-limit',
        security_events: 'GET /api/v1/auth/security-events'
      },
      
      // Data endpoints (read/write permissions required)
      data: {
        submit_result: 'POST /api/v1/results (write)',
        batch_submit: 'POST /api/v1/results/batch (write)',
        query_results: 'GET /api/v1/results (read)',
        tool_stats: 'GET /api/v1/stats/tool/{tool} (read)',
        scenario_stats: 'GET /api/v1/stats/scenario/{tool}/{scenario} (read)',
        leaderboard: 'GET /api/v1/leaderboard (read)',
        aggregate_stats: 'GET /api/v1/stats/aggregate (read)',
        tool_comparison: 'POST /api/v1/compare/tools (read)',
        scenario_difficulty: 'GET /api/v1/scenarios/difficulty (read)',
        export_data: 'POST /api/v1/export (read)'
      }
    },
    permissions: {
      read: 'Access to view data and statistics',
      write: 'Access to submit test results',
      admin: 'Full administrative access',
      manage_keys: 'Manage API keys'
    }
  });
});

// Authentication endpoints

// Create API key (admin only)
app.post('/api/v1/auth/keys', adminOnly(), zValidator('json', createApiKeySchema), async (c) => {
  try {
    const db = c.get('db');
    const request = c.req.valid('json');
    const auth: AuthContext = c.get('auth');
    
    const newKey = await createApiKey(db, request, auth.keyId);
    
    return c.json(createSuccessResponse(newKey, 'API key created successfully'));
  } catch (error) {
    console.error('Error creating API key:', error);
    return c.json(createErrorResponse(
      'Failed to create API key',
      error instanceof Error ? error.message : 'Unknown error',
      'API_KEY_CREATION_ERROR',
      c.req.url
    ), 500);
  }
});

// API keys list query validation schema
const apiKeysListQuerySchema = z.object({
  active: z.string().transform(val => val !== 'false').optional().default(true),
});

// List API keys (key management permission required)
app.get('/api/v1/auth/keys', keyManagement(), zValidator('query', apiKeysListQuerySchema), async (c) => {
  try {
    const db = c.get('db');
    const params = c.req.valid('query');
    const activeOnly = params.active;
    
    const keys = await listApiKeys(db, activeOnly);
    
    return c.json(createSuccessResponse(keys, 'API keys retrieved successfully'));
  } catch (error) {
    console.error('Error listing API keys:', error);
    return c.json(createErrorResponse(
      'Failed to list API keys',
      error instanceof Error ? error.message : 'Unknown error',
      'API_KEY_LIST_ERROR',
      c.req.url
    ), 500);
  }
});

// Get API key details (key management permission required)
app.get('/api/v1/auth/keys/:keyId', keyManagement(), async (c) => {
  try {
    const db = c.get('db');
    const keyId = c.req.param('keyId');
    
    const key = await getApiKey(db, keyId);
    
    if (!key) {
      return c.json(createErrorResponse(
        'API key not found',
        `API key with ID ${keyId} was not found`,
        'API_KEY_NOT_FOUND',
        c.req.url
      ), 404);
    }
    
    return c.json(createSuccessResponse(key, 'API key details retrieved successfully'));
  } catch (error) {
    console.error('Error getting API key:', error);
    return c.json(createErrorResponse(
      'Failed to get API key',
      error instanceof Error ? error.message : 'Unknown error',
      'API_KEY_GET_ERROR',
      c.req.url
    ), 500);
  }
});

// Update API key (key management permission required)
app.put('/api/v1/auth/keys/:keyId', keyManagement(), zValidator('json', updateApiKeySchema), async (c) => {
  try {
    const db = c.get('db');
    const keyId = c.req.param('keyId');
    const updates = c.req.valid('json');
    
    await updateApiKey(db, keyId, updates);
    
    return c.json(createSuccessResponse({ keyId }, 'API key updated successfully'));
  } catch (error) {
    console.error('Error updating API key:', error);
    return c.json(createErrorResponse(
      'Failed to update API key',
      error instanceof Error ? error.message : 'Unknown error',
      'API_KEY_UPDATE_ERROR',
      c.req.url
    ), 500);
  }
});

// Deactivate API key (key management permission required)
app.delete('/api/v1/auth/keys/:keyId', keyManagement(), async (c) => {
  try {
    const db = c.get('db');
    const keyId = c.req.param('keyId');
    
    await deactivateApiKey(db, keyId);
    
    return c.json(createSuccessResponse({ keyId }, 'API key deactivated successfully'));
  } catch (error) {
    console.error('Error deactivating API key:', error);
    return c.json(createErrorResponse(
      'Failed to deactivate API key',
      error instanceof Error ? error.message : 'Unknown error',
      'API_KEY_DEACTIVATE_ERROR',
      c.req.url
    ), 500);
  }
});

// Get rate limit status for current key
app.get('/api/v1/auth/rate-limit', readOnly(), async (c) => {
  try {
    const db = c.get('db');
    const auth: AuthContext = c.get('auth');
    
    const status = await getRateLimitStatus(db, auth.keyId, auth.rateLimit);
    
    return c.json(createSuccessResponse(status, 'Rate limit status retrieved successfully'));
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return c.json(createErrorResponse(
      'Failed to get rate limit status',
      error instanceof Error ? error.message : 'Unknown error',
      'RATE_LIMIT_STATUS_ERROR',
      c.req.url
    ), 500);
  }
});

// Security events query validation schema
// SECURITY: Strict allowlist validation to prevent SQL injection attacks
const securityEventsQuerySchema = z.object({
  // Limit pagination parameters to safe ranges
  limit: z.string()
    .transform(val => {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed < 1) return 100;
      return Math.min(parsed, 1000); // Cap at 1000 for performance
    })
    .optional(),
  offset: z.string()
    .transform(val => {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed < 0) return 0;
      return Math.max(parsed, 0); // Ensure non-negative
    })
    .optional(),
  // SECURITY: Strict allowlist of valid event types prevents injection
  event_type: z.enum(VALID_SECURITY_EVENT_TYPES).optional(),
});

// Get security events (admin only)
app.get('/api/v1/auth/security-events', adminOnly(), zValidator('query', securityEventsQuerySchema), async (c) => {
  try {
    const db = c.get('db');
    const params = c.req.valid('query');
    const limit = params.limit || 100;
    const offset = params.offset || 0;
    const eventType = params.event_type;
    
    // SECURITY FIX: Build secure query with validated parameters only
    let query = db.select().from(securityEvents);
    
    // SECURITY: Only apply eventType filter with validated enum value
    // This prevents SQL injection by ensuring only allowlisted values are used
    if (eventType) {
      // eventType has been validated by Zod enum - safe to use in query
      query = query.where(eq(securityEvents.eventType, eventType));
    }
    
    const events = await query
      .orderBy(desc(securityEvents.timestamp))
      .limit(limit)
      .offset(offset);
    
    const formattedEvents: SecurityEventInfo[] = events.map(event => ({
      eventType: event.eventType,
      keyId: event.keyId || undefined,
      ipAddress: event.ipAddress || undefined,
      endpoint: event.endpoint || undefined,
      timestamp: event.timestamp,
      details: event.details ? JSON.parse(event.details) : undefined
    }));
    
    return c.json(createSuccessResponse(formattedEvents, 'Security events retrieved successfully'));
  } catch (error) {
    console.error('Error getting security events:', error);
    
    // Log security event access error (without exposing sensitive details)
    try {
      const auth: AuthContext = c.get('auth');
      await db.insert(securityEvents).values({
        eventType: 'security_events_error',
        keyId: auth.keyId,
        ipAddress: SecurityUtils.getClientIp(c),
        endpoint: `${c.req.method} ${c.req.path}`,
        details: JSON.stringify({ 
          error: 'database_error',
          timestamp: new Date().toISOString()
        })
      });
    } catch (logError) {
      console.error('Failed to log security events error:', logError);
    }
    
    return c.json(createErrorResponse(
      'Failed to get security events',
      'An error occurred while retrieving security events',
      'SECURITY_EVENTS_ERROR',
      c.req.url
    ), 500);
  }
});

// Data endpoints

// Submit result (requires write permission)
app.post('/api/v1/results', writeAccess(), zValidator('json', resultSubmissionSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const submission = c.req.valid('json');
    
    // Generate client ID if not provided
    const clientId = submission.client_id || generateClientId(submission);
    
    await processSubmission(db, submission, clientId);
    
    return c.json(createSuccessResponse({ id: submission.run_id }, 'Result submitted successfully'));
  } catch (error) {
    console.error('Error submitting result:', error);
    return c.json(createErrorResponse(
      'Failed to submit result',
      error instanceof Error ? error.message : 'Unknown error',
      'SUBMISSION_ERROR',
      c.req.url
    ), 500);
  }
});

// Batch submission endpoint (requires write permission)
app.post('/api/v1/results/batch', writeAccess(), zValidator('json', batchSubmissionSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const batchRequest = c.req.valid('json');
    
    const processed: number[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    
    for (let i = 0; i < batchRequest.results.length; i++) {
      try {
        const submission = batchRequest.results[i];
        const clientId = submission.client_id || generateClientId(submission);
        
        await processSubmission(db, submission, clientId);
        processed.push(i);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const response: BatchSubmissionResponse = {
      status: errors.length === 0 ? 'success' : (processed.length > 0 ? 'partial' : 'error'),
      processed: processed.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      batch_id: batchRequest.metadata?.batch_id || `batch_${Date.now()}`,
    };
    
    const statusCode = response.status === 'success' ? 200 : (response.status === 'partial' ? 207 : 400);
    return c.json(createSuccessResponse(response, 'Batch processing completed'), statusCode);
  } catch (error) {
    console.error('Error processing batch submission:', error);
    return c.json(createErrorResponse(
      'Failed to process batch submission',
      error instanceof Error ? error.message : 'Unknown error',
      'BATCH_SUBMISSION_ERROR',
      c.req.url
    ), 500);
  }
});

// Query results (requires read permission)
app.get('/api/v1/results', readOnly(), zValidator('query', queryParamsSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const params = c.req.valid('query');
    
    // Apply filters
    const conditions = [];
    if (params.tool) conditions.push(eq(results.tool, params.tool));
    if (params.scenario) conditions.push(eq(results.scenario, params.scenario));
    if (params.success !== undefined) conditions.push(eq(results.success, params.success));
    
    // Build and execute query with pagination
    const query = db.select().from(results);
    const resultList = conditions.length > 0
      ? await query
          .where(and(...conditions))
          .orderBy(desc(results.timestamp))
          .limit(params.limit || 100)
          .offset(params.offset || 0)
      : await query
          .orderBy(desc(results.timestamp))
          .limit(params.limit || 100)
          .offset(params.offset || 0);
    
    return c.json(createSuccessResponse(resultList, 'Results retrieved successfully'));
  } catch (error) {
    console.error('Error querying results:', error);
    return c.json(createErrorResponse(
      'Failed to query results',
      error instanceof Error ? error.message : 'Unknown error',
      'QUERY_ERROR',
      c.req.url
    ), 500);
  }
});

// Aggregate statistics endpoint (requires read permission)
app.get('/api/v1/stats/aggregate', readOnly(), zValidator('query', aggregateStatsSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const params = c.req.valid('query');
    
    const { start, end } = params.start_date && params.end_date 
      ? { start: new Date(params.start_date), end: new Date(params.end_date) }
      : getPeriodDates(params.period);
    
    // Base conditions
    const conditions = [
      gte(results.timestamp, start.toISOString()),
      lte(results.timestamp, end.toISOString())
    ];
    
    if (params.tool) conditions.push(eq(results.tool, params.tool));
    if (params.scenario) conditions.push(eq(results.scenario, params.scenario));
    
    // Get overall stats
    const overallStats = await db.select({
      totalRuns: count(),
      successfulRuns: sql<number>`SUM(CASE WHEN ${results.success} = 1 THEN 1 ELSE 0 END)`,
      avgDuration: sql<number>`AVG(${results.duration})`,
      uniqueTools: sql<number>`COUNT(DISTINCT ${results.tool})`,
      uniqueScenarios: sql<number>`COUNT(DISTINCT ${results.scenario})`
    })
    .from(results)
    .where(and(...conditions));
    
    const stats = overallStats[0];
    const overallSuccessRate = stats.totalRuns > 0 ? stats.successfulRuns / stats.totalRuns : 0;
    
    // Get daily trends (last 30 days or period length)
    const trendsQuery = await db.select({
      date: sql<string>`DATE(${results.timestamp})`,
      runs: count(),
      successfulRuns: sql<number>`SUM(CASE WHEN ${results.success} = 1 THEN 1 ELSE 0 END)`,
      avgDuration: sql<number>`AVG(${results.duration})`
    })
    .from(results)
    .where(and(...conditions))
    .groupBy(sql`DATE(${results.timestamp})`)
    .orderBy(sql`DATE(${results.timestamp})`);
    
    const trends = trendsQuery.map(trend => ({
      date: trend.date,
      runs: trend.runs,
      success_rate: trend.runs > 0 ? trend.successfulRuns / trend.runs : 0,
      avg_duration: trend.avgDuration || 0
    }));
    
    // Get top tools
    const topToolsQuery = await db.select({
      tool: results.tool,
      runs: count(),
      successfulRuns: sql<number>`SUM(CASE WHEN ${results.success} = 1 THEN 1 ELSE 0 END)`
    })
    .from(results)
    .where(and(...conditions))
    .groupBy(results.tool)
    .orderBy(desc(count()))
    .limit(10);
    
    const topTools = topToolsQuery.map(tool => ({
      tool: tool.tool,
      runs: tool.runs,
      success_rate: tool.runs > 0 ? tool.successfulRuns / tool.runs : 0
    }));
    
    // Get top scenarios
    const topScenariosQuery = await db.select({
      scenario: results.scenario,
      runs: count(),
      successfulRuns: sql<number>`SUM(CASE WHEN ${results.success} = 1 THEN 1 ELSE 0 END)`
    })
    .from(results)
    .where(and(...conditions))
    .groupBy(results.scenario)
    .orderBy(desc(count()))
    .limit(10);
    
    const topScenarios = topScenariosQuery.map(scenario => ({
      scenario: scenario.scenario,
      runs: scenario.runs,
      success_rate: scenario.runs > 0 ? scenario.successfulRuns / scenario.runs : 0
    }));
    
    const response: AggregateStatsResponse = {
      period: params.period,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      total_runs: stats.totalRuns,
      unique_tools: stats.uniqueTools,
      unique_scenarios: stats.uniqueScenarios,
      overall_success_rate: overallSuccessRate,
      trends,
      top_tools: topTools,
      top_scenarios: topScenarios
    };
    
    return c.json(createSuccessResponse(response, 'Aggregate statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting aggregate stats:', error);
    return c.json(createErrorResponse(
      'Failed to get aggregate statistics',
      error instanceof Error ? error.message : 'Unknown error',
      'AGGREGATE_STATS_ERROR',
      c.req.url
    ), 500);
  }
});

// Tool comparison endpoint (requires read permission)
app.post('/api/v1/compare/tools', readOnly(), zValidator('json', toolComparisonSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const { tools, scenario, metric } = c.req.valid('json');
    
    const toolsData = [];
    const comparisonMatrix: Record<string, Record<string, number>> = {};
    
    for (const tool of tools) {
      // Get tool stats
      const conditions = [eq(toolStats.tool, tool)];
      if (scenario) {
        conditions.push(eq(toolStats.scenario, scenario));
      }
      
      const stats = await db.select().from(toolStats).where(and(...conditions));
      
      // Calculate overall stats
      const totalRuns = stats.reduce((sum, s) => sum + s.totalRuns, 0);
      const successfulRuns = stats.reduce((sum, s) => sum + s.successfulRuns, 0);
      const successRate = totalRuns > 0 ? successfulRuns / totalRuns : 0;
      const avgDuration = stats.reduce((sum, s) => sum + (s.avgDuration * s.totalRuns), 0) / totalRuns;
      
      // Get scenarios
      const scenarios: Record<string, any> = {};
      for (const stat of stats) {
        if (stat.scenario) {
          scenarios[stat.scenario] = {
            total_runs: stat.totalRuns,
            success_rate: stat.successRate,
            avg_duration: stat.avgDuration,
          };
        }
      }
      
      // Get top friction points
      const frictionPoints = await db.select()
        .from(frictionPointStats)
        .where(eq(frictionPointStats.tool, tool))
        .orderBy(desc(frictionPointStats.count))
        .limit(5);
      
      const toolData = {
        tool,
        total_runs: totalRuns,
        success_rate: successRate,
        avg_duration: avgDuration || 0,
        common_friction_points: frictionPoints.map(fp => fp.frictionPoint),
        scenarios,
      };
      
      toolsData.push(toolData);
      
      // Initialize comparison matrix row
      comparisonMatrix[tool] = {};
    }
    
    // Build comparison matrix
    const selectedMetric = metric || 'success_rate';
    for (const tool1 of tools) {
      for (const tool2 of tools) {
        if (tool1 === tool2) {
          comparisonMatrix[tool1][tool2] = 1; // Self comparison
        } else {
          const tool1Data = toolsData.find(t => t.tool === tool1);
          const tool2Data = toolsData.find(t => t.tool === tool2);
          
          if (tool1Data && tool2Data) {
            let ratio = 0;
            switch (selectedMetric) {
              case 'success_rate':
                ratio = tool2Data.success_rate > 0 ? tool1Data.success_rate / tool2Data.success_rate : 0;
                break;
              case 'avg_duration':
                ratio = tool1Data.avg_duration > 0 ? tool2Data.avg_duration / tool1Data.avg_duration : 0;
                break;
              case 'total_runs':
                ratio = tool2Data.total_runs > 0 ? tool1Data.total_runs / tool2Data.total_runs : 0;
                break;
            }
            comparisonMatrix[tool1][tool2] = Math.round(ratio * 100) / 100;
          }
        }
      }
    }
    
    const response: ToolComparisonResponse = {
      tools: toolsData,
      comparison_matrix: comparisonMatrix,
    };
    
    return c.json(createSuccessResponse(response, 'Tool comparison completed successfully'));
  } catch (error) {
    console.error('Error comparing tools:', error);
    return c.json(createErrorResponse(
      'Failed to compare tools',
      error instanceof Error ? error.message : 'Unknown error',
      'TOOL_COMPARISON_ERROR',
      c.req.url
    ), 500);
  }
});

// Scenario difficulty ranking endpoint (requires read permission)
app.get('/api/v1/scenarios/difficulty', readOnly(), async (c) => {
  try {
    const db = createDb(c.env.DB);
    
    // Get scenario stats
    const scenarioStats = await db.select({
      scenario: results.scenario,
      totalRuns: count(),
      successfulRuns: sql<number>`SUM(CASE WHEN ${results.success} = 1 THEN 1 ELSE 0 END)`,
      avgDuration: sql<number>`AVG(${results.duration})`,
      uniqueTools: sql<number>`COUNT(DISTINCT ${results.tool})`
    })
    .from(results)
    .groupBy(results.scenario)
    .having(sql`COUNT(*) >= 5`); // Minimum 5 runs for statistical significance
    
    // Get friction point counts per scenario
    const frictionStats = await db.select({
      scenario: results.scenario,
      frictionCount: sql<number>`AVG(json_array_length(${results.frictionPoints}))`
    })
    .from(results)
    .groupBy(results.scenario);
    
    const frictionMap = new Map(frictionStats.map(f => [f.scenario, f.frictionCount || 0]));
    
    // Calculate difficulty scores
    const scenarios: ScenarioDifficultyEntry[] = scenarioStats.map(stat => {
      const successRate = stat.totalRuns > 0 ? stat.successfulRuns / stat.totalRuns : 0;
      const avgDuration = stat.avgDuration || 0;
      const frictionPointCount = frictionMap.get(stat.scenario) || 0;
      
      const difficultyScore = calculateDifficultyScore(
        successRate,
        avgDuration,
        frictionPointCount,
        stat.totalRuns
      );
      
      return {
        scenario: stat.scenario,
        difficulty_score: Math.round(difficultyScore * 100) / 100,
        total_runs: stat.totalRuns,
        avg_success_rate: Math.round(successRate * 10000) / 100, // Percentage with 2 decimals
        avg_duration: Math.round(avgDuration * 100) / 100,
        friction_point_count: Math.round(frictionPointCount * 100) / 100,
        tools_tested: stat.uniqueTools,
      };
    }).sort((a, b) => b.difficulty_score - a.difficulty_score);
    
    const response: ScenarioDifficultyResponse = {
      scenarios,
      methodology: {
        factors: [
          'Success rate (40% weight)',
          'Average duration (30% weight)', 
          'Friction point frequency (20% weight)',
          'Test volume reliability (10% weight)'
        ],
        description: 'Difficulty score ranges from 0-100, where higher scores indicate more challenging scenarios. Requires minimum 5 test runs for inclusion.'
      }
    };
    
    return c.json(createSuccessResponse(response, 'Scenario difficulty ranking retrieved successfully'));
  } catch (error) {
    console.error('Error getting scenario difficulty:', error);
    return c.json(createErrorResponse(
      'Failed to get scenario difficulty ranking',
      error instanceof Error ? error.message : 'Unknown error',
      'DIFFICULTY_RANKING_ERROR',
      c.req.url
    ), 500);
  }
});

// Data export endpoint (requires read permission)
app.post('/api/v1/export', readOnly(), zValidator('json', exportSchema), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const { format, filters, fields } = c.req.valid('json');
    
    // Security logging for export attempts
    console.log(`[SECURITY] CSV export attempted: format=${format}, user_ip=${c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'}, timestamp=${new Date().toISOString()}`);
    
    // Input validation for security
    if (fields && fields.length > 100) {
      console.log(`[SECURITY] Potential data exfiltration attempt: excessive field count (${fields.length})`);
      return c.json(createErrorResponse(
        'Invalid export request',
        'Too many fields specified for export',
        'INVALID_FIELD_COUNT'
      ), 400);
    }
    
    // Build query conditions
    const conditions = [];
    
    if (filters) {
      if (filters.tool) conditions.push(eq(results.tool, filters.tool));
      if (filters.scenario) conditions.push(eq(results.scenario, filters.scenario));
      if (filters.success !== undefined) conditions.push(eq(results.success, filters.success));
      if (filters.start_date) conditions.push(gte(results.timestamp, filters.start_date));
      if (filters.end_date) conditions.push(lte(results.timestamp, filters.end_date));
    }
    
    // Build and execute query
    const exportQuery = db.select().from(results);
    const exportData = conditions.length > 0 
      ? await exportQuery.where(and(...conditions)).orderBy(desc(results.timestamp)).limit(10000)
      : await exportQuery.orderBy(desc(results.timestamp)).limit(10000); // Limit for performance
    
    if (exportData.length === 0) {
      return c.json(createErrorResponse(
        'No data found for export',
        'No records match the specified filters',
        'NO_DATA_FOUND'
      ), 404);
    }
    
    // Filter fields if specified
    let processedData = exportData;
    if (fields && fields.length > 0) {
      processedData = exportData.map(record => {
        const filtered: any = {};
        fields.forEach(field => {
          if (field in record) {
            filtered[field] = (record as any)[field];
          }
        });
        return filtered;
      });
    }
    
    let exportContent: string;
    let contentType: string;
    let filename: string;
    
    if (format === 'csv') {
      // Convert to CSV with comprehensive security measures
      if (processedData.length === 0) {
        exportContent = '';
      } else {
        // Secure CSV escaping function to prevent injection attacks
        const secureCsvEscape = (value: any): string => {
          if (value === null || value === undefined) {
            return '';
          }
          
          let stringValue = String(value);
          
          // Prevent CSV formula injection by escaping dangerous prefixes
          const dangerousPrefixes = ['=', '+', '-', '@', '|'];
          if (dangerousPrefixes.some(prefix => stringValue.startsWith(prefix))) {
            // Prefix with single quote to neutralize formula injection
            stringValue = "'" + stringValue;
          }
          
          // Handle CSV special characters and always quote strings for safety
          if (typeof value === 'string' || 
              stringValue.includes(',') || 
              stringValue.includes('"') || 
              stringValue.includes('\n') || 
              stringValue.includes('\r')) {
            // Escape internal quotes and wrap in quotes
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          
          // For non-string values, ensure they're safe
          return stringValue;
        };
        
        const headers = Object.keys(processedData[0]);
        
        // Validate and sanitize headers to prevent injection
        const safeHeaders = headers.map(header => {
          const sanitizedHeader = String(header).replace(/[^\w\s-_]/g, '_');
          return secureCsvEscape(sanitizedHeader);
        });
        
        const csvRows = [
          safeHeaders.join(','),
          ...processedData.map(record => 
            headers.map(header => {
              const value = (record as any)[header];
              return secureCsvEscape(value);
            }).join(',')
          )
        ];
        exportContent = csvRows.join('\n');
      }
      
      // Set secure content type with additional security directives
      contentType = 'text/csv; charset=utf-8';
      filename = `agentprobe-export-${Date.now()}.csv`;
    } else {
      // JSON format
      exportContent = JSON.stringify(processedData, null, 2);
      contentType = 'application/json';
      filename = `agentprobe-export-${Date.now()}.json`;
    }
    
    // In a real implementation, you would upload this to cloud storage
    // and return a download URL. For now, we'll return the data directly.
    const response: ExportResponse = {
      status: 'success',
      download_url: `/api/v1/export/download/${filename}`, // Placeholder URL
      expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
    
    // Security logging for successful exports
    if (format === 'csv') {
      console.log(`[SECURITY] CSV export completed successfully: records=${processedData.length}, filename=${filename}`);
    }
    
    // Set security headers for CSV responses
    if (format === 'csv') {
      c.header('Content-Security-Policy', "default-src 'none'; script-src 'none'; object-src 'none';");
      c.header('X-Content-Type-Options', 'nosniff');
      c.header('X-Frame-Options', 'DENY');
      c.header('X-Download-Options', 'noopen');
    }
    
    // Return the content directly for now
    return c.json(createSuccessResponse({
      ...response,
      content: exportContent,
      content_type: contentType,
      record_count: processedData.length
    }, 'Export completed successfully'));
    
  } catch (error) {
    console.error('Error exporting data:', error);
    
    // Security logging for export failures
    console.log(`[SECURITY] CSV export failed: error=${error instanceof Error ? error.message : 'Unknown error'}, user_ip=${c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'}, timestamp=${new Date().toISOString()}`);
    
    return c.json(createErrorResponse(
      'Failed to export data',
      error instanceof Error ? error.message : 'Unknown error',
      'EXPORT_ERROR',
      c.req.url
    ), 500);
  }
});

// Tool statistics (requires read permission)
app.get('/api/v1/stats/tool/:tool', readOnly(), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const tool = c.req.param('tool');
    
    // Get tool stats
    const stats = await db.select()
      .from(toolStats)
      .where(eq(toolStats.tool, tool));
    
    if (stats.length === 0) {
      return c.json(createErrorResponse(
        `No results found for tool: ${tool}`,
        'The specified tool has no recorded test results',
        'TOOL_NOT_FOUND',
        c.req.url
      ), 404);
    }
    
    // Calculate overall stats
    const totalRuns = stats.reduce((sum, s) => sum + s.totalRuns, 0);
    const successfulRuns = stats.reduce((sum, s) => sum + s.successfulRuns, 0);
    const successRate = totalRuns > 0 ? successfulRuns / totalRuns : 0;
    const avgDuration = stats.reduce((sum, s) => sum + (s.avgDuration * s.totalRuns), 0) / totalRuns;
    
    // Get scenarios
    const scenarios: Record<string, any> = {};
    for (const stat of stats) {
      if (stat.scenario) {
        scenarios[stat.scenario] = {
          total_runs: stat.totalRuns,
          success_rate: stat.successRate,
          avg_duration: stat.avgDuration,
        };
      }
    }
    
    // Get top friction points
    const frictionPoints = await db.select()
      .from(frictionPointStats)
      .where(eq(frictionPointStats.tool, tool))
      .orderBy(desc(frictionPointStats.count))
      .limit(5);
    
    const response: ToolStatsResponse = {
      tool,
      total_runs: totalRuns,
      success_rate: successRate,
      avg_duration: avgDuration || 0,
      avg_cost: 0, // Cost data not currently collected in database schema
      common_friction_points: frictionPoints.map(fp => fp.frictionPoint),
      scenarios,
    };
    
    return c.json(createSuccessResponse(response, 'Tool statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting tool stats:', error);
    return c.json(createErrorResponse(
      'Failed to get tool stats',
      error instanceof Error ? error.message : 'Unknown error',
      'TOOL_STATS_ERROR',
      c.req.url
    ), 500);
  }
});

// Leaderboard (requires read permission)
app.get('/api/v1/leaderboard', readOnly(), async (c) => {
  try {
    const db = createDb(c.env.DB);
    
    // Get aggregated stats by tool
    const statsQuery = await db.select({
      tool: toolStats.tool,
      totalRuns: sql<number>`SUM(${toolStats.totalRuns})`,
      successfulRuns: sql<number>`SUM(${toolStats.successfulRuns})`,
    })
      .from(toolStats)
      .groupBy(toolStats.tool)
      .having(sql`SUM(${toolStats.totalRuns}) >= 3`); // Minimum 3 runs for leaderboard inclusion
    
    const leaderboard: LeaderboardEntry[] = statsQuery
      .map(stat => ({
        tool: stat.tool,
        total_runs: stat.totalRuns,
        success_rate: stat.totalRuns > 0 ? stat.successfulRuns / stat.totalRuns : 0,
      }))
      .filter(entry => entry.total_runs > 0)
      .sort((a, b) => {
        // Sort by success rate first, then by total runs as tiebreaker
        if (Math.abs(b.success_rate - a.success_rate) < 0.01) {
          return b.total_runs - a.total_runs;
        }
        return b.success_rate - a.success_rate;
      });
    
    return c.json(createSuccessResponse(leaderboard, 'Leaderboard retrieved successfully'));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return c.json(createErrorResponse(
      'Failed to get leaderboard',
      error instanceof Error ? error.message : 'Unknown error',
      'LEADERBOARD_ERROR',
      c.req.url
    ), 500);
  }
});

// Scenario statistics (requires read permission)
app.get('/api/v1/stats/scenario/:tool/:scenario', readOnly(), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const tool = c.req.param('tool');
    const scenario = c.req.param('scenario');
    
    // Get recent results for this scenario
    const recentResults = await db.select()
      .from(results)
      .where(and(
        eq(results.tool, tool),
        eq(results.scenario, scenario)
      ))
      .orderBy(desc(results.timestamp))
      .limit(10);
    
    if (recentResults.length === 0) {
      return c.json(createErrorResponse(
        `No results found for ${tool}/${scenario}`,
        'The specified tool and scenario combination has no recorded test results',
        'SCENARIO_NOT_FOUND',
        c.req.url
      ), 404);
    }
    
    // Get tool stats for this scenario
    const stats = await db.select()
      .from(toolStats)
      .where(and(
        eq(toolStats.tool, tool),
        eq(toolStats.scenario, scenario)
      ))
      .limit(1);
    
    // Analyze common error patterns
    const errorResults = recentResults.filter(r => !r.success && r.errorMessage);
    const errorPatterns: Record<string, number> = {};
    
    errorResults.forEach(result => {
      if (result.errorMessage) {
        // Simple error categorization - in production you'd want more sophisticated pattern matching
        const errorKey = result.errorMessage.split(':')[0].trim(); // Get first part of error message
        errorPatterns[errorKey] = (errorPatterns[errorKey] || 0) + 1;
      }
    });
    
    const response = {
      tool,
      scenario,
      total_runs: stats[0]?.totalRuns || 0,
      success_rate: stats[0]?.successRate || 0,
      avg_duration: stats[0]?.avgDuration || 0,
      recent_results: recentResults.slice(0, 10),
      common_errors: errorPatterns,
      last_updated: stats[0]?.lastUpdated || null,
    };
    
    return c.json(createSuccessResponse(response, 'Scenario statistics retrieved successfully'));
  } catch (error) {
    console.error('Error getting scenario stats:', error);
    return c.json(createErrorResponse(
      'Failed to get scenario stats',
      error instanceof Error ? error.message : 'Unknown error',
      'SCENARIO_STATS_ERROR',
      c.req.url
    ), 500);
  }
});

// Periodic cleanup task (called by Cloudflare Workers cron trigger)
app.get('/api/v1/internal/cleanup', async (c) => {
  // This endpoint should be protected by Cloudflare Workers auth or called only by cron
  try {
    const db = c.get('db');
    
    // Cleanup old rate limit records
    await cleanupRateLimits(db);
    
    // Cleanup old IP rate limits
    SecurityUtils.cleanupIpRateLimits();
    
    return c.json({ status: 'success', message: 'Cleanup completed' });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return c.json({ status: 'error', message: 'Cleanup failed' }, 500);
  }
});

export default app;