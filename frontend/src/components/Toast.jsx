import React from 'react'

export default function Toast({ toast }) {
  if (!toast) return null
  const isErr = toast.type === 'error'
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      background: isErr ? '#1a0a0a' : '#0a1a10',
      border: `1px solid ${isErr ? 'var(--red)' : 'var(--green)'}`,
      color: 'var(--text)',
      padding: '12px 20px',
      borderRadius: 'var(--radius)',
      fontSize: 12,
      zIndex: 9999,
      letterSpacing: '0.05em',
      boxShadow: isErr ? 'var(--glow-red)' : '0 0 20px rgba(0,230,118,0.2)',
      animation: 'slide-in 0.25s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ color: isErr ? 'var(--red)' : 'var(--green)', fontSize: 14 }}>
        {isErr ? '✕' : '✓'}
      </span>
      {toast.msg}
    </div>
  )
}
