const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const weatherRoutes = require('./routes/weatherRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Cache-Status', 'X-Response-Time-Ms', 'X-Auth-Mode']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Mount Weather Analytics Routes
app.use('/api/weather', weatherRoutes);

// Root Index Route
app.get('/', (req, res) => {
  res.json({
    name: 'Weather Analytics API (Fidenz Assignment)',
    version: '1.0.0',
    endpoints: {
      allWeather: '/api/weather/all',
      singleCity: '/api/weather/city/:id',
      cacheStats: '/api/weather/cache/stats',
      cacheClear: '/api/weather/cache/clear (POST)',
      health: '/api/weather/health'
    },
    docs: {
      authRequired: config.authRequired,
      cacheTtlRaw: `${config.cacheTtlRaw}s`,
      cacheTtlProcessed: `${config.cacheTtlProcessed}s`
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server if not running in Jest test runner
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🌤️  Weather Analytics API Server running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🔒 Auth Required: ${config.authRequired}`);
    console.log(`⏱️  Cache TTL: ${config.cacheTtlRaw}s (Raw) / ${config.cacheTtlProcessed}s (Processed)`);
    console.log(`🚀 Ready: http://localhost:${config.port}`);
    console.log('====================================================');
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server gracefully.');
    server.close(() => console.log('HTTP server closed.'));
  });
}

module.exports = app;
