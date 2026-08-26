/**
 * Comfort Index Calculation Service
 * 
 * Formula Design:
 * A biometeorological comfort index mapping weather parameters into a [0, 100] score.
 * 
 * Weight Distribution:
 * - Temperature: 40% (Optimal base: 22.0°C / 71.6°F)
 * - Humidity:    25% (Optimal base: 45%)
 * - Wind Speed:  15% (Optimal base: 2.5 m/s)
 * - Cloudiness:  10% (Optimal base: 30%)
 * - Pressure:    10% (Optimal base: 1013.25 hPa)
 */

class ComfortIndexService {
  /**
   * Temperature Sub-score (0 - 100)
   * Optimal: 22°C (Room/Outdoor thermal comfort)
   */
  calcTemperatureScore(tempC) {
    if (tempC === undefined || tempC === null || isNaN(tempC)) return 50;
    const optimalTemp = 22.0;
    const diff = Math.abs(tempC - optimalTemp);
    // Smooth non-linear penalty for extreme deviations
    const score = 100 - Math.pow(diff, 1.45) * 3.5;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  /**
   * Humidity Sub-score (0 - 100)
   * Optimal: 45% (Comfortable range 35% - 55%)
   */
  calcHumidityScore(humidity) {
    if (humidity === undefined || humidity === null || isNaN(humidity)) return 50;
    const optimalHumidity = 45.0;
    const diff = Math.abs(humidity - optimalHumidity);
    const score = 100 - Math.pow(diff, 1.3) * 1.6;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  /**
   * Wind Speed Sub-score (0 - 100)
   * Optimal: 2.0 - 3.5 m/s (Gentle refreshing breeze)
   */
  calcWindScore(windSpeed) {
    if (windSpeed === undefined || windSpeed === null || isNaN(windSpeed)) return 50;
    if (windSpeed >= 1.5 && windSpeed <= 3.5) {
      return 100;
    }
    if (windSpeed < 1.5) {
      // Stagnant air penalty
      return Math.max(70, Math.round((80 + (windSpeed / 1.5) * 20) * 10) / 10);
    }
    // High wind speed penalty
    const score = 100 - Math.pow(windSpeed - 3.5, 1.4) * 6.5;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  /**
   * Cloudiness Sub-score (0 - 100)
   * Optimal: 20% - 40% (Partly sunny / nice sky coverage)
   */
  calcCloudinessScore(clouds) {
    if (clouds === undefined || clouds === null || isNaN(clouds)) return 50;
    if (clouds >= 20 && clouds <= 45) {
      return 100;
    }
    if (clouds < 20) {
      // Very clear / harsh direct sun
      return Math.round((85 + (clouds / 20) * 15) * 10) / 10;
    }
    // Overcast penalty
    const score = 100 - ((clouds - 45) / 55) * 40;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  /**
   * Atmospheric Pressure Sub-score (0 - 100)
   * Optimal: 1013.25 hPa (Standard atmospheric pressure)
   */
  calcPressureScore(pressure) {
    if (pressure === undefined || pressure === null || isNaN(pressure)) return 50;
    const optimalPressure = 1013.25;
    const diff = Math.abs(pressure - optimalPressure);
    const score = 100 - diff * 2.8;
    return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  }

  /**
   * Visibility Sub-score (0 - 100)
   * Provided for modularity and Screen Recording extension demonstration
   * Optimal: >= 10,000 meters (10 km clear view)
   */
  calcVisibilityScore(visibilityMeters) {
    if (visibilityMeters === undefined || visibilityMeters === null || isNaN(visibilityMeters)) return 100;
    const score = Math.min(100, (visibilityMeters / 10000) * 100);
    return Math.max(0, Math.round(score * 10) / 10);
  }

  /**
   * Compute comprehensive Comfort Index score for a city
   * @param {Object} weather - Raw or formatted weather object
   * @returns {Object} { score, breakdown, category }
   */
  calculateScore(weather) {
    // Extract parameters
    const tempC = weather.tempC ?? weather.temperature?.celsius ?? (weather.main?.temp ? weather.main.temp - 273.15 : 20);
    const humidity = weather.humidity ?? weather.main?.humidity ?? 50;
    const windSpeed = weather.windSpeed ?? weather.wind?.speed ?? 2.5;
    const cloudiness = weather.cloudiness ?? weather.clouds?.all ?? 30;
    const pressure = weather.pressure ?? weather.main?.pressure ?? 1013.25;

    // Calculate individual component scores
    const tempScore = this.calcTemperatureScore(tempC);
    const humidityScore = this.calcHumidityScore(humidity);
    const windScore = this.calcWindScore(windSpeed);
    const cloudScore = this.calcCloudinessScore(cloudiness);
    const pressureScore = this.calcPressureScore(pressure);

    // Weights: Sum = 1.0 (100%)
    const weights = {
      temp: 0.40,
      humidity: 0.25,
      wind: 0.15,
      cloud: 0.10,
      pressure: 0.10
    };

    const weightedScore =
      tempScore * weights.temp +
      humidityScore * weights.humidity +
      windScore * weights.wind +
      cloudScore * weights.cloud +
      pressureScore * weights.pressure;

    const finalScore = Math.max(0, Math.min(100, Math.round(weightedScore * 10) / 10));

    // Comfort Category Label & Color Code
    let category = 'Moderate';
    let color = '#f59e0b'; // Amber

    if (finalScore >= 85) {
      category = 'Ideal';
      color = '#10b981'; // Emerald Green
    } else if (finalScore >= 70) {
      category = 'Pleasant';
      color = '#06b6d4'; // Cyan
    } else if (finalScore >= 50) {
      category = 'Moderate';
      color = '#f59e0b'; // Amber
    } else if (finalScore >= 35) {
      category = 'Uncomfortable';
      color = '#f97316'; // Orange
    } else {
      category = 'Severe / Extreme';
      color = '#ef4444'; // Red
    }

    return {
      score: finalScore,
      category,
      color,
      breakdown: {
        temperature: { value: Math.round(tempC * 10) / 10, unit: '°C', score: tempScore, weight: weights.temp },
        humidity: { value: humidity, unit: '%', score: humidityScore, weight: weights.humidity },
        windSpeed: { value: windSpeed, unit: 'm/s', score: windScore, weight: weights.wind },
        cloudiness: { value: cloudiness, unit: '%', score: cloudScore, weight: weights.cloud },
        pressure: { value: pressure, unit: 'hPa', score: pressureScore, weight: weights.pressure }
      }
    };
  }

  /**
   * Process and rank a list of city weather datasets
   * @param {Array} citiesWeatherList 
   * @returns {Array} Sorted list of cities from most to least comfortable
   */
  rankCities(citiesWeatherList) {
    const scoredCities = citiesWeatherList.map(city => {
      const comfort = this.calculateScore(city);
      return {
        ...city,
        comfortScore: comfort.score,
        comfortCategory: comfort.category,
        comfortColor: comfort.color,
        comfortBreakdown: comfort.breakdown
      };
    });

    // Rank from Most Comfortable (highest score) to Least Comfortable (lowest score)
    scoredCities.sort((a, b) => b.comfortScore - a.comfortScore);

    // Assign rank positions 1, 2, 3...
    return scoredCities.map((city, index) => ({
      ...city,
      rank: index + 1
    }));
  }
}

module.exports = new ComfortIndexService();
