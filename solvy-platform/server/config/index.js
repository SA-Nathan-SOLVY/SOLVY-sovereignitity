/**
 * SOLVY Metrics Server — Configuration
 * Loads environment variables with sensible defaults.
 */

require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL || 'sqlite:./data/solvy.sqlite'
  },

  security: {
    adminApiKey: process.env.ADMIN_API_KEY,
    memberHashSalt: process.env.MEMBER_HASH_SALT || 'solvy_aggregation_salt_2025',
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100 // requests per window
  },

  cors: {
    origins: (process.env.ALLOWED_ORIGINS || 'https://ebl.beauty')
      .split(',')
      .map(o => o.trim())
  }
};

// Validate critical config in production
if (config.isProduction) {
  if (!process.env.ADMIN_API_KEY || process.env.ADMIN_API_KEY.length < 32) {
    console.warn('[CONFIG] WARNING: ADMIN_API_KEY is weak or not set in production!');
  }
  if (config.cors.origins.includes('*')) {
    console.warn('[CONFIG] WARNING: CORS allows all origins in production!');
  }
}

module.exports = config;
