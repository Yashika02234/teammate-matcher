import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: '#F5F5F7',
    color: '#000',
    border: 'none',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#F5F5F7',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    background: 'rgba(255, 69, 58, 0.15)',
    color: '#FF453A',
    border: '1px solid rgba(255, 69, 58, 0.3)',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' },
  md: { padding: '10px 20px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)' },
  lg: { padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        width: fullWidth ? '100%' : 'auto',
        letterSpacing: '-0.01em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
          if (variant === 'primary') {
            (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
          } else if (variant === 'secondary') {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.15)';
          }
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.background = variantStyles[variant].background as string;
      }}
      {...rest}
    >
      {isLoading ? (
        <span style={{
          width: '18px',
          height: '18px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.6s linear infinite',
        }} />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
}
