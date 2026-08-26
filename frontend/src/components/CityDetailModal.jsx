import React, { useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud, 
  Gauge, 
  Sunrise, 
  Sunset, 
  MapPin, 
  Activity, 
  CheckCircle2 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function CityDetailModal() {
  const { selectedCity, setSelectedCity, tempUnit } = useWeather();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedCity]);

  if (!selectedCity) return null;

  const breakdown = selectedCity.comfortBreakdown || {};

  // Radar Chart Data for Score Factors
  const radarData = {
    labels: ['Temperature (40%)', 'Humidity (25%)', 'Wind Speed (15%)', 'Cloudiness (10%)', 'Pressure (10%)'],
    datasets: [
      {
        label: 'Factor Sub-Score (0-100)',
        data: [
          breakdown.temperature?.score || 50,
          breakdown.humidity?.score || 50,
          breakdown.windSpeed?.score || 50,
          breakdown.cloudiness?.score || 50,
          breakdown.pressure?.score || 50
        ],
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#38bdf8'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.75)',
          font: { size: 11, family: 'Plus Jakarta Sans' }
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedCity(null)}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={() => setSelectedCity(null)}
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-md)', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 800
            }}
          >
            #{selectedCity.rank}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{selectedCity.cityName}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({selectedCity.country})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              <span style={{ textTransform: 'capitalize' }}>{selectedCity.weather.description}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={13} />
                {selectedCity.coordinates?.lat.toFixed(2)}°, {selectedCity.coordinates?.lon.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* Score Highlights Banner */}
        <div 
          style={{ 
            background: 'var(--bg-glass-strong)', 
            border: '1px solid var(--border-glass)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Comfort Index
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: selectedCity.comfortColor, fontFamily: 'Outfit' }}>
              {selectedCity.comfortScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedCity.comfortColor }}>
              Category: {selectedCity.comfortCategory}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Current Temperature
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'Outfit' }}>
              {tempUnit === 'C' ? `${selectedCity.temperature.celsius}°C` : `${selectedCity.temperature.fahrenheit}°F`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Range: {selectedCity.temperature.tempMinC}°C to {selectedCity.temperature.tempMaxC}°C
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Humidity & Dew Point
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-indigo)', fontFamily: 'Outfit' }}>
              {selectedCity.humidity}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedCity.humidity < 40 ? 'Dry air' : selectedCity.humidity > 65 ? 'Humid air' : 'Optimal humidity'}
            </div>
          </div>
        </div>

        {/* Visual Formula & Radar Factor Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
          {/* Factor Breakdown Bars */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="var(--accent-cyan)" />
              <span>Biometeorological Factor Breakdown</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Temperature */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>Temperature (Weight: 40%) - {breakdown.temperature?.value}°C</span>
                  <span style={{ fontWeight: 700 }}>{breakdown.temperature?.score} / 100</span>
                </div>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${breakdown.temperature?.score || 50}%`, background: 'var(--accent-cyan)' }} />
                </div>
              </div>

              {/* Humidity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>Humidity (Weight: 25%) - {breakdown.humidity?.value}%</span>
                  <span style={{ fontWeight: 700 }}>{breakdown.humidity?.score} / 100</span>
                </div>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${breakdown.humidity?.score || 50}%`, background: 'var(--accent-indigo)' }} />
                </div>
              </div>

              {/* Wind */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>Wind Speed (Weight: 15%) - {breakdown.windSpeed?.value} m/s</span>
                  <span style={{ fontWeight: 700 }}>{breakdown.windSpeed?.score} / 100</span>
                </div>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${breakdown.windSpeed?.score || 50}%`, background: 'var(--accent-emerald)' }} />
                </div>
              </div>

              {/* Clouds */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>Cloudiness (Weight: 10%) - {breakdown.cloudiness?.value}%</span>
                  <span style={{ fontWeight: 700 }}>{breakdown.cloudiness?.score} / 100</span>
                </div>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${breakdown.cloudiness?.score || 50}%`, background: 'var(--accent-amber)' }} />
                </div>
              </div>

              {/* Pressure */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span>Pressure (Weight: 10%) - {breakdown.pressure?.value} hPa</span>
                  <span style={{ fontWeight: 700 }}>{breakdown.pressure?.score} / 100</span>
                </div>
                <div className="gauge-progress-bar">
                  <div className="gauge-progress-fill" style={{ width: `${breakdown.pressure?.score || 50}%`, background: 'var(--accent-rose)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div style={{ height: '230px', position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Solar & Raw Cache Diagnostics Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Visibility: {((selectedCity.visibility || 10000) / 1000).toFixed(1)} km</span>
            <span>Wind Angle: {selectedCity.windDeg}°</span>
          </div>
          <div>
            Data Source: <span style={{ color: 'var(--accent-cyan)' }}>OpenWeatherMap API ({selectedCity.rawCacheStatus || 'CACHED'})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
