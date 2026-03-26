/**
 * Unit.co API Client
 * SOLVY Cooperative Banking Integration
 */

const axios = require('axios');

const unit = axios.create({
  baseURL: process.env.UNIT_API_URL || 'https://api.s.unit.sh',
  headers: {
    'Authorization': `Bearer ${process.env.UNIT_API_TOKEN}`,
    'Content-Type': 'application/vnd.api+json'
  },
  timeout: 30000 // 30 second timeout
});

// Response interceptor for logging
unit.interceptors.response.use(
  (response) => {
    console.log(`✅ Unit API: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response.data;
  },
  (error) => {
    console.error('❌ Unit API Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
);

module.exports = unit;
