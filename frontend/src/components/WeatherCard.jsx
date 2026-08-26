import React from 'react';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Cloud, 
  Eye, 
  ChevronRight 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function WeatherCard({ city }) {
  const { tempUnit, setSelectedCity } = useWeather();

  const getRankClass = (rank) => {
    if (rank === 1) return 'top-1';
    if (rank === 2) return 'top-2';
    if (rank === 3) return 'top-3';
    return '';
  };

  const tempDisplay = tempUnit === 'C' 
    ? `${city.temperature.celsius}°C` 
    : `${city.temperature.fahrenheit}°F`;

  const feelsLikeDisplay = tempUnit === 'C'
    ? `${city.temperature.feelsLikeC}°C`
    : `${city.temperature.feelsLikeF}°F`;

  return (
    <div 
      className="glass-panel weather-card"
      onClick={() => setSelectedCity(city)}
      role="button"
      tabIndex={0}
      title="Click to view detailed Comfort Index score breakdown"
    >
      <div>
        {/* Top Header: City Name, Country & Rank Badge */}
        <div className="card-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{city.cityName}</h3>
              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--bg-glass-strong)', color: 'var(--text-secondary)' }}>
                {city.country}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: '0.2rem' }}>
              {city.weather.description}
            </div>
          </div>

          <div className={`card-rank-badge ${getRankClass(city.rank)}`}>
            #{city.rank}
          </div>
        </div>

        {/* Temperature & Weather Icon Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.5rem 0' }}>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
              {tempDisplay}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Feels like {feelsLikeDisplay}
            </div>
          </div>

          {city.weather.iconUrl ? (
            <img 
              src={city.weather.iconUrl} 
              alt={city.weather.main}
              style={{ width: '56px', height: '56px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' }}
            />
          ) : (
            <div style={{ fontSize: '1.75rem' }}>🌤️</div>
          )}
        </div>

        {/* Comfort Index Score Gauge Bar */}
        <div className="comfort-gauge-container">
          <div className="gauge-score-value" style={{ color: city.comfortColor }}>
            {city.comfortScore}
          </div>
          <div className="gauge-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: city.comfortColor }}>
                {city.comfortCategory}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Comfort Index</span>
            </div>
            <div className="gauge-progress-bar">
              <div 
                className="gauge-progress-fill" 
                style={{ 
                  width: `${city.comfortScore}%`, 
                  backgroundColor: city.comfortColor,
                  boxShadow: `0 0 10px ${city.comfortColor}66`
                }} 
              />
            </div>
          </div>
        </div>

        {/* Atmospheric Parameter Badges */}
        <div className="param-chips-grid">
          <div className="param-chip">
            <span className="param-chip-label">
              <Droplets size={13} color="var(--accent-indigo)" />
              <span>Humidity</span>
            </span>
            <span className="param-chip-val">{city.humidity}%</span>
          </div>

          <div className="param-chip">
            <span className="param-chip-label">
              <Wind size={13} color="var(--accent-cyan)" />
              <span>Wind</span>
            </span>
            <span className="param-chip-val">{city.windSpeed} m/s</span>
          </div>

          <div className="param-chip">
            <span className="param-chip-label">
              <Cloud size={13} color="var(--accent-amber)" />
              <span>Clouds</span>
            </span>
            <span className="param-chip-val">{city.cloudiness}%</span>
          </div>

          <div className="param-chip">
            <span className="param-chip-label">
              <Gauge size={13} color="var(--accent-emerald)" />
              <span>Pressure</span>
            </span>
            <span className="param-chip-val">{city.pressure} hPa</span>
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>City ID: {city.cityCode}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
          View Analysis <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
}
