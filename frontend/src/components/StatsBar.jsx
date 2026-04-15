import React from 'react'

function magColor(mag) {
  if (mag >= 5) return 'var(--red)'
  if (mag >= 3) return 'var(--orange)'
  if (mag >= 2) return 'var(--yellow)'
  return 'var(--green)'
}

export default function StatsBar({ earthquakes }) {
  const total  = earthquakes.length
  const maxMag = total ? Math.max(...earthquakes.map(e => e.magnitude || 0)) : 0
  const avg    = total ? (earthquakes.reduce((s, e) => s + (e.magnitude || 0), 0) / total) : 0
  const strong = earthquakes.filter(e => (e.magnitude || 0) >= 4).length

  const stats = [
    { label: 'TOTAL EVENTS',  value: total,                 color: 'var(--accent)',  sub: 'filtered' },
    { label: 'MAX MAGNITUDE', value: maxMag > 0 ? maxMag.toFixed(1) : '—', color: magColor(maxMag), sub: maxMag >= 5 ? 'MAJOR' : maxMag >= 3 ? 'MODERATE' : 'MINOR' },
    { label: 'AVG MAGNITUDE', value: avg > 0 ? avg.toFixed(2) : '—', color: 'var(--text)', sub: 'mean' },
    { label: 'M4+ EVENTS',    value: strong,                color: strong > 0 ? 'var(--red)' : 'var(--text)', sub: strong > 0 ? 'attention' : 'none' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)' }}>
      {stats.map(({ label, value, color, sub }) => (
        <div key={label} style={{
          background: 'var(--surface)',
          padding: '16px 24px',
          animation: 'fade-in 0.4s ease',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.15em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.1em', marginTop: 4 }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}
