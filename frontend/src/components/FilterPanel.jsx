import React, { useState } from 'react'

export default function FilterPanel({ onFilter, onClear }) {
  const [minMag, setMinMag] = useState('')
  const [after,  setAfter]  = useState('')

  const apply = () => onFilter({
    minMag: minMag !== '' ? parseFloat(minMag) : null,
    after:  after  || null,
  })

  const clear = () => { setMinMag(''); setAfter(''); onClear() }

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: 16,
    }}>
      <div style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.15em', alignSelf: 'center', marginRight: 8 }}>
        FILTER
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.12em' }}>MIN MAG</label>
        <input
          type="number" step="0.1" min="0" max="10"
          placeholder="e.g. 2.0"
          value={minMag}
          onChange={e => setMinMag(e.target.value)}
          style={{ width: 120 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 9, color: 'var(--text)', letterSpacing: '0.12em' }}>AFTER (UTC)</label>
        <input
          type="datetime-local"
          value={after}
          onChange={e => setAfter(e.target.value)}
          style={{ width: 190 }}
        />
      </div>

      <button onClick={apply} style={{
        background: 'var(--accent)',
        border: 'none',
        color: '#000',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: '0.1em',
        padding: '8px 18px',
        borderRadius: 'var(--radius)',
      }}>APPLY</button>

      <button onClick={clear} style={{
        background: 'transparent',
        border: '1px solid var(--border2)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.1em',
        padding: '8px 18px',
        borderRadius: 'var(--radius)',
      }}>RESET</button>
    </div>
  )
}
