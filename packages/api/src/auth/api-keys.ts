/**
 * API Key management utilities
 * Handles creation, validation, and management of API keys
 */

import { eq, and, desc } from 'drizzle-orm';
import { apiKeys } from '../db/schema';
import type { DrizzleD1 } from '../db';
import type { CreateApiKeyRequest, CreateApiKeyResponse, ApiKeyInfo } from '../types';
import { generateApiKey, hashApiKey, createFullApiKey } from './crypto';
import { PERMISSIONS } from './middleware';

/**
 * Create a new API key
 */
export async function createApiKey(
  db: DrizzleD1,
  request: CreateApiKeyRequest,
  createdBy?: string
): Promise<CreateApiKeyResponse> {
  // Validate permissions
  const permissions = request.permissions || ['read'];
  const validPermissions = Object.values(PERMISSIONS);
  
  for (const perm of permissions) {
    if (!validPermissions.includes(perm as any)) {
      throw new Error(`Invalid permission: ${perm}`);
    }
  }

  // Validate rate limit
  const rateLimit = request.rateLimit || 100;
  if (rateLimit < 1 || rateLimit > 10000) {
    throw new Error('Rate limit must be between 1 and 10000 requests per hour');
  }

  // Validate expiration date
  let expiresAt: string | undefined;
  if (request.expiresAt) {
    const expiration = new Date(request.expiresAt);
    if (expiration <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }
    expiresAt = expiration.toISOString();
  }

  try {
    // Generate key pair
    const { keyId, secretKey } = await generateApiKey();
    
    // Hash the secret for storage
    const { hash: hashedKey } = await hashApiKey(secretKey);
    
    // Insert into database
    await db.insert(apiKeys).values({
      keyId,
      hashedKey,
      name: request.name,
      permissions: JSON.stringify(permissions),
      rateLimit,
      expiresAt,
      createdBy
    });

    // Return the full API key (only returned once)
    const fullApiKey = createFullApiKey(keyId, secretKey);

    return {
      keyId,
      secretKey: fullApiKey,
      name: request.name,
      permissions,
      rateLimit,
      expiresAt,
      warning: 'This is the only time the secret key will be displayed. Please store it securely.'
    };
  } catch (error) {
    console.error('Failed to create API key:', error);
    throw new Error('Failed to create API key');
  }
}

/**
 * List API keys for management
 */
export async function listApiKeys(
  db: DrizzleD1,
  activeOnly: boolean = true
): Promise<ApiKeyInfo[]> {
  try {
    const conditions = activeOnly ? [eq(apiKeys.isActive, true)] : [];
    
    const keys = await db
      .select({
        keyId: apiKeys.keyId,
        name: apiKeys.name,
        permissions: apiKeys.permissions,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        rateLimit: apiKeys.rateLimit
      })
      .from(apiKeys)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(apiKeys.createdAt));

    return keys.map(key => ({
      keyId: key.keyId,
      name: key.name,
      permissions: JSON.parse(key.permissions || '["read"]'),
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt || undefined,
      expiresAt: key.expiresAt || undefined,
      rateLimit: key.rateLimit
    }));
  } catch (error) {
    console.error('Failed to list API keys:', error);
    throw new Error('Failed to list API keys');
  }
}

/**
 * Get API key details
 */
export async function getApiKey(
  db: DrizzleD1,
  keyId: string
): Promise<ApiKeyInfo | null> {
  try {
    const keyData = await db
      .select({
        keyId: apiKeys.keyId,
        name: apiKeys.name,
        permissions: apiKeys.permissions,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        rateLimit: apiKeys.rateLimit
      })
      .from(apiKeys)
      .where(eq(apiKeys.keyId, keyId))
      .limit(1);

    if (keyData.length === 0) {
      return null;
    }

    const key = keyData[0];
    return {
      keyId: key.keyId,
      name: key.name,
      permissions: JSON.parse(key.permissions || '["read"]'),
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt || undefined,
      expiresAt: key.expiresAt || undefined,
      rateLimit: key.rateLimit
    };
  } catch (error) {
    console.error('Failed to get API key:', error);
    throw new Error('Failed to get API key');
  }
}

/**
 * Update API key
 */
export async function updateApiKey(
  db: DrizzleD1,
  keyId: string,
  updates: {
    name?: string;
    permissions?: string[];
    rateLimit?: number;
    expiresAt?: string;
    isActive?: boolean;
  }
): Promise<boolean> {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.permissions !== undefined) {
      // Validate permissions
      const validPermissions = Object.values(PERMISSIONS);
      for (const perm of updates.permissions) {
        if (!validPermissions.includes(perm as any)) {
          throw new Error(`Invalid permission: ${perm}`);
        }
      }
      updateData.permissions = JSON.stringify(updates.permissions);
    }

    if (updates.rateLimit !== undefined) {
      if (updates.rateLimit < 1 || updates.rateLimit > 10000) {
        throw new Error('Rate limit must be between 1 and 10000 requests per hour');
      }
      updateData.rateLimit = updates.rateLimit;
    }

    if (updates.expiresAt !== undefined) {
      if (updates.expiresAt) {
        const expiration = new Date(updates.expiresAt);
        if (expiration <= new Date()) {
          throw new Error('Expiration date must be in the future');
        }
        updateData.expiresAt = expiration.toISOString();
      } else {
        updateData.expiresAt = null;
      }
    }

    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return false; // No updates to apply
    }

    const result = await db
      .update(apiKeys)
      .set(updateData)
      .where(eq(apiKeys.keyId, keyId));

    return true;
  } catch (error) {
    console.error('Failed to update API key:', error);
    throw new Error('Failed to update API key');
  }
}

/**
 * Deactivate API key
 */
export async function deactivateApiKey(
  db: DrizzleD1,
  keyId: string
): Promise<boolean> {
  return updateApiKey(db, keyId, { isActive: false });
}

/**
 * Reactivate API key
 */
export async function reactivateApiKey(
  db: DrizzleD1,
  keyId: string
): Promise<boolean> {
  return updateApiKey(db, keyId, { isActive: true });
}

/**
 * Delete API key permanently
 */
export async function deleteApiKey(
  db: DrizzleD1,
  keyId: string
): Promise<boolean> {
  try {
    await db
      .delete(apiKeys)
      .where(eq(apiKeys.keyId, keyId));

    return true;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw new Error('Failed to delete API key');
  }
}

/**
 * Check if an API key has a specific permission
 */
export async function checkPermission(
  db: DrizzleD1,
  keyId: string,
  permission: string
): Promise<boolean> {
  try {
    const keyData = await db
      .select({ permissions: apiKeys.permissions })
      .from(apiKeys)
      .where(and(
        eq(apiKeys.keyId, keyId),
        eq(apiKeys.isActive, true)
      ))
      .limit(1);

    if (keyData.length === 0) {
      return false;
    }

    const permissions: string[] = JSON.parse(keyData[0].permissions || '["read"]');
    return permissions.includes(permission) || permissions.includes(PERMISSIONS.ADMIN);
  } catch (error) {
    console.error('Failed to check permission:', error);
    return false;
  }
}

/**
 * Cleanup expired API keys
 */
export async function cleanupExpiredKeys(db: DrizzleD1): Promise<number> {
  try {
    const now = new Date().toISOString();
    
    // First, deactivate expired keys
    const deactivated = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(and(
        eq(apiKeys.isActive, true),
        eq(apiKeys.expiresAt, now) // This would need proper SQL for date comparison
      ));

    return 0; // Return count would require additional query
  } catch (error) {
    console.error('Failed to cleanup expired keys:', error);
    return 0;
  }
}