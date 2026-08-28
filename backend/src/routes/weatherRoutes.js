const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public Health Check & Database Status
router.get('/health', (req, res) => weatherController.healthCheck(req, res));
router.get('/db/status', (req, res) => weatherController.getDbStatus(req, res));

// Cache debug & telemetry endpoints
router.get('/cache/stats', (req, res) => weatherController.getCacheStats(req, res));
router.post('/cache/clear', (req, res) => weatherController.clearCache(req, res));

// Weather & Comfort Index endpoints (Protected by Auth0 / Dev Auth)
router.get('/all', requireAuth, (req, res, next) => weatherController.getAllWeather(req, res, next));
router.get('/city/:id', requireAuth, (req, res, next) => weatherController.getCityById(req, res, next));
router.get('/city/:id/history', requireAuth, (req, res, next) => weatherController.getCityHistory(req, res, next));

module.exports = router;
