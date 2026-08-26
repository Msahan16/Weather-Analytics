import React from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  X 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

const CONDITIONS = ['ALL', 'Clear', 'Clouds', 'Rain', 'Mist', 'Drizzle', 'Thunderstorm'];

export default function FilterSortBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCondition,
    setSelectedCondition,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filteredCities,
    weatherData
  } = useWeather();

  return (
    <div className="glass-panel filter-sort-bar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search city, country, or condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Condition Pills */}
      <div className="filter-pills">
        {CONDITIONS.map(cond => (
          <button
            key={cond}
            className={`filter-pill ${selectedCondition === cond ? 'active' : ''}`}
            onClick={() => setSelectedCondition(cond)}
          >
            {cond}
          </button>
        ))}
      </div>

      {/* Sorting & View Controls */}
      <div className="sort-select-wrapper">
        <SlidersHorizontal size={16} color="var(--text-muted)" />
        <select
          className="select-dropdown"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rank">Sort: Comfort Rank (1st → Last)</option>
          <option value="comfort_desc">Sort: Highest Comfort Score</option>
          <option value="temp_asc">Sort: Temperature (Cold → Warm)</option>
          <option value="temp_desc">Sort: Temperature (Warm → Cold)</option>
          <option value="humidity_asc">Sort: Humidity (Low → High)</option>
          <option value="humidity_desc">Sort: Humidity (High → Low)</option>
          <option value="name_asc">Sort: Alphabetical (A → Z)</option>
        </select>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-glass)' }}>
          <button
            className={`btn-icon btn-glass`}
            style={{ width: '32px', height: '32px', borderRadius: '6px', background: viewMode === 'cards' ? 'var(--bg-glass-strong)' : 'transparent', border: 'none' }}
            onClick={() => setViewMode('cards')}
            title="Grid Card View"
          >
            <LayoutGrid size={15} color={viewMode === 'cards' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
          </button>
          <button
            className={`btn-icon btn-glass`}
            style={{ width: '32px', height: '32px', borderRadius: '6px', background: viewMode === 'table' ? 'var(--bg-glass-strong)' : 'transparent', border: 'none' }}
            onClick={() => setViewMode('table')}
            title="Analytics Table View"
          >
            <List size={15} color={viewMode === 'table' ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
          </button>
        </div>
      </div>
    </div>
  );
}
