import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { ArrowUpRight } from 'lucide-react';

export default function TableView() {
  const { filteredCities, tempUnit, setSelectedCity } = useWeather();

  return (
    <div className="glass-panel table-container">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>City</th>
            <th>Condition</th>
            <th>Temp ({tempUnit === 'C' ? '°C' : '°F'})</th>
            <th>Humidity</th>
            <th>Wind</th>
            <th>Pressure</th>
            <th>Comfort Index</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCities.map((city) => (
            <tr key={city.cityCode} onClick={() => setSelectedCity(city)} style={{ cursor: 'pointer' }}>
              <td style={{ fontWeight: 800 }}>#{city.rank}</td>
              <td>
                <div style={{ fontWeight: 700 }}>{city.cityName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.country}</div>
              </td>
              <td style={{ textTransform: 'capitalize' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {city.weather.iconUrl && (
                    <img src={city.weather.iconUrl} alt={city.weather.main} style={{ width: '24px', height: '24px' }} />
                  )}
                  <span>{city.weather.description}</span>
                </div>
              </td>
              <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {tempUnit === 'C' ? `${city.temperature.celsius}°C` : `${city.temperature.fahrenheit}°F`}
              </td>
              <td>{city.humidity}%</td>
              <td>{city.windSpeed} m/s</td>
              <td>{city.pressure} hPa</td>
              <td>
                <span 
                  style={{ 
                    fontWeight: 800, 
                    fontSize: '1.05rem', 
                    color: city.comfortColor,
                    fontFamily: 'Outfit, sans-serif'
                  }}
                >
                  {city.comfortScore}
                </span>
              </td>
              <td>
                <span 
                  style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    backgroundColor: `${city.comfortColor}22`,
                    color: city.comfortColor
                  }}
                >
                  {city.comfortCategory}
                </span>
              </td>
              <td>
                <button 
                  className="btn btn-glass"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(city);
                  }}
                >
                  <span>Details</span>
                  <ArrowUpRight size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
