import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useWeather } from '../context/WeatherContext';
import { BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsChart() {
  const { weatherData } = useWeather();

  if (!weatherData || weatherData.length === 0) return null;

  // Display top 8 cities
  const displayCities = weatherData.slice(0, 8);

  const data = {
    labels: displayCities.map(c => c.cityName),
    datasets: [
      {
        label: 'Comfort Index (0-100)',
        data: displayCities.map(c => c.comfortScore),
        backgroundColor: 'rgba(56, 189, 248, 0.8)',
        borderRadius: 6
      },
      {
        label: 'Temperature (°C)',
        data: displayCities.map(c => c.temperature.celsius),
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderRadius: 6
      },
      {
        label: 'Humidity (%)',
        data: displayCities.map(c => c.humidity),
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { family: 'Outfit', size: 14 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } },
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Comparative Comfort vs Climate Breakdown</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top monitored cities biometeorological correlation</div>
          </div>
        </div>
      </div>

      <div style={{ height: '260px', width: '100%' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
