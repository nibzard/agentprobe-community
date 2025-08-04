/**
 * Authentication middleware for Hono framework
 * Handles API key validation, rate limiting, and security logging
 */

import { Context, Next } from 'hono';
import { eq, and } from 'drizzle-orm';
import { apiKeys, securityEvents } from '../db/schema';
import type { DrizzleD1 } from '../db';
import type { AuthContext } from '../types';
import { verifyApiKey, extractKeyId, extractSecret, isValidApiKeyFormat } from './crypto';
import { checkRateLimit, getRateLimitHeaders } from './rate-limiter';

// Permission constants
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
  MANAGE_KEYS: 'manage_keys'
} as const;

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Extract API key from request headers
 */
function extractApiKeyFromRequest(c: Context): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = c.req.header('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Get client information for logging
 */
function getClientInfo(c: Context) {
  return {
    ipAddress: c.req.header('CF-Connecting-IP') || 
               c.req.header('X-Forwarded-For') || 
               c.req.header('X-Real-IP') || 
               'unknown',
    userAgent: c.req.header('User-Agent') || 'unknown',
    endpoint: `${c.req.method} ${c.req.path}`
  };
}

/**
 * Log security event
 */
async function logSecurityEvent(
  db: DrizzleD1,
  eventType: string,
  keyId: string | null,
  clientInfo: ReturnType<typeof getClientInfo>,
  details?: any
): Promise<void> {
  try {
    await db.insert(securityEvents).values({
      eventType,
      keyId,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      endpoint: clientInfo.endpoint,
      details: details ? JSON.stringify(details) : null
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Create error response with security headers
 */
function createAuthErrorResponse(
  c: Context,
  status: number,
  error: string,
  message?: string,
  code?: string
) {
  const response = c.json({
    status: 'error',
    error,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: c.req.url
  }, status);

  // Add security headers
  response.headers.set('WWW-Authenticate', 'Bearer realm="AgentProbe API"');
  
  return response;
}

/**
 * Authentication middleware factory
 */
export function authMiddleware(requiredPermissions: Permission[] = []) {
  return async (c: Context, next: Next) => {
    const db: DrizzleD1 = c.get('db') || (() => {
      throw new Error('Database not available in context');
    })();

    const clientInfo = getClientInfo(c);
    const apiKey = extractApiKeyFromRequest(c);

    // Check if API key is provided
    if (!apiKey) {
      await logSecurityEvent(db, 'auth_missing', null, clientInfo);
      return createAuthErrorResponse(
        c,
        401,
        'Authentication required',
        'API key is required. Please provide a valid API key in the Authorization header or X-API-Key header.',
        'AUTH_MISSING'
      );
    }

    // Validate API key format
    if (!isValidApiKeyFormat(apiKey)) {
      await logSecurityEvent(db, 'auth_invalid_format', null, clientInfo, { apiKey: apiKey.substring(0, 10) + '...' });
      return createAuthErrorResponse(
        c,
        401,
        'Invalid API key format',
        'The provided API key format is invalid.',
        'AUTH_INVALID_FORMAT'
      );
    }

    const keyId = extractKeyId(apiKey);
    const secret = extractSecret(apiKey);

    if (!keyId || !secret) {
      await logSecurityEvent(db, 'auth_invalid_format', keyId, clientInfo);
      return createAuthErrorResponse(
        c,
        401,
        'Invalid API key format',
        'The provided API key format is invalid.',
        'AUTH_INVALID_FORMAT'
      );
    }

    try {
      // Look up API key in database
      const keyRecord = await db
        .select()
        .from(apiKeys)
        .where(eq(apiKeys.keyId, keyId))
        .limit(1);

      if (keyRecord.length === 0) {
        await logSecurityEvent(db, 'auth_key_not_found', keyId, clientInfo);
        return createAuthErrorResponse(
          c,
          401,
          'Invalid API key',
          'The provided API key is not valid.',
          'AUTH_INVALID'
        );
      }

      const keyData = keyRecord[0];

      // Check if key is active
      if (!keyData.isActive) {
        await logSecurityEvent(db, 'auth_key_inactive', keyId, clientInfo);
        return createAuthErrorResponse(
          c,
          401,
          'API key inactive',
          'The provided API key has been deactivated.',
          'AUTH_INACTIVE'
        );
      }

      // Check if key has expired
      if (keyData.expiresAt) {
        const expirationDate = new Date(keyData.expiresAt);
        if (expirationDate < new Date()) {
          await logSecurityEvent(db, 'auth_key_expired', keyId, clientInfo);
          return createAuthErrorResponse(
            c,
            401,
            'API key expired',
            'The provided API key has expired.',
            'AUTH_EXPIRED'
          );
        }
      }

      // Verify the secret
      const isValidSecret = await verifyApiKey(secret, keyData.hashedKey);
      if (!isValidSecret) {
        await logSecurityEvent(db, 'auth_invalid_secret', keyId, clientInfo);
        return createAuthErrorResponse(
          c,
          401,
          'Invalid API key',
          'The provided API key is not valid.',
          'AUTH_INVALID'
        );
      }

      // Check rate limit
      const rateLimitResult = await checkRateLimit(db, keyId, keyData.rateLimit);
      const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
      
      // Add rate limit headers to response
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        c.res.headers.set(key, value);
      });

      if (!rateLimitResult.allowed) {
        await logSecurityEvent(db, 'rate_limit_exceeded', keyId, clientInfo, {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining
        });
        
        const response = createAuthErrorResponse(
          c,
          429,
          'Rate limit exceeded',
          `API rate limit exceeded. Limit: ${rateLimitResult.limit} requests per hour.`,
          'RATE_LIMIT_EXCEEDED'
        );
        
        if (rateLimitResult.retryAfter) {
          response.headers.set('Retry-After', rateLimitResult.retryAfter.toString());
        }
        
        return response;
      }

      // Parse permissions
      const permissions: Permission[] = JSON.parse(keyData.permissions || '["read"]');

      // Check required permissions
      const hasRequiredPermissions = requiredPermissions.every(perm => 
        permissions.includes(perm) || permissions.includes(PERMISSIONS.ADMIN)
      );

      if (!hasRequiredPermissions) {
        await logSecurityEvent(db, 'auth_insufficient_permissions', keyId, clientInfo, {
          required: requiredPermissions,
          has: permissions
        });
        return createAuthErrorResponse(
          c,
          403,
          'Insufficient permissions',
          `This operation requires permissions: ${requiredPermissions.join(', ')}`,
          'AUTH_INSUFFICIENT_PERMISSIONS'
        );
      }

      // Update last used timestamp
      await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date().toISOString() })
        .where(eq(apiKeys.id, keyData.id));

      // Set auth context
      const authContext: AuthContext = {
        keyId: keyData.keyId,
        permissions,
        rateLimit: keyData.rateLimit,
        authenticated: true
      };

      c.set('auth', authContext);

      // Log successful authentication
      await logSecurityEvent(db, 'auth_success', keyId, clientInfo);

      await next();
    } catch (error) {
      console.error('Authentication error:', error);
      await logSecurityEvent(db, 'auth_error', keyId, clientInfo, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return createAuthErrorResponse(
        c,
        500,
        'Authentication error',
        'An error occurred during authentication.',
        'AUTH_ERROR'
      );
    }
  };
}

/**
 * Optional authentication middleware - allows both authenticated and anonymous access
 */
export function optionalAuthMiddleware() {
  return async (c: Context, next: Next) => {
    const apiKey = extractApiKeyFromRequest(c);
    
    if (!apiKey) {
      // No API key provided, continue as anonymous
      c.set('auth', { authenticated: false });
      await next();
      return;
    }

    // API key provided, validate it
    await authMiddleware()(c, next);
  };
}

/**
 * Middleware to require specific permissions
 */
export function requirePermissions(...permissions: Permission[]) {
  return authMiddleware(permissions);
}

/**
 * Admin-only middleware
 */
export function adminOnly() {
  return authMiddleware([PERMISSIONS.ADMIN]);
}

/**
 * Read-only middleware
 */
export function readOnly() {
  return authMiddleware([PERMISSIONS.READ]);
}

/**
 * Write access middleware
 */
export function writeAccess() {
  return authMiddleware([PERMISSIONS.WRITE]);
}

/**
 * Key management middleware
 */
export function keyManagement() {
  return authMiddleware([PERMISSIONS.MANAGE_KEYS]);
}