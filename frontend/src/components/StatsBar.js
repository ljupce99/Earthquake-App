import React from 'react';

const s = {
  bar: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '12px 20px',
    flex: '1 1 120px',
    minWidth: 110,
  },
  label: { fontSize: 11, color: '#64748b', fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 },
  value: { fontSize: 24, fontWeight: 700, fontFamily: "'Space Mono',monospace" },
};

export default function StatsBar({ earthquakes }) {
  const total = earthquakes.length;
  const maxMag = total > 0 ? Math.max(...earthquakes.map(e => e.magnitude || 0)) : 0;
  const avg = total > 0
    ? (earthquakes.reduce((s, e) => s + (e.magnitude || 0), 0) / total).toFixed(2)
    : '—';
  const tsunamis = earthquakes.filter(e => e.tsunami === 1).length;

  const stats = [
    { label: 'Total', value: total, color: '#f97316' },
    { label: 'Max Mag', value: maxMag > 0 ? maxMag.toFixed(1) : '—', color: maxMag >= 5 ? '#ef4444' : maxMag >= 3 ? '#eab308' : '#22c55e' },
    { label: 'Avg Mag', value: avg, color: '#94a3b8' },
    { label: 'Tsunamis', value: tsunamis, color: tsunamis > 0 ? '#ef4444' : '#475569' },
  ];

  return (
    <div style={s.bar}>
      {stats.map(({ label, value, color }) => (
        <div key={label} style={s.card}>
          <div style={s.label}>{label}</div>
          <div style={{ ...s.value, color }}>{value}</div>
        </div>
      ))}
    </div>
  );
}
