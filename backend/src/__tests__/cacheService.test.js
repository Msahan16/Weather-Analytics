const cacheService = require('../services/cacheService');

describe('Two-Tier Server Cache Service', () => {
  beforeEach(() => {
    cacheService.flushAll();
  });

  test('should return MISS on first raw query and HIT after setting data', () => {
    const cityCode = '123456';
    const fakeRaw = { name: 'TestCity', temp: 295 };

    const firstCheck = cacheService.getRawWeather(cityCode);
    expect(firstCheck.status).toBe('MISS');
    expect(firstCheck.data).toBeNull();

    cacheService.setRawWeather(cityCode, fakeRaw, 60);

    const secondCheck = cacheService.getRawWeather(cityCode);
    expect(secondCheck.status).toBe('HIT');
    expect(secondCheck.data).toEqual(fakeRaw);
  });

  test('should store and retrieve processed analytics output', () => {
    const payload = { cities: [{ cityName: 'Paris', rank: 1 }] };

    const firstCheck = cacheService.getProcessedAnalytics('test_key');
    expect(firstCheck.status).toBe('MISS');

    cacheService.setProcessedAnalytics('test_key', payload, 60);

    const secondCheck = cacheService.getProcessedAnalytics('test_key');
    expect(secondCheck.status).toBe('HIT');
    expect(secondCheck.data).toEqual(payload);
  });

  test('should provide comprehensive telemetry in getStats()', () => {
    cacheService.setRawWeather('111', { data: 1 });
    cacheService.getRawWeather('111'); // HIT
    cacheService.getRawWeather('999'); // MISS

    const stats = cacheService.getStats();
    expect(stats.rawCache).toBeDefined();
    expect(stats.processedCache).toBeDefined();
    expect(stats.rawCache.hits).toBeGreaterThanOrEqual(1);
    expect(stats.rawCache.misses).toBeGreaterThanOrEqual(1);
    expect(stats.overall.hitRatio).toBeDefined();
  });

  test('should flush all entries on flushAll()', () => {
    cacheService.setRawWeather('100', { a: 1 });
    cacheService.setProcessedAnalytics('all', { b: 2 });

    expect(cacheService.getRawWeather('100').status).toBe('HIT');
    expect(cacheService.getProcessedAnalytics('all').status).toBe('HIT');

    cacheService.flushAll();

    expect(cacheService.getRawWeather('100').status).toBe('MISS');
    expect(cacheService.getProcessedAnalytics('all').status).toBe('MISS');
  });
});
