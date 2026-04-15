import React, { useState } from 'react'
import { format } from 'date-fns'

function magColor(mag) {
  if (mag >= 5) return '#ff3d3d'
  if (mag >= 3) return '#ff8c00'
  if (mag >= 2) return '#ffe600'
  return '#00e676'
}

export default function EarthquakeTable({ earthquakes, onDelete, loading }) {
  const [hovered, setHovered] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text)' }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ letterSpacing: '0.15em', fontSize: 10 }}>LOADING SEISMIC DATA...</div>
    </div>
  )

  if (!earthquakes?.length) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text)', letterSpacing: '0.1em', fontSize: 11 }}>
      NO EVENTS FOUND — SYNC USGS OR ADJUST FILTERS
    </div>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['MAG', 'TYPE', 'LOCATION', 'TIME (UTC)', ''].map(h => (
              <th key={h} style={{
                padding: '10px 20px',
                textAlign: 'left',
                fontSize: 9,
                color: 'var(--text)',
                letterSpacing: '0.15em',
                fontWeight: 400,
                whiteSpace: 'nowrap',
                background: 'var(--surface)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {earthquakes.map((eq, i) => (
            <tr
              key={eq.id ?? i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                borderBottom: '1px solid var(--border)',
                background: hovered === i ? 'var(--surface2)' : 'transparent',
                transition: 'background 0.12s',
                animation: `slide-in 0.3s ease ${i * 0.03}s both`,
              }}
            >
              {/* Magnitude */}
              <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 4,
                    height: 36,
                    background: magColor(eq.magnitude),
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${magColor(eq.magnitude)}80`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: magColor(eq.magnitude),
                    lineHeight: 1,
                  }}>
                    {eq.magnitude != null ? eq.magnitude.toFixed(1) : '—'}
                  </span>
                </div>
              </td>

              {/* Type */}
              <td style={{ padding: '12px 20px' }}>
                <span style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  padding: '2px 8px',
                  borderRadius: 3,
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                }}>
                  {eq.magType?.toUpperCase() || '—'}
                </span>
              </td>

              {/* Place */}
              <td style={{ padding: '12px 20px', maxWidth: 340 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                  {eq.place || 'Unknown location'}
                </div>
                {eq.title && eq.title !== eq.place && (
                  <div style={{ fontSize: 10, color: 'var(--text)', letterSpacing: '0.04em' }}>
                    {eq.title}
                  </div>
                )}
              </td>

              {/* Time */}
              <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {eq.time ? format(new Date(eq.time), 'yyyy-MM-dd') : '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text)', letterSpacing: '0.04em' }}>
                  {eq.time ? format(new Date(eq.time), 'HH:mm:ss') : ''}
                </div>
              </td>

              {/* Delete */}
              <td style={{ padding: '12px 20px' }}>
                {confirmId === (eq.id ?? i) ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { onDelete(eq.id); setConfirmId(null) }}
                      style={{ background: 'var(--red)', border: 'none', color: '#fff', fontSize: 10, padding: '4px 10px', borderRadius: 3, letterSpacing: '0.08em' }}
                    >CONFIRM</button>
                    <button
                      onClick={() => setConfirmId(null)}
                      style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text-muted)', fontSize: 10, padding: '4px 10px', borderRadius: 3 }}
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(eq.id ?? i)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: 10,
                      padding: '4px 12px',
                      borderRadius: 3,
                      letterSpacing: '0.08em',
                      opacity: hovered === i ? 1 : 0,
                      transition: 'opacity 0.15s',
                    }}
                  >DELETE</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
