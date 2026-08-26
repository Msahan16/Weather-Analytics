const comfortIndexService = require('../services/comfortIndexService');

describe('Comfort Index Scoring Engine', () => {
  test('should return near perfect score (>= 95) for ideal biometeorological conditions', () => {
    const idealWeather = {
      tempC: 22.0,
      humidity: 45,
      windSpeed: 2.5,
      cloudiness: 30,
      pressure: 1013.25
    };

    const result = comfortIndexService.calculateScore(idealWeather);
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.category).toBe('Ideal');
  });

  test('should return low score (<= 35) for extreme freeze or burning heat conditions', () => {
    const freezingBlizzard = {
      tempC: -25.0,
      humidity: 95,
      windSpeed: 18.0,
      cloudiness: 100,
      pressure: 980.0
    };

    const result = comfortIndexService.calculateScore(freezingBlizzard);
    expect(result.score).toBeLessThan(35);
    expect(['Uncomfortable', 'Severe / Extreme']).toContain(result.category);
  });

  test('should always constrain score within [0, 100]', () => {
    const edgeCases = [
      { tempC: -50, humidity: 0, windSpeed: 50, cloudiness: 0, pressure: 900 },
      { tempC: 60, humidity: 100, windSpeed: 40, cloudiness: 100, pressure: 1100 },
      { tempC: 22, humidity: 45, windSpeed: 2.5, cloudiness: 30, pressure: 1013.25 }
    ];

    edgeCases.forEach(weather => {
      const result = comfortIndexService.calculateScore(weather);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  test('should calculate subscores accurately with breakdown metadata', () => {
    const weather = {
      tempC: 25.0,
      humidity: 60,
      windSpeed: 4.0,
      cloudiness: 50,
      pressure: 1010
    };

    const result = comfortIndexService.calculateScore(weather);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.temperature.weight).toBe(0.40);
    expect(result.breakdown.humidity.weight).toBe(0.25);
    expect(result.breakdown.windSpeed.weight).toBe(0.15);
    expect(result.breakdown.cloudiness.weight).toBe(0.10);
    expect(result.breakdown.pressure.weight).toBe(0.10);
  });

  test('should rank cities accurately from most to least comfortable', () => {
    const cities = [
      { cityName: 'Arctic Outpost', tempC: -30, humidity: 90, windSpeed: 15, cloudiness: 100, pressure: 990 },
      { cityName: 'Nice Mediterranean City', tempC: 22.5, humidity: 46, windSpeed: 2.3, cloudiness: 25, pressure: 1013.2 },
      { cityName: 'Humid Swamp', tempC: 38, humidity: 95, windSpeed: 0.5, cloudiness: 80, pressure: 1005 }
    ];

    const ranked = comfortIndexService.rankCities(cities);

    expect(ranked.length).toBe(3);
    expect(ranked[0].cityName).toBe('Nice Mediterranean City');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[0].comfortScore).toBeGreaterThan(ranked[1].comfortScore);
    expect(ranked[1].comfortScore).toBeGreaterThan(ranked[2].comfortScore);
  });
});
