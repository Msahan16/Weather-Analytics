const NodeCache = require('node-cache');
const config = require('../config');

/**
 * Two-Tier Server-Side Caching Service
 * 
 * Tier 1: Raw Weather API Cache (5 min TTL) - Prevents excessive external API calls
 * Tier 2: Processed Analytics Cache (5 min TTL) - Prevents redundant score re-computations
 */
class CacheService {
  constructor() {
    // Raw weather data cache
    this.rawCache = new NodeCache({
      stdTTL: config.cacheTtlRaw,
      checkperiod: 60,
      useClones: false
    });

    // Processed ranked weather data cache
    this.processedCache = new NodeCache({
      stdTTL: config.cacheTtlProcessed,
      checkperiod: 60,
      useClones: false
    });

    // Cache Telemetry / Debug metrics
    this.stats = {
      raw: { hits: 0, misses: 0, sets: 0 },
      processed: { hits: 0, misses: 0, sets: 0 },
      createdAt: new Date().toISOString()
    };
  }

  // --- RAW TIER ---
  getRawWeather(cityCode) {
    const key = `raw:city:${cityCode}`;
    const data = this.rawCache.get(key);
    if (data !== undefined) {
      this.stats.raw.hits++;
      return { data, status: 'HIT' };
    }
    this.stats.raw.misses++;
    return { data: null, status: 'MISS' };
  }

  setRawWeather(cityCode, data, customTtl) {
    const key = `raw:city:${cityCode}`;
    const ttl = customTtl || config.cacheTtlRaw;
    const success = this.rawCache.set(key, data, ttl);
    if (success) {
      this.stats.raw.sets++;
    }
    return success;
  }

  // --- PROCESSED TIER ---
  getProcessedAnalytics(cacheKey = 'all_ranked_cities') {
    const key = `processed:${cacheKey}`;
    const data = this.processedCache.get(key);
    if (data !== undefined) {
      this.stats.processed.hits++;
      return { data, status: 'HIT' };
    }
    this.stats.processed.misses++;
    return { data: null, status: 'MISS' };
  }

  setProcessedAnalytics(cacheKey = 'all_ranked_cities', data, customTtl) {
    const key = `processed:${cacheKey}`;
    const ttl = customTtl || config.cacheTtlProcessed;
    const success = this.processedCache.set(key, data, ttl);
    if (success) {
      this.stats.processed.sets++;
    }
    return success;
  }

  // --- DEBUG & MANAGEMENT ---
  getStats() {
    const rawKeys = this.rawCache.keys();
    const processedKeys = this.processedCache.keys();

    const rawTtlList = rawKeys.map(k => ({
      key: k,
      ttlRemainingSec: Math.max(0, Math.round((this.rawCache.getTtl(k) - Date.now()) / 1000))
    }));

    const processedTtlList = processedKeys.map(k => ({
      key: k,
      ttlRemainingSec: Math.max(0, Math.round((this.processedCache.getTtl(k) - Date.now()) / 1000))
    }));

    const totalRequests = 
      this.stats.raw.hits + this.stats.raw.misses + 
      this.stats.processed.hits + this.stats.processed.misses;

    const totalHits = this.stats.raw.hits + this.stats.processed.hits;
    const hitRatio = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(1) + '%' : '0%';

    return {
      uptimeSince: this.stats.createdAt,
      overall: {
        totalRequests,
        totalHits,
        totalMisses: totalRequests - totalHits,
        hitRatio
      },
      rawCache: {
        keyCount: rawKeys.length,
        hits: this.stats.raw.hits,
        misses: this.stats.raw.misses,
        hitRate: this.calculateRate(this.stats.raw.hits, this.stats.raw.misses),
        configuredTtlSec: config.cacheTtlRaw,
        entries: rawTtlList
      },
      processedCache: {
        keyCount: processedKeys.length,
        hits: this.stats.processed.hits,
        misses: this.stats.processed.misses,
        hitRate: this.calculateRate(this.stats.processed.hits, this.stats.processed.misses),
        configuredTtlSec: config.cacheTtlProcessed,
        entries: processedTtlList
      }
    };
  }

  calculateRate(hits, misses) {
    const total = hits + misses;
    if (total === 0) return '0%';
    return `${((hits / total) * 100).toFixed(1)}%`;
  }

  flushAll() {
    this.rawCache.flushAll();
    this.processedCache.flushAll();
    return {
      message: 'All caches successfully cleared',
      clearedAt: new Date().toISOString()
    };
  }
}

module.exports = new CacheService();
