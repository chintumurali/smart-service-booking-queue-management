/**
 * Test setup file
 * Configures environment variables for testing
 */

require('dotenv').config({ path: '.env.test' });

// Set default test environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';
// Use test database - relative to backend directory
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

