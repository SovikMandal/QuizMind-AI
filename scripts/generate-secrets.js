#!/usr/bin/env node
/**
 * Generate secure random secrets for JWT tokens
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n🔐 Generated JWT Secrets\n');
console.log('Copy these to your .env file or Render environment variables:\n');
console.log(`JWT_ACCESS_SECRET=${generateSecret()}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret()}`);
console.log('\n✅ Keep these secret and never commit them to git!\n');
