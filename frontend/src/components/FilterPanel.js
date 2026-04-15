import React, { useState } from 'react';

const s = {
  panel: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '16px 20px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-end',
  },
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 11, color: '#64748b', fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: {
    background: '#263248',
    border: '1px solid #334155',
    color: '#e2e8f0',
    borderRadius: 6,
    padding: '7px 12px',
    fontSize: 13,
    outline: 'none',
    width: 160,
  },
  btn: (variant) => ({
    padding: '8px 18px',
    borderRadius: 6,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: variant === 'primary' ? '#f97316' : variant === 'ghost' ? 'transparent' : '#263248',
    color: variant === 'primary' ? '#0f172a' : '#e2e8f0',
    transition: 'opacity 0.15s',
  }),
};

export default function FilterPanel({ onFilter, onClear }) {
  const [minMag, setMinMag] = useState('');
  const [after, setAfter] = useState('');

  const handleApply = () => {
    onFilter({
      minMag: minMag !== '' ? parseFloat(minMag) : null,
      after: after || null,
    });
  };

  const handleClear = () => {
    setMinMag('');
    setAfter('');
    onClear();
  };

  return (
    <div style={s.panel}>
      <div style={s.group}>
        <label style={s.label}>Min Magnitude</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          placeholder="e.g. 3.0"
          value={minMag}
          onChange={e => setMinMag(e.target.value)}
          style={s.input}
        />
      </div>
      <div style={s.group}>
        <label style={s.label}>After (UTC)</label>
        <input
          type="datetime-local"
          value={after}
          onChange={e => setAfter(e.target.value)}
          style={{ ...s.input, width: 200 }}
        />
      </div>
      <button style={s.btn('primary')} onClick={handleApply}>Apply Filter</button>
      <button style={s.btn('ghost')} onClick={handleClear}>Clear</button>
    </div>
  );
}
