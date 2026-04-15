import React, { useState } from 'react'
import Header from './components/Header.jsx'
import StatsBar from './components/StatsBar.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import EarthquakeTable from './components/EarthquakeTable.jsx'
import EarthquakeMap from './components/EarthquakeMap.jsx'
import Toast from './components/Toast.jsx'
import { useEarthquakes } from './hooks/useEarthquakes'

export default function App() {
  const [tab, setTab] = useState('table')
  const {
    display, loading, fetching, toast, lastUpdated,
    fetchLatest, applyFilter, clearFilter, deleteOne,
  } = useEarthquakes()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        fetching={fetching}
        onFetch={fetchLatest}
        lastUpdated={lastUpdated}
        total={display.length}
      />

      <StatsBar earthquakes={display} />

      <FilterPanel onFilter={applyFilter} onClear={clearFilter} />

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '0 32px',
      }}>
        {['table', 'map'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.15em',
              padding: '12px 20px',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {t === 'table' ? '▤ TABLE' : '⊕ MAP'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>
          {display.length} EVENTS
        </div>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--bg2)' }}>
        {tab === 'table'
          ? <EarthquakeTable earthquakes={display} onDelete={deleteOne} loading={loading} />
          : <EarthquakeMap earthquakes={display} />
        }
      </div>

      <Toast toast={toast} />
    </div>
  )
}
