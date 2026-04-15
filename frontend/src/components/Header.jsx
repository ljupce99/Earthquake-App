import React from 'react'
import { format } from 'date-fns'

export default function Header({ fetching, onFetch, lastUpdated, total }) {
  return (
    <header style={{
      background: 'rgba(8,12,16,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 28, height: 28 }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: 'var(--accent2)',
            opacity: 0.9,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--accent2)',
            animation: 'pulse-ring 1.8s ease-out infinite',
          }} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            lineHeight: 1,
          }}>
            SEISMIC<span style={{ color: 'var(--accent)' }}>MONITOR</span>
          </div>
          <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.15em', marginTop: 2 }}>
            USGS LIVE FEED
          </div>
        </div>
      </div>

      {/* Center status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.12em' }}>EVENTS</div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--accent)', lineHeight: 1.2 }}>{total}</div>
        </div>
        <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.12em' }}>LAST SYNC</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>
            {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : '—'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--green)',
            animation: 'blink 2s ease infinite',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text)', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      </div>

      {/* Fetch button */}
      <button
        onClick={onFetch}
        disabled={fetching}
        style={{
          background: fetching ? 'transparent' : 'var(--accent)',
          border: `1px solid ${fetching ? 'var(--border2)' : 'var(--accent)'}`,
          color: fetching ? 'var(--text-muted)' : '#000',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: '0.1em',
          padding: '8px 20px',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          cursor: fetching ? 'not-allowed' : 'pointer',
        }}
      >
        {fetching
          ? <span style={{ width: 12, height: 12, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          : <span>⟳</span>
        }
        {fetching ? 'FETCHING...' : 'SYNC USGS'}
      </button>
    </header>
  )
}
