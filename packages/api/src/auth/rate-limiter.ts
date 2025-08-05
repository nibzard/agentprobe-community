/**
 * Rate limiting implementation for Cloudflare Workers
 * Uses sliding window algorithm with database persistence
 */

import { eq, and, sql } from 'drizzle-orm';
import { rateLimits } from '../db/schema';
import type { DrizzleD1 } from '../db';
import type { RateLimitInfo } from '../types';

// Rate limit windows in milliseconds
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

/**
 * Check and update rate limit for an API key
 */
export async function checkRateLimit(
  db: DrizzleD1,
  keyId: string,
  limit: number
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  const windowStartStr = windowStart.toISOString();
  const resetTime = new Date(now.getTime() + RATE_LIMIT_WINDOW);

  try {
    // Get current rate limit data
    const existing = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.keyId, keyId),
          sql`${rateLimits.windowStart} > ${windowStartStr}`
        )
      )
      .limit(1);

    let currentCount = 0;
    let shouldUpdate = false;

    if (existing.length > 0) {
      const record = existing[0];
      const recordWindowStart = new Date(record.windowStart);
      
      // Check if we're still within the same window
      if (recordWindowStart.getTime() > windowStart.getTime()) {
        currentCount = record.requestCount;
        shouldUpdate = true;
      }
    }

    // Check if request would exceed limit
    if (currentCount >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - now.getTime()) / 1000)
      };
    }

    // Update or create rate limit record
    const newCount = currentCount + 1;
    
    if (shouldUpdate && existing.length > 0) {
      await db
        .update(rateLimits)
        .set({
          requestCount: newCount,
          lastRequest: now.toISOString()
        })
        .where(eq(rateLimits.id, existing[0].id));
    } else {
      // Create new window record
      await db.insert(rateLimits).values({
        keyId,
        windowStart: now.toISOString(),
        requestCount: newCount,
        lastRequest: now.toISOString()
      });
    }

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - newCount),
      resetTime
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open in case of database issues, but log the event
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetTime
    };
  }
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  db: DrizzleD1,
  keyId: string,
  limit: number
): Promise<RateLimitInfo> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  const windowStartStr = windowStart.toISOString();
  const resetTime = new Date(now.getTime() + RATE_LIMIT_WINDOW);

  try {
    const existing = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.keyId, keyId),
          sql`${rateLimits.windowStart} > ${windowStartStr}`
        )
      )
      .limit(1);

    let currentCount = 0;
    if (existing.length > 0) {
      const record = existing[0];
      const recordWindowStart = new Date(record.windowStart);
      
      if (recordWindowStart.getTime() > windowStart.getTime()) {
        currentCount = record.requestCount;
      }
    }

    return {
      limit,
      remaining: Math.max(0, limit - currentCount),
      reset: resetTime.toISOString(),
      window: `${RATE_LIMIT_WINDOW / 1000}s`
    };
  } catch (error) {
    console.error('Rate limit status check failed:', error);
    return {
      limit,
      remaining: limit,
      reset: resetTime.toISOString(),
      window: `${RATE_LIMIT_WINDOW / 1000}s`
    };
  }
}

/**
 * Clean up old rate limit records
 * Should be called periodically to prevent database bloat
 */
export async function cleanupRateLimits(db: DrizzleD1): Promise<void> {
  const cutoff = new Date(Date.now() - CLEANUP_INTERVAL);
  const cutoffStr = cutoff.toISOString();

  try {
    await db
      .delete(rateLimits)
      .where(sql`${rateLimits.windowStart} < ${cutoffStr}`);
  } catch (error) {
    console.error('Rate limit cleanup failed:', error);
  }
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export async function resetRateLimit(
  db: DrizzleD1,
  keyId: string
): Promise<void> {
  try {
    await db
      .delete(rateLimits)
      .where(eq(rateLimits.keyId, keyId));
  } catch (error) {
    console.error('Rate limit reset failed:', error);
    throw new Error('Failed to reset rate limit');
  }
}

/**
 * Get rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString()
  };

  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}