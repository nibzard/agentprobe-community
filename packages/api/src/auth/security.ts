/**
 * Security utilities and helper functions
 * Input validation, sanitization, and security headers
 */

import { Context } from 'hono';

/**
 * Input sanitization functions
 */
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS and injection attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');
    
    // Limit length to prevent DOS
    sanitized = sanitized.substring(0, 10000);
    
    // Remove or escape potentially dangerous characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  /**
   * Sanitize and validate email addresses
   */
  static sanitizeEmail(email: string): string | null {
    const sanitized = this.sanitizeString(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized) || sanitized.length > 254) {
      return null;
    }
    
    return sanitized;
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, min?: number, max?: number): number | null {
    const num = Number(input);
    
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }
    
    if (min !== undefined && num < min) {
      return null;
    }
    
    if (max !== undefined && num > max) {
      return null;
    }
    
    return num;
  }

  /**
   * Sanitize boolean input
   */
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') {
      return input;
    }
    
    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }
    
    return Boolean(input);
  }

  /**
   * Sanitize array input
   */
  static sanitizeArray<T>(
    input: any,
    sanitizer: (item: any) => T | null,
    maxLength: number = 100
  ): T[] {
    if (!Array.isArray(input)) {
      return [];
    }
    
    return input
      .slice(0, maxLength)
      .map(sanitizer)
      .filter((item): item is T => item !== null);
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJson(input: any, maxDepth: number = 5): any {
    if (maxDepth <= 0) {
      return null;
    }

    if (input === null || typeof input === 'undefined') {
      return null;
    }

    if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
      return typeof input === 'string' ? this.sanitizeString(input) : input;
    }

    if (Array.isArray(input)) {
      return input
        .slice(0, 100) // Limit array size
        .map(item => this.sanitizeJson(item, maxDepth - 1))
        .filter(item => item !== null);
    }

    if (typeof input === 'object') {
      const sanitized: any = {};
      let keyCount = 0;
      
      for (const [key, value] of Object.entries(input)) {
        if (keyCount >= 50) break; // Limit object keys
        
        const sanitizedKey = this.sanitizeString(key);
        const sanitizedValue = this.sanitizeJson(value, maxDepth - 1);
        
        if (sanitizedKey && sanitizedValue !== null) {
          sanitized[sanitizedKey] = sanitizedValue;
          keyCount++;
        }
      }
      
      return sanitized;
    }

    return null;
  }
}

/**
 * Security headers manager
 */
export class SecurityHeaders {
  /**
   * Add security headers to response
   */
  static addSecurityHeaders(c: Context): void {
    const headers = this.getSecurityHeaders();
    
    Object.entries(headers).forEach(([key, value]) => {
      c.res.headers.set(key, value);
    });
  }

  /**
   * Get standard security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      // Prevent clickjacking
      'X-Frame-Options': 'DENY',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Strict transport security (HTTPS only)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Content Security Policy
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline';",
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      
      // Remove server information
      'Server': 'AgentProbe-API'
    };
  }

  /**
   * Add CORS headers
   */
  static addCorsHeaders(c: Context, allowedOrigins: string[] = []): void {
    const origin = c.req.header('Origin');
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    const allowedHeaders = ['Content-Type', 'Authorization', 'X-API-Key'];

    // Check if origin is allowed
    if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
      c.res.headers.set('Access-Control-Allow-Origin', origin);
    }

    c.res.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
    c.res.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    c.res.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    c.res.headers.set('Access-Control-Allow-Credentials', 'false');
  }
}

/**
 * Input validation utilities
 */
export class Validator {
  /**
   * Validate API key format
   */
  static isValidApiKey(key: string): boolean {
    return /^ap_[a-f0-9]{32}_[a-f0-9]{64}$/.test(key);
  }

  /**
   * Validate UUID format
   */
  static isValidUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }

  /**
   * Validate timestamp format (ISO 8601)
   */
  static isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === timestamp;
  }

  /**
   * Validate tool/scenario name
   */
  static isValidName(name: string): boolean {
    // Allow alphanumeric, hyphens, underscores, dots
    return /^[a-zA-Z0-9\-_.]+$/.test(name) && name.length >= 1 && name.length <= 100;
  }

  /**
   * Validate rate limit value
   */
  static isValidRateLimit(limit: number): boolean {
    return Number.isInteger(limit) && limit >= 1 && limit <= 10000;
  }

  /**
   * Validate permissions array
   */
  static isValidPermissions(permissions: string[]): boolean {
    const validPerms = ['read', 'write', 'admin', 'manage_keys'];
    return Array.isArray(permissions) && 
           permissions.length > 0 && 
           permissions.every(p => validPerms.includes(p));
  }
}

/**
 * Security utilities for request processing
 */
export class SecurityUtils {
  /**
   * Extract and validate client IP address
   */
  static getClientIp(c: Context): string {
    // Cloudflare provides the real IP in CF-Connecting-IP
    const cfIp = c.req.header('CF-Connecting-IP');
    if (cfIp && this.isValidIp(cfIp)) {
      return cfIp;
    }

    // Fallback to other headers
    const forwardedFor = c.req.header('X-Forwarded-For');
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      const firstIp = ips[0];
      if (this.isValidIp(firstIp)) {
        return firstIp;
      }
    }

    const realIp = c.req.header('X-Real-IP');
    if (realIp && this.isValidIp(realIp)) {
      return realIp;
    }

    return 'unknown';
  }

  /**
   * Validate IP address format
   */
  static isValidIp(ip: string): boolean {
    // Simple IPv4/IPv6 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Check for suspicious patterns in request
   */
  static isSuspiciousRequest(c: Context): boolean {
    const userAgent = c.req.header('User-Agent') || '';
    const path = c.req.path;
    
    // Check for common attack patterns
    const suspiciousPatterns = [
      /sqlmap/i,
      /burp/i,
      /nikto/i,
      /nessus/i,
      /\/\.\./,
      /<script/i,
      /union.*select/i,
      /drop.*table/i
    ];

    return suspiciousPatterns.some(pattern => 
      pattern.test(userAgent) || pattern.test(path)
    );
  }

  /**
   * Rate limit by IP address (simple in-memory implementation)
   */
  private static ipRateLimits = new Map<string, { count: number; resetTime: number }>();

  static checkIpRateLimit(ip: string, limit: number = 1000, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const existing = this.ipRateLimits.get(ip);

    if (!existing || now > existing.resetTime) {
      this.ipRateLimits.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    existing.count++;
    return true;
  }

  /**
   * Clean up old IP rate limit entries
   */
  static cleanupIpRateLimits(): void {
    const now = Date.now();
    for (const [ip, data] of this.ipRateLimits.entries()) {
      if (now > data.resetTime) {
        this.ipRateLimits.delete(ip);
      }
    }
  }
}

/**
 * Middleware for applying security headers
 */
export function securityHeadersMiddleware() {
  return async (c: Context, next: any) => {
    SecurityHeaders.addSecurityHeaders(c);
    await next();
  };
}

/**
 * Middleware for input sanitization
 */
export function sanitizationMiddleware() {
  return async (c: Context, next: any) => {
    // Add sanitization helpers to context
    c.set('sanitize', InputSanitizer);
    c.set('validator', Validator);
    c.set('security', SecurityUtils);
    
    await next();
  };
}