import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const variantMap = {
  default: { bg: 'var(--bg-surface-hover)', color: 'var(--text-primary)' },
  primary: { bg: 'rgba(10, 132, 255, 0.15)', color: 'var(--accent-blue)' },
  success: { bg: 'rgba(48, 209, 88, 0.15)', color: 'var(--accent-green)' },
  warning: { bg: 'rgba(255, 159, 10, 0.15)', color: '#FF9F0A' },
  danger:  { bg: 'rgba(255, 69, 58, 0.15)', color: 'var(--accent-red)' },
};

export function Badge({ children, variant = 'default', size = 'md', style }: BadgeProps) {
  const colors = variantMap[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '4px 10px' : '6px 14px',
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        background: colors.bg,
        color: colors.color,
        border: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
