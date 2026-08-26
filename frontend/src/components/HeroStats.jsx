import React from 'react';
import { 
  Trophy, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Globe2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function HeroStats() {
  const { weatherData, tempUnit, setSelectedCity } = useWeather();

  if (!weatherData || weatherData.length === 0) {
    return null;
  }

  // Top ranked city
  const topCity = weatherData[0];

  // Compute aggregate stats
  const avgComfort = Math.round(
    (weatherData.reduce((acc, curr) => acc + curr.comfortScore, 0) / weatherData.length) * 10
  ) / 10;

  const idealCitiesCount = weatherData.filter(c => c.comfortScore >= 75).length;
  
  const temps = weatherData.map(c => c.temperature.celsius);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);

  return (
    <section className="hero-section">
      {/* Top 1 City Showcase Spotlight */}
      <div className="glass-panel hero-spotlight">
        <div>
          <div className="hero-rank-badge">
            <Trophy size={15} />
            <span>#1 Most Comfortable City</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="hero-city-title">{topCity.cityName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>{topCity.country}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{topCity.weather.description}</span>
              </div>
            </div>

            <button 
              className="btn btn-glass"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              onClick={() => setSelectedCity(topCity)}
            >
              <span>Inspect Factors</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="hero-stats-grid">
          <div className="hero-kpi-card">
            <span className="hero-kpi-label">Comfort Score</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span className="hero-kpi-val" style={{ color: topCity.comfortColor }}>
                {topCity.comfortScore}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>

          <div className="hero-kpi-card">
            <span className="hero-kpi-label">Temperature</span>
            <span className="hero-kpi-val" style={{ color: 'var(--accent-cyan)' }}>
              {tempUnit === 'C' ? `${topCity.temperature.celsius}°C` : `${topCity.temperature.fahrenheit}°F`}
            </span>
          </div>

          <div className="hero-kpi-card">
            <span className="hero-kpi-label">Humidity</span>
            <span className="hero-kpi-val" style={{ color: 'var(--accent-indigo)' }}>
              {topCity.humidity}%
            </span>
          </div>
        </div>
      </div>

      {/* Side Aggregate Quick Cards */}
      <div className="metrics-side-grid">
        <div className="glass-panel mini-kpi-card">
          <div>
            <div className="mini-kpi-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
              <Activity size={20} />
            </div>
            <div className="hero-kpi-label">Global Avg Comfort</div>
            <div className="hero-kpi-val" style={{ marginTop: '0.25rem' }}>{avgComfort} / 100</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Biometeorological benchmark
          </div>
        </div>

        <div className="glass-panel mini-kpi-card">
          <div>
            <div className="mini-kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <Sparkles size={20} />
            </div>
            <div className="hero-kpi-label">High Comfort Cities</div>
            <div className="hero-kpi-val" style={{ marginTop: '0.25rem' }}>
              {idealCitiesCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>of {weatherData.length}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Score ≥ 75 (Pleasant / Ideal)
          </div>
        </div>

        <div className="glass-panel mini-kpi-card">
          <div>
            <div className="mini-kpi-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
              <Thermometer size={20} />
            </div>
            <div className="hero-kpi-label">Thermal Variance</div>
            <div className="hero-kpi-val" style={{ marginTop: '0.25rem' }}>
              {tempUnit === 'C' ? `${minTemp}°C → ${maxTemp}°C` : `${Math.round(minTemp*9/5+32)}°F → ${Math.round(maxTemp*9/5+32)}°F`}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Lowest to highest extremes
          </div>
        </div>

        <div className="glass-panel mini-kpi-card">
          <div>
            <div className="mini-kpi-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
              <Globe2 size={20} />
            </div>
            <div className="hero-kpi-label">Active Monitoring</div>
            <div className="hero-kpi-val" style={{ marginTop: '0.25rem' }}>{weatherData.length} Cities</div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Processed via cities.json
          </div>
        </div>
      </div>
    </section>
  );
}
