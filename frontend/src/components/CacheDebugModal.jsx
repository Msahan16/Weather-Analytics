import React, { useEffect } from 'react';
import { 
  X, 
  Database, 
  Trash2, 
  RefreshCw, 
  Zap, 
  Clock, 
  Layers, 
  CheckCircle 
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export default function CacheDebugModal() {
  const { 
    cacheModalOpen, 
    setCacheModalOpen, 
    cacheStats, 
    fetchCacheStats, 
    clearCache,
    cacheStatus,
    responseTimeMs 
  } = useWeather();

  useEffect(() => {
    if (cacheModalOpen) {
      fetchCacheStats();
    }
  }, [cacheModalOpen, fetchCacheStats]);

  if (!cacheModalOpen) return null;

  const raw = cacheStats?.rawCache || {};
  const processed = cacheStats?.processedCache || {};
  const overall = cacheStats?.overall || {};

  return (
    <div className="modal-overlay" onClick={() => setCacheModalOpen(false)}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '750px' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={() => setCacheModalOpen(false)}
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
            <Database size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Server-Side Cache Inspector</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Two-Tier In-Memory Caching Architecture & Live Telemetry</div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-glass-strong)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Last Request</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cacheStatus === 'HIT' ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '0.2rem' }}>
              {cacheStatus}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latency: {responseTimeMs}ms</div>
          </div>

          <div style={{ background: 'var(--bg-glass-strong)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Global Hit Ratio</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
              {overall.hitRatio || '0%'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hits: {overall.totalHits || 0} / Misses: {overall.totalMisses || 0}</div>
          </div>

          <div style={{ background: 'var(--bg-glass-strong)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Configured TTL</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-indigo)', marginTop: '0.2rem' }}>
              300s
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5-Minute Freshness Window</div>
          </div>
        </div>

        {/* Two Tier Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Tier 1: Raw Weather API Cache */}
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="var(--accent-cyan)" />
                <span>Tier 1: Raw API Cache</span>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-glass-strong)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {raw.keyCount || 0} Cities Cached
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hits:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{raw.hits || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Misses:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{raw.misses || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hit Rate:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{raw.hitRate || '0%'}</span>
              </div>
            </div>
          </div>

          {/* Tier 2: Processed Analytics Cache */}
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={15} color="var(--accent-indigo)" />
                <span>Tier 2: Processed Analytics</span>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-glass-strong)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {processed.keyCount || 0} Datasets Cached
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hits:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{processed.hits || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Misses:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{processed.misses || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hit Rate:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>{processed.hitRate || '0%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cache Entries List */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            Active Key Entries & Remaining TTL
          </div>
          <div style={{ maxHeight: '140px', overflowY: 'auto', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', padding: '0.5rem' }}>
            {raw.entries && raw.entries.length > 0 ? (
              raw.entries.map((entry) => (
                <div key={entry.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{entry.key}</span>
                  <span style={{ color: 'var(--text-muted)' }}>TTL: {entry.ttlRemainingSec}s remaining</span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem' }}>
                No active raw keys in cache.
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
          <button 
            className="btn btn-glass"
            onClick={fetchCacheStats}
          >
            <RefreshCw size={15} />
            <span>Refresh Stats</span>
          </button>

          <button 
            className="btn"
            style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '1px solid rgba(244, 63, 94, 0.4)' }}
            onClick={clearCache}
          >
            <Trash2 size={15} />
            <span>Flush Cache (Test MISS)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
