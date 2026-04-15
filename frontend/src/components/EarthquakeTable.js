import React from 'react';
import { format } from 'date-fns';

const MAG_COLOR = (mag) => {
  if (mag >= 5) return '#ef4444';
  if (mag >= 3) return '#eab308';
  return '#22c55e';
};

const styles = {
  wrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    background: '#263248',
    color: '#94a3b8',
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '10px 14px',
    textAlign: 'left',
    borderBottom: '1px solid #334155',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid #1e293b',
    color: '#e2e8f0',
    verticalAlign: 'middle',
  },
  trHover: { background: 'rgba(249,115,22,0.06)' },
  magBadge: (mag) => ({
    display: 'inline-block',
    background: MAG_COLOR(mag),
    color: '#0f172a',
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 4,
    minWidth: 42,
    textAlign: 'center',
  }),
  deleteBtn: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.35)',
    color: '#ef4444',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  usgsLink: { color: '#f97316', textDecoration: 'none', fontSize: 12 },
  empty: { textAlign: 'center', padding: 40, color: '#64748b' },
  tsunamiTag: {
    background: 'rgba(239,68,68,0.18)',
    color: '#fca5a5',
    borderRadius: 4,
    padding: '1px 6px',
    fontSize: 11,
    marginLeft: 6,
  },
};

export default function EarthquakeTable({ earthquakes, onDelete, loading }) {
  const [hovered, setHovered] = React.useState(null);

  if (loading) return (
    <div style={styles.empty}>
      <span style={{ fontFamily: "'Space Mono',monospace", color: '#f97316' }}>
        Loading seismic data…
      </span>
    </div>
  );

  if (!earthquakes || earthquakes.length === 0) return (
    <div style={styles.empty}>No earthquakes found. Try fetching new data.</div>
  );

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Mag', 'Type', 'Place', 'Depth (km)', 'Time (UTC)', 'Tsunami', 'Link', 'Action'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {earthquakes.map((eq) => (
            <tr
              key={eq.id}
              onMouseEnter={() => setHovered(eq.id)}
              onMouseLeave={() => setHovered(null)}
              style={hovered === eq.id ? { ...styles.trHover } : {}}
            >
              <td style={styles.td}>
                <span style={styles.magBadge(eq.magnitude)}>
                  {eq.magnitude != null ? eq.magnitude.toFixed(1) : 'N/A'}
                </span>
              </td>
              <td style={{ ...styles.td, fontFamily: "'Space Mono',monospace", color: '#94a3b8', fontSize: 12 }}>
                {eq.magType || '—'}
              </td>
              <td style={{ ...styles.td, maxWidth: 280 }}>{eq.place || 'Unknown location'}</td>
              <td style={{ ...styles.td, color: '#94a3b8', fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
                {eq.depth != null ? eq.depth.toFixed(1) : '—'}
              </td>
              <td style={{ ...styles.td, whiteSpace: 'nowrap', fontFamily: "'Space Mono',monospace", fontSize: 12, color: '#94a3b8' }}>
                {eq.time ? format(new Date(eq.time), 'yyyy-MM-dd HH:mm:ss') : '—'}
              </td>
              <td style={styles.td}>
                {eq.tsunami === 1
                  ? <span style={styles.tsunamiTag}>⚠ YES</span>
                  : <span style={{ color: '#475569', fontSize: 12 }}>No</span>}
              </td>
              <td style={styles.td}>
                {eq.url
                  ? <a href={eq.url} target="_blank" rel="noopener noreferrer" style={styles.usgsLink}>USGS ↗</a>
                  : '—'}
              </td>
              <td style={styles.td}>
                <button style={styles.deleteBtn} onClick={() => onDelete(eq.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
