import React from 'react';
import { 
  CloudSun, 
  Sun, 
  Moon, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  LogOut, 
  UserCheck, 
  KeyRound 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { 
    cacheStatus, 
    responseTimeMs, 
    fetchWeather, 
    loading, 
    tempUnit, 
    toggleTempUnit,
    setCacheModalOpen 
  } = useWeather();
  const { user, logout } = useAuth();

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
          className={`btn btn-glass btn-icon`}
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

        {/* Authenticated User Status & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.12)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                borderRadius: 'var(--radius-md)', 
                padding: '0.35rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Authenticated via Auth0 MFA Whitelist"
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px #10b981' }} />
              <div style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.email}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>MFA Verified • Whitelisted</div>
              </div>
            </div>

            <button 
              className="btn btn-glass btn-icon" 
              onClick={logout}
              title="Log Out Session"
              style={{ color: '#fda4af' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
