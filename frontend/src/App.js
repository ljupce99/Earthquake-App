import React, { useState, useEffect, useCallback } from 'react';
import EarthquakeTable from './components/EarthquakeTable';
import EarthquakeMap from './components/EarthquakeMap';
import FilterPanel from './components/FilterPanel';
import StatsBar from './components/StatsBar';
import { earthquakeService } from './services/earthquakeService';

const s = {
  app: { minHeight: '100vh', background: '#0f172a', padding: '0 0 60px' },
  header: {
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  logo: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 18,
    fontWeight: 700,
    color: '#f97316',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  main: { maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
  cardHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontFamily: "'Space Mono',monospace", fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardBody: { padding: '16px 20px' },
  btn: (variant) => ({
    padding: '8px 18px',
    borderRadius: 6,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: variant === 'primary' ? '#f97316' : '#263248',
    color: variant === 'primary' ? '#0f172a' : '#e2e8f0',
    transition: 'opacity 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }),
  toast: (type) => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    background: type === 'error' ? '#7f1d1d' : '#14532d',
    border: `1px solid ${type === 'error' ? '#ef4444' : '#22c55e'}`,
    color: '#e2e8f0',
    borderRadius: 8,
    padding: '12px 20px',
    fontSize: 13,
    zIndex: 9999,
    maxWidth: 380,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }),
  tabBar: { display: 'flex', gap: 4, padding: '0 20px', borderBottom: '1px solid #334155' },
  tab: (active) => ({
    padding: '12px 18px',
    background: 'transparent',
    border: 'none',
    color: active ? '#f97316' : '#64748b',
    borderBottom: active ? '2px solid #f97316' : '2px solid transparent',
    fontFamily: "'Space Mono',monospace",
    fontSize: 12,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    transition: 'color 0.15s',
    marginBottom: -1,
  }),
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(249,115,22,0.3)',
    borderTopColor: '#f97316',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};

export default function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('table');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await earthquakeService.getAll();
      const data = res.data || [];
      setEarthquakes(data);
      setDisplayList(data);
    } catch {
      showToast('Failed to load earthquakes from server', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleFetch = async () => {
    setFetching(true);
    try {
      const res = await earthquakeService.fetchAndRefresh();
      const data = res.data || [];
      setEarthquakes(data);
      setDisplayList(data);
      showToast(`Fetched ${data.length} earthquakes (mag > 2.0)`);
    } catch {
      showToast('Failed to fetch from USGS API', 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await earthquakeService.deleteById(id);
      const updated = earthquakes.filter(e => e.id !== id);
      setEarthquakes(updated);
      setDisplayList(prev => prev.filter(e => e.id !== id));
      showToast('Earthquake record deleted');
    } catch {
      showToast('Failed to delete record', 'error');
    }
  };

  const handleFilter = async ({ minMag, after }) => {
    setLoading(true);
    try {
      let res;
      if (minMag !== null && after) {
        const iso = new Date(after).toISOString();
        res = await earthquakeService.filterCombined(minMag, iso);
      } else if (minMag !== null) {
        res = await earthquakeService.filterByMagnitude(minMag);
      } else if (after) {
        const iso = new Date(after).toISOString();
        res = await earthquakeService.filterAfter(iso);
      } else {
        setDisplayList(earthquakes);
        setLoading(false);
        return;
      }
      setDisplayList(res.data || []);
      showToast(`Filter applied — ${(res.data || []).length} results`);
    } catch {
      showToast('Filter request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => setDisplayList(earthquakes);

  return (
    <div style={s.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <span>⚡</span> Earthquake Monitor
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: 12, fontFamily: "'Space Mono',monospace" }}>
            USGS Live Feed
          </span>
          <button style={s.btn('primary')} onClick={handleFetch} disabled={fetching}>
            {fetching ? <span style={s.spinner} /> : '↻'}
            {fetching ? 'Fetching…' : 'Fetch Latest'}
          </button>
        </div>
      </header>

      <main style={s.main}>
        {/* Stats */}
        <StatsBar earthquakes={displayList} />

        {/* Filters */}
        <div>
          <div style={{ fontSize: 11, color: '#64748b', fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            Filters
          </div>
          <FilterPanel onFilter={handleFilter} onClear={handleClear} />
        </div>

        {/* Table / Map tabs */}
        <div style={s.card}>
          <div style={s.tabBar}>
            {['table', 'map'].map(tab => (
              <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                {tab === 'table' ? '▤ Table' : '⊕ Map'}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', alignSelf: 'center', paddingRight: 4 }}>
              <span style={{ fontSize: 11, color: '#475569', fontFamily: "'Space Mono',monospace" }}>
                {displayList.length} events
              </span>
            </div>
          </div>

          <div style={{ padding: activeTab === 'map' ? 16 : 0 }}>
            {activeTab === 'table'
              ? <EarthquakeTable earthquakes={displayList} onDelete={handleDelete} loading={loading} />
              : <EarthquakeMap earthquakes={displayList} />
            }
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div style={s.toast(toast.type)}>{toast.msg}</div>
      )}
    </div>
  );
}
