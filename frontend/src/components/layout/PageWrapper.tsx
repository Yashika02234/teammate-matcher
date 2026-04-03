import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  maxWidth?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
}

export function PageWrapper({ children, title, subtitle, maxWidth = '1000px', actions, showBack }: PageWrapperProps) {
  const navigate = useNavigate();
  
  return (
    <main style={{ minHeight: 'calc(100vh - 64px)', padding: '64px 24px 120px' }}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        {showBack && (
          <div style={{ marginBottom: '24px' }}>
             <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ padding: '6px 12px', marginLeft: '-12px' }}>
               ← Back
             </Button>
          </div>
        )}
        {(title || subtitle) && (
          <header style={{ 
            marginBottom: '48px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            <div>
              {title && (
                <h1 style={{ marginBottom: '12px', fontSize: '2.5rem', letterSpacing: '-0.04em' }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ fontSize: '1.1rem', maxWidth: '600px', color: 'var(--text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {actions}
              </div>
            )}
          </header>
        )}
        <div className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </main>
  );
}
