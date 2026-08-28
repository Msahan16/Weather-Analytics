const fs = require('fs');
const axios = require('axios');
const config = require('../config');
const db = require('../config/db');
const cacheService = require('./cacheService');
const comfortIndexService = require('./comfortIndexService');

class WeatherService {
  constructor() {
    this.fallbackCities = this.loadCitiesFromFile();
  }

  /**
   * Load city list from local cities.json file as fallback
   */
  loadCitiesFromFile() {
    try {
      const data = fs.readFileSync(config.citiesFilePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.List || [];
    } catch (err) {
      console.error('[WeatherService] Error loading cities.json fallback:', err.message);
      return [];
    }
  }

  /**
   * Load cities dynamically from MySQL DB with fallback to JSON
   */
  async loadCities() {
    try {
      if (db.isConnected) {
        const [rows] = await db.query(
          'SELECT city_code AS CityCode, city_name AS CityName, country AS Country, temp AS Temp, status AS Status FROM cities WHERE is_active = 1'
        );
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            CityCode: String(r.CityCode),
            CityName: r.CityName,
            Country: r.Country || 'GLOBAL',
            Temp: String(r.Temp),
            Status: r.Status
          }));
        }
      }
    } catch (err) {
      console.warn(`[WeatherService] Could not fetch cities from MySQL: ${err.message}. Using JSON fallback.`);
    }

    return this.loadCitiesFromFile();
  }

  /**
   * Normalize an OpenWeatherMap API response or mock object into standard format
   */
  normalizeWeatherData(raw, fallbackCityMeta = {}) {
    const tempK = raw.main?.temp;
    const tempC = tempK ? Math.round((tempK - 273.15) * 10) / 10 : parseFloat(fallbackCityMeta.Temp || '20.0');
    const feelsLikeK = raw.main?.feels_like;
    const feelsLikeC = feelsLikeK ? Math.round((feelsLikeK - 273.15) * 10) / 10 : tempC;

    const weatherCondition = raw.weather?.[0] || {
      id: 800,
      main: fallbackCityMeta.Status || 'Clear',
      description: (fallbackCityMeta.Status || 'Clear').toLowerCase(),
      icon: '01d'
    };

    return {
      cityCode: String(raw.id || fallbackCityMeta.CityCode),
      cityName: raw.name || fallbackCityMeta.CityName,
      country: raw.sys?.country || fallbackCityMeta.Country || 'GLOBAL',
      coordinates: {
        lon: raw.coord?.lon || 0,
        lat: raw.coord?.lat || 0
      },
      temperature: {
        celsius: tempC,
        fahrenheit: Math.round((tempC * 9 / 5 + 32) * 10) / 10,
        feelsLikeC: feelsLikeC,
        feelsLikeF: Math.round((feelsLikeC * 9 / 5 + 32) * 10) / 10,
        tempMinC: raw.main?.temp_min ? Math.round((raw.main.temp_min - 273.15) * 10) / 10 : tempC - 2,
        tempMaxC: raw.main?.temp_max ? Math.round((raw.main.temp_max - 273.15) * 10) / 10 : tempC + 3
      },
      weather: {
        id: weatherCondition.id,
        main: weatherCondition.main,
        description: weatherCondition.description,
        icon: weatherCondition.icon,
        iconUrl: `https://openweathermap.org/img/wn/${weatherCondition.icon}@2x.png`
      },
      humidity: raw.main?.humidity ?? 55,
      pressure: raw.main?.pressure ?? 1013,
      windSpeed: raw.wind?.speed ?? 2.8,
      windDeg: raw.wind?.deg ?? 180,
      cloudiness: raw.clouds?.all ?? 25,
      visibility: raw.visibility ?? 10000,
      sunrise: raw.sys?.sunrise ? new Date(raw.sys.sunrise * 1000).toISOString() : null,
      sunset: raw.sys?.sunset ? new Date(raw.sys.sunset * 1000).toISOString() : null,
      timestamp: raw.dt ? new Date(raw.dt * 1000).toISOString() : new Date().toISOString()
    };
  }

  /**
   * Generate realistic weather data fallback if API key is not provided or API is rate-limited
   */
  generateMockFallback(cityMeta) {
    const baseTemp = parseFloat(cityMeta.Temp || '20');
    const status = cityMeta.Status || 'Clear';

    let humidity = 50;
    let clouds = 20;
    let wind = 3.2;
    let pressure = 1014;
    let icon = '01d';

    if (status.toLowerCase().includes('rain')) {
      humidity = 85;
      clouds = 90;
      wind = 5.2;
      pressure = 1006;
      icon = '10d';
    } else if (status.toLowerCase().includes('cloud')) {
      humidity = 65;
      clouds = 60;
      wind = 3.8;
      pressure = 1012;
      icon = '04d';
    } else if (status.toLowerCase().includes('mist')) {
      humidity = 92;
      clouds = 75;
      wind = 1.2;
      pressure = 1016;
      icon = '50d';
    } else if (status.toLowerCase().includes('thunder')) {
      humidity = 90;
      clouds = 98;
      wind = 8.5;
      pressure = 998;
      icon = '11d';
    }

    return {
      coord: { lon: 0, lat: 0 },
      weather: [{ id: 800, main: status, description: `${status.toLowerCase()} sky`, icon }],
      base: "stations",
      main: {
        temp: baseTemp + 273.15,
        feels_like: baseTemp + 273.15,
        temp_min: baseTemp - 2 + 273.15,
        temp_max: baseTemp + 2.5 + 273.15,
        pressure: pressure,
        humidity: humidity
      },
      visibility: 10000,
      wind: { speed: wind, deg: 180 },
      clouds: { all: clouds },
      dt: Math.floor(Date.now() / 1000),
      sys: {
        type: 1,
        id: 1000,
        country: cityMeta.Country || "GLOBAL",
        sunrise: Math.floor(Date.now() / 1000) - 20000,
        sunset: Math.floor(Date.now() / 1000) + 20000
      },
      id: parseInt(cityMeta.CityCode, 10),
      name: cityMeta.CityName,
      cod: 200
    };
  }

  /**
   * Fetch single city raw weather data with caching
   */
  async fetchCityWeather(cityMeta) {
    const cityCode = cityMeta.CityCode;
    
    // Check raw cache first
    const cacheResult = cacheService.getRawWeather(cityCode);
    if (cacheResult.status === 'HIT' && cacheResult.data) {
      return { raw: cacheResult.data, cacheStatus: 'HIT' };
    }

    // Try fetching from OpenWeatherMap API if API key is present
    if (config.openWeatherApiKey && config.openWeatherApiKey.trim() !== '') {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityCode}&appid=${config.openWeatherApiKey}`;
        const response = await axios.get(url, { timeout: 8000 });
        if (response.data && response.status === 200) {
          cacheService.setRawWeather(cityCode, response.data);
          return { raw: response.data, cacheStatus: 'MISS' };
        }
      } catch (err) {
        console.warn(`[WeatherService] Live API fetch failed for city ${cityMeta.CityName} (${cityCode}): ${err.message}. Using fallback.`);
      }
    }

    // Use fallback mock dataset when API key is missing or on network failure
    const mockData = this.generateMockFallback(cityMeta);
    cacheService.setRawWeather(cityCode, mockData);
    return { raw: mockData, cacheStatus: 'MISS' };
  }

  /**
   * Persist ranked weather analytics snapshot into MySQL weather_records table
   */
  async persistWeatherRecordsToDb(rankedCities) {
    try {
      if (!db.isConnected) return;

      for (const city of rankedCities) {
        await db.query(
          `INSERT INTO weather_records 
           (city_code, city_name, country, temp_c, temp_f, feels_like_c, feels_like_f, temp_min_c, temp_max_c,
            weather_main, weather_description, weather_icon, humidity, pressure, wind_speed, wind_deg,
            cloudiness, visibility, comfort_score, comfort_category, comfort_breakdown, source, recorded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            city.cityCode,
            city.cityName,
            city.country || 'GLOBAL',
            city.temperature.celsius,
            city.temperature.fahrenheit,
            city.temperature.feelsLikeC,
            city.temperature.feelsLikeF,
            city.temperature.tempMinC,
            city.temperature.tempMaxC,
            city.weather.main,
            city.weather.description,
            city.weather.icon,
            city.humidity,
            city.pressure,
            city.windSpeed,
            city.windDeg || 0,
            city.cloudiness,
            city.visibility || 10000,
            city.comfortScore,
            city.comfortCategory,
            JSON.stringify(city.comfortBreakdown || {}),
            'live'
          ]
        );
      }
    } catch (err) {
      console.warn(`[WeatherService] Non-blocking notice: Could not save weather records to MySQL: ${err.message}`);
    }
  }

  /**
   * Fetch and calculate ranked weather analytics for all cities
   */
  async getAllRankedWeather(forceRefresh = false) {
    // Check processed cache unless forced
    if (!forceRefresh) {
      const processedResult = cacheService.getProcessedAnalytics('all_ranked_cities');
      if (processedResult.status === 'HIT' && processedResult.data) {
        return {
          source: 'cache-processed',
          cacheStatus: 'HIT',
          generatedAt: processedResult.data.generatedAt,
          count: processedResult.data.cities.length,
          cities: processedResult.data.cities
        };
      }
    }

    const citiesMeta = await this.loadCities();
    if (!citiesMeta.length) {
      throw new Error('No cities configured in database or cities.json');
    }

    // Concurrently fetch weather data for all cities
    const fetchPromises = citiesMeta.map(city => this.fetchCityWeather(city));
    const rawResults = await Promise.all(fetchPromises);

    // Normalize all data
    const normalizedCities = rawResults.map((result, idx) => {
      const normalized = this.normalizeWeatherData(result.raw, citiesMeta[idx]);
      return {
        ...normalized,
        rawCacheStatus: result.cacheStatus
      };
    });

    // Compute Comfort Index and Rank cities
    const rankedCities = comfortIndexService.rankCities(normalizedCities);

    const payload = {
      generatedAt: new Date().toISOString(),
      cities: rankedCities
    };

    // Store in processed cache (5 min TTL)
    cacheService.setProcessedAnalytics('all_ranked_cities', payload);

    // Persist records into MySQL database asynchronously (non-blocking)
    this.persistWeatherRecordsToDb(rankedCities).catch(err => {
      console.warn('[WeatherService] Async DB record persistence warning:', err.message);
    });

    return {
      source: 'live-processed',
      cacheStatus: 'MISS',
      generatedAt: payload.generatedAt,
      count: rankedCities.length,
      cities: rankedCities
    };
  }

  /**
   * Get single city weather details
   */
  async getCityById(cityCode) {
    const allRanked = await this.getAllRankedWeather();
    const city = allRanked.cities.find(c => String(c.cityCode) === String(cityCode));
    if (!city) {
      return null;
    }
    return city;
  }

  /**
   * Get historical records for a city from MySQL
   */
  async getCityHistory(cityCode, limit = 20) {
    try {
      if (db.isConnected) {
        const [rows] = await db.query(
          `SELECT id, city_code, city_name, temp_c, humidity, wind_speed, pressure, cloudiness, comfort_score, comfort_category, recorded_at
           FROM weather_records
           WHERE city_code = ?
           ORDER BY recorded_at DESC
           LIMIT ?`,
          [String(cityCode), parseInt(limit, 10)]
        );
        return rows;
      }
    } catch (err) {
      console.warn(`[WeatherService] Could not load city history from DB: ${err.message}`);
    }
    return [];
  }
}

module.exports = new WeatherService();
