const weatherService = require('../services/weatherService');
const cacheService = require('../services/cacheService');

/**
 * Weather & Analytics Controller
 */
class WeatherController {
  /**
   * Get all cities weather with Comfort Index calculation and ranking
   * GET /api/weather/all
   */
  async getAllWeather(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const startTime = Date.now();

      const result = await weatherService.getAllRankedWeather(forceRefresh);
      const responseTimeMs = Date.now() - startTime;

      res.setHeader('X-Cache-Status', result.cacheStatus);
      res.setHeader('X-Response-Time-Ms', responseTimeMs);

      return res.status(200).json({
        success: true,
        source: result.source,
        cacheStatus: result.cacheStatus,
        responseTimeMs,
        generatedAt: result.generatedAt,
        totalCities: result.count,
        user: req.auth ? { email: req.auth.email || 'careers@fidenz.com' } : null,
        data: result.cities
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single city weather details
   * GET /api/weather/city/:id
   */
  async getCityById(req, res, next) {
    try {
      const { id } = req.params;
      const city = await weatherService.getCityById(id);

      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'CityNotFound',
          message: `City with code '${id}' was not found in registered cities.`
        });
      }

      return res.status(200).json({
        success: true,
        data: city
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Cache Telemetry & Debug Statistics
   * GET /api/weather/cache/stats
   */
  async getCacheStats(req, res) {
    const stats = cacheService.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  }

  /**
   * Clear all server-side caches
   * POST /api/weather/cache/clear
   */
  async clearCache(req, res) {
    const result = cacheService.flushAll();
    return res.status(200).json({
      success: true,
      data: result
    });
  }

  /**
   * System Health Check
   * GET /api/weather/health
   */
  async healthCheck(req, res) {
    return res.status(200).json({
      status: 'healthy',
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new WeatherController();
