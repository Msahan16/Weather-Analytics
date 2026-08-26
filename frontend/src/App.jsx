import React from 'react';
import Navbar from './components/Navbar';
import HeroStats from './components/HeroStats';
import FilterSortBar from './components/FilterSortBar';
import WeatherCard from './components/WeatherCard';
import TableView from './components/TableView';
import AnalyticsChart from './components/AnalyticsChart';
import CityDetailModal from './components/CityDetailModal';
import CacheDebugModal from './components/CacheDebugModal';
import AuthGuideModal from './components/AuthGuideModal';
import { useWeather } from './context/WeatherContext';
import { AlertTriangle, CloudSun, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const { 
    filteredCities, 
    loading, 
    error, 
    viewMode, 
    fetchWeather, 
    lastUpdated 
  } = useWeather();

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Error Banner */}
        {error && (
          <div 
            className="glass-panel" 
            style={{ 
              background: 'rgba(244, 63, 94, 0.15)', 
              borderColor: 'rgba(244, 63, 94, 0.3)', 
              color: '#fda4af', 
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
            <button className="btn btn-glass" onClick={() => fetchWeather(true)}>
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Hero Section */}
        <HeroStats />

        {/* Analytics Comparison Chart */}
        <AnalyticsChart />

        {/* Filter, Search and Sorting Toolbar */}
        <FilterSortBar />

        {/* City Weather Grid or Table */}
        {loading && filteredCities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <CloudSun size={48} color="var(--accent-cyan)" className="spin-anim" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Computing Comfort Indices & Atmospheric Data...</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Retrieving weather telemetry and evaluating biometeorological matrices</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No cities match your current search or filter.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try clearing your search query or selecting "ALL" conditions.</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="weather-cards-grid">
            {filteredCities.map((city) => (
              <WeatherCard key={city.cityCode} city={city} />
            ))}
          </div>
        ) : (
          <TableView />
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div>
          <span>AeroComfort Weather Analytics • Developed for </span>
          <strong style={{ color: 'var(--text-secondary)' }}>Fidenz Full Stack Assignment</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Last Computed: {lastUpdated || 'Live'}</span>
          <span>•</span>
          <span>Server-Side Caching (5m TTL)</span>
        </div>
      </footer>

      {/* Modals */}
      <CityDetailModal />
      <CacheDebugModal />
      <AuthGuideModal />
    </div>
  );
}
