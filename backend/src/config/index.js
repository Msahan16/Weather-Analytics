const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  cacheTtlRaw: parseInt(process.env.CACHE_TTL_RAW || '300', 10), // 5 minutes default
  cacheTtlProcessed: parseInt(process.env.CACHE_TTL_PROCESSED || '300', 10), // 5 minutes default
  authRequired: process.env.AUTH_REQUIRED === 'true',
  auth0IssuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-weather-analytics.us.auth0.com/',
  auth0Audience: process.env.AUTH0_AUDIENCE || 'https://weather-analytics-api.local',
  citiesFilePath: path.join(__dirname, 'cities.json')
};
