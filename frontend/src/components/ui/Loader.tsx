// React import removed to resolve TS6133


export function Loader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '64px 24px',
      color: 'var(--text-secondary)',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--text-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite',
      }} />
      <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton-pulse" style={{ height: '28px', width: '50%' }} />
      <div className="skeleton-pulse" style={{ height: '16px', width: '70%' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <div className="skeleton-pulse" style={{ height: '32px', width: '90px', borderRadius: 'var(--radius-full)' }} />
        <div className="skeleton-pulse" style={{ height: '32px', width: '120px', borderRadius: 'var(--radius-full)' }} />
      </div>
    </div>
  );
}
