import React from 'react';
import { 
  CloudSun, 
  Sun, 
  Moon, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { 
    cacheStatus, 
    responseTimeMs, 
    fetchWeather, 
    loading, 
    tempUnit, 
    toggleTempUnit,
    setCacheModalOpen,
    setAuthModalOpen 
  } = useWeather();

  return (
    <header className="navbar glass-panel">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <CloudSun size={24} />
        </div>
        <div>
          <div className="brand-name">AeroComfort</div>
          <div className="brand-tagline">Weather & Biometeorological Analytics</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Cache Telemetry Badge */}
        <button 
          className={`cache-badge ${cacheStatus === 'MISS' ? 'miss' : ''}`}
          onClick={() => setCacheModalOpen(true)}
          title="Click to view Server-Side Cache Telemetry"
        >
          <Database size={13} />
          <span>Cache {cacheStatus}</span>
          <span style={{ opacity: 0.7, fontSize: '0.68rem' }}>({responseTimeMs}ms)</span>
        </button>

        {/* Temperature Unit Toggle */}
        <button 
          className="btn btn-glass" 
          onClick={toggleTempUnit}
          title={`Switch to ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          <span style={{ fontWeight: 700 }}>°{tempUnit}</span>
        </button>

        {/* Refresh Data */}
        <button 
          className={`btn btn-glass btn-icon ${loading ? 'spin' : ''}`}
          onClick={() => fetchWeather(true)}
          title="Force Refresh Live Data"
        >
          <RefreshCw size={17} className={loading ? 'spin-anim' : ''} />
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-glass btn-icon" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Auth0 & Security Portal */}
        <button 
          className="btn btn-primary"
          onClick={() => setAuthModalOpen(true)}
        >
          <ShieldCheck size={16} />
          <span>Auth0 SSO</span>
        </button>
      </div>
    </header>
  );
}
