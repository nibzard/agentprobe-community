import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  runId: text('run_id').notNull().unique(),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
  tool: text('tool').notNull(),
  scenario: text('scenario').notNull(),
  
  // Client info
  agentprobeVersion: text('agentprobe_version').notNull(),
  os: text('os').notNull(),
  pythonVersion: text('python_version').notNull(),
  
  // Tool version info (new)
  toolVersion: text('tool_version'),
  versionDetectionMethod: text('version_detection_method'),
  versionDetectionSuccess: integer('version_detection_success', { mode: 'boolean' }).default(false),
  
  // Execution data
  duration: real('duration').notNull(),
  totalTurns: integer('total_turns').notNull(),
  success: integer('success', { mode: 'boolean' }).notNull(),
  errorMessage: text('error_message'),
  cost: real('cost').default(0.0),
  
  // Enhanced analysis data
  agentSummary: text('agent_summary'),
  axScore: text('ax_score'),
  frictionPoints: text('friction_points').notNull(), // JSON array
  helpUsageCount: integer('help_usage_count').notNull().default(0),
  recommendations: text('recommendations').notNull(), // JSON array
  fullOutput: text('full_output'), // Complete structured AgentProbe output JSON
  
  // Sanitized trace data (optional, large)
  traceData: blob('trace_data'),
  
  // Anonymous client identifier
  clientId: text('client_id').notNull(),
});

export const toolStats = sqliteTable('tool_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tool: text('tool').notNull(),
  scenario: text('scenario'),
  totalRuns: integer('total_runs').notNull().default(0),
  successfulRuns: integer('successful_runs').notNull().default(0),
  successRate: real('success_rate').notNull().default(0),
  avgDuration: real('avg_duration').notNull().default(0),
  avgCost: real('avg_cost').default(0.0),
  commonVersions: text('common_versions').default('[]'), // JSON array
  lastUpdated: text('last_updated').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const frictionPointStats = sqliteTable('friction_point_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tool: text('tool').notNull(),
  frictionPoint: text('friction_point').notNull(),
  count: integer('count').notNull().default(0),
  lastSeen: text('last_seen').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// API Keys table for authentication
export const apiKeys = sqliteTable('api_keys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keyId: text('key_id').notNull().unique(), // Public part of the key (ap_...)
  hashedKey: text('hashed_key').notNull(), // Hashed secret part
  name: text('name').notNull(), // Human-readable name for the key
  permissions: text('permissions').notNull().default('read'), // JSON array of permissions
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'), // Optional expiration
  rateLimit: integer('rate_limit').notNull().default(100), // Requests per hour
  createdBy: text('created_by'), // Optional: user who created the key
});

// Rate limiting table to track API usage
export const rateLimits = sqliteTable('rate_limits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keyId: text('key_id').notNull(),
  windowStart: text('window_start').notNull(), // Start of the current window
  requestCount: integer('request_count').notNull().default(0),
  lastRequest: text('last_request').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Security events table for audit logging
export const securityEvents = sqliteTable('security_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(), // 'auth_success', 'auth_failure', 'rate_limit', etc.
  keyId: text('key_id'), // Optional: associated API key
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  endpoint: text('endpoint'),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
  details: text('details'), // JSON string with additional details
});

export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type ToolStats = typeof toolStats.$inferSelect;
export type FrictionPointStats = typeof frictionPointStats.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type RateLimit = typeof rateLimits.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;