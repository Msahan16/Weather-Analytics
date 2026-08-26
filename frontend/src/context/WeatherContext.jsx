import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WeatherContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/weather';

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheStatus, setCacheStatus] = useState('MISS');
  const [responseTimeMs, setResponseTimeMs] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tempUnit, setTempUnit] = useState('C'); // 'C' or 'F'

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('ALL');
  const [sortBy, setSortBy] = useState('rank'); // 'rank', 'temp_asc', 'temp_desc', 'comfort_desc', 'humidity_asc', 'name_asc'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Modal States
  const [selectedCity, setSelectedCity] = useState(null);
  const [cacheModalOpen, setCacheModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  // Fetch Weather Data
  const fetchWeather = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/all${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch weather analytics: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setWeatherData(data.data || []);
        setCacheStatus(data.cacheStatus || 'MISS');
        setResponseTimeMs(data.responseTimeMs || 0);
        setLastUpdated(data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('[WeatherContext] Error:', err);
      setError(err.message || 'Error connecting to weather API');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Cache Stats
  const fetchCacheStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cache/stats`);
      if (res.ok) {
        const data = await res.json();
        setCacheStats(data.data);
      }
    } catch (err) {
      console.error('[WeatherContext] Error fetching cache stats:', err);
    }
  }, []);

  // Flush Server Cache
  const clearCache = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/cache/clear`, { method: 'POST' });
      if (res.ok) {
        await fetchCacheStats();
        // Immediately fetch refreshed data to show cache MISS transition
        await fetchWeather(true);
      }
    } catch (err) {
      console.error('[WeatherContext] Error clearing cache:', err);
    }
  }, [fetchCacheStats, fetchWeather]);

  // Initial Load
  useEffect(() => {
    fetchWeather();
    fetchCacheStats();
  }, [fetchWeather, fetchCacheStats]);

  // Toggle Temp Unit
  const toggleTempUnit = () => {
    setTempUnit(prev => (prev === 'C' ? 'F' : 'C'));
  };

  // Filtered & Sorted Cities
  const filteredCities = React.useMemo(() => {
    let list = [...weatherData];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.cityName?.toLowerCase().includes(q) || 
        c.country?.toLowerCase().includes(q) ||
        c.weather?.main?.toLowerCase().includes(q)
      );
    }

    // Condition filter
    if (selectedCondition !== 'ALL') {
      list = list.filter(c => c.weather?.main?.toLowerCase() === selectedCondition.toLowerCase());
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return a.rank - b.rank;
        case 'comfort_desc':
          return b.comfortScore - a.comfortScore;
        case 'temp_asc':
          return a.temperature.celsius - b.temperature.celsius;
        case 'temp_desc':
          return b.temperature.celsius - a.temperature.celsius;
        case 'humidity_asc':
          return a.humidity - b.humidity;
        case 'humidity_desc':
          return b.humidity - a.humidity;
        case 'name_asc':
          return a.cityName.localeCompare(b.cityName);
        default:
          return a.rank - b.rank;
      }
    });

    return list;
  }, [weatherData, searchQuery, selectedCondition, sortBy]);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        filteredCities,
        loading,
        error,
        cacheStatus,
        responseTimeMs,
        lastUpdated,
        tempUnit,
        toggleTempUnit,
        fetchWeather,
        searchQuery,
        setSearchQuery,
        selectedCondition,
        setSelectedCondition,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        selectedCity,
        setSelectedCity,
        cacheModalOpen,
        setCacheModalOpen,
        authModalOpen,
        setAuthModalOpen,
        cacheStats,
        fetchCacheStats,
        clearCache
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
