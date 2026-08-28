const weatherService = require('../services/weatherService');
const db = require('../config/db');

describe('Weather Service & DB Integration', () => {
  afterAll(async () => {
    await db.closePool();
  });

  test('should load default cities via fallback when DB is offline or from DB when online', async () => {
    const cities = await weatherService.loadCities();
    expect(Array.isArray(cities)).toBe(true);
    expect(cities.length).toBeGreaterThanOrEqual(12);
    expect(cities[0]).toHaveProperty('CityCode');
    expect(cities[0]).toHaveProperty('CityName');
  });

  test('should normalize raw weather object correctly', () => {
    const rawMock = {
      id: 1248991,
      name: 'Colombo',
      sys: { country: 'LK', sunrise: 1600000000, sunset: 1600040000 },
      coord: { lon: 79.86, lat: 6.92 },
      main: {
        temp: 306.15, // 33.0 C
        feels_like: 309.15,
        temp_min: 305.15,
        temp_max: 307.15,
        pressure: 1010,
        humidity: 75
      },
      weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
      wind: { speed: 4.2, deg: 230 },
      clouds: { all: 20 },
      visibility: 10000,
      dt: 1600020000
    };

    const normalized = weatherService.normalizeWeatherData(rawMock);
    expect(normalized.cityCode).toBe('1248991');
    expect(normalized.cityName).toBe('Colombo');
    expect(normalized.country).toBe('LK');
    expect(normalized.temperature.celsius).toBe(33);
    expect(normalized.humidity).toBe(75);
    expect(normalized.windSpeed).toBe(4.2);
  });

  test('should compute all ranked weather with comfort scores', async () => {
    const result = await weatherService.getAllRankedWeather(true);
    expect(result).toBeDefined();
    expect(result.cities.length).toBeGreaterThanOrEqual(12);
    expect(result.cities[0]).toHaveProperty('comfortScore');
    expect(result.cities[0]).toHaveProperty('rank');
    expect(result.cities[0].rank).toBe(1);
  });

  test('should check database health structure without throwing error', async () => {
    const health = await db.checkDbHealth();
    expect(health).toHaveProperty('connected');
    expect(health).toHaveProperty('database', 'Weather-AnalyticsDB');
  });
});
