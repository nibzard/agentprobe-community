/**
 * CLI script to create the first admin API key
 * Usage: node scripts/create-admin-key.js
 * 
 * This script can be run locally to generate an admin API key
 * that can then be inserted into the D1 database manually.
 */

// Simple implementation that works in Node.js environment
const crypto = require('crypto');

// Constants
const API_KEY_PREFIX = 'ap_';
const SECRET_KEY_LENGTH = 32; // 256 bits
const KEY_ID_LENGTH = 16; // 128 bits for key ID

/**
 * Generate a secure random API key pair
 */
function generateApiKey() {
  // Generate random bytes for key ID (public part)
  const keyIdBytes = crypto.randomBytes(KEY_ID_LENGTH);
  const keyIdHex = keyIdBytes.toString('hex');
  const keyId = API_KEY_PREFIX + keyIdHex;

  // Generate random bytes for secret key
  const secretBytes = crypto.randomBytes(SECRET_KEY_LENGTH);
  const secretKey = secretBytes.toString('hex');

  return { keyId, secretKey };
}

/**
 * Hash an API key using PBKDF2 with SHA-256
 */
function hashApiKey(secretKey, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }

  const hash = crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256').toString('hex');
  return { hash: `${salt}:${hash}`, salt };
}

/**
 * Create a full API key from components
 */
function createFullApiKey(keyId, secretKey) {
  return `${keyId}_${secretKey}`;
}

// Generate the admin key
console.log('🔐 Generating Admin API Key for AgentProbe Community...\n');

const { keyId, secretKey } = generateApiKey();
const { hash: hashedKey } = hashApiKey(secretKey);
const fullApiKey = createFullApiKey(keyId, secretKey);

console.log('✅ Admin API Key Generated Successfully!\n');
console.log('📋 Key Details:');
console.log(`   Key ID: ${keyId}`);
console.log(`   Full API Key: ${fullApiKey}`);
console.log(`   Hashed Key: ${hashedKey}\n`);

console.log('📝 SQL to insert into D1 database:');
console.log('=====================================');
console.log(`INSERT INTO api_keys (key_id, hashed_key, name, permissions, is_active, rate_limit, created_by)`);
console.log(`VALUES ('${keyId}', '${hashedKey}', 'Bootstrap Admin Key', '["admin"]', 1, 10000, 'bootstrap');`);
console.log('=====================================\n');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • Store the full API key securely - it will not be shown again');
console.log('   • The hashed key is stored in the database for verification');
console.log('   • This key has full admin permissions');
console.log('   • Consider creating additional keys with limited permissions');
console.log('   • Rotate this key regularly for security\n');

console.log('🚀 Next Steps:');
console.log('   1. Execute the SQL statement in your D1 database');
console.log('   2. Test the API key with a request to /health');
console.log('   3. Create additional API keys through the API');
console.log('   4. Delete this bootstrap key once you have other admin keys\n');

// Also save to file for convenience
const fs = require('fs');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `admin-key-${timestamp}.txt`;

const keyInfo = `AgentProbe Community Admin API Key
Generated: ${new Date().toISOString()}

Key ID: ${keyId}
Full API Key: ${fullApiKey}
Hashed Key: ${hashedKey}

SQL Command:
INSERT INTO api_keys (key_id, hashed_key, name, permissions, is_active, rate_limit, created_by)
VALUES ('${keyId}', '${hashedKey}', 'Bootstrap Admin Key', '["admin"]', 1, 10000, 'bootstrap');

⚠️  SECURITY WARNING:
This file contains sensitive information. Store it securely and delete it after use.
`;

try {
  fs.writeFileSync(filename, keyInfo);
  console.log(`💾 Key information saved to: ${filename}`);
  console.log('   📁 Please store this file securely and delete it after use\n');
} catch (error) {
  console.log('❌ Could not save to file, but key was generated successfully\n');
}

console.log('✨ Admin key generation complete!');