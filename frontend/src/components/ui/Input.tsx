import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftSlot?: React.ReactNode;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function Input({ label, error, hint, leftSlot, id, style, ...rest }: InputProps) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <label htmlFor={inputId} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {leftSlot && (
          <div style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none',
          }}>
            {leftSlot}
          </div>
        )}
        <input
          id={inputId}
          style={{
            paddingLeft: leftSlot ? '48px' : '16px',
            borderColor: error ? 'var(--accent-red)' : undefined,
            ...style,
          }}
          {...rest}
        />
      </div>
      {error && <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{hint}</span>}
    </div>
  );
}

export function Select({ label, error, hint, options, id, style, ...rest }: SelectProps) {
  const selectId = id ?? `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <label htmlFor={selectId} style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        id={selectId}
        style={{
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23EBEBF599' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
          paddingRight: '40px',
          borderColor: error ? 'var(--accent-red)' : undefined,
          ...style,
        }}
        {...rest}
      >
        <option value="" disabled>Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-surface)' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{hint}</span>}
    </div>
  );
}
