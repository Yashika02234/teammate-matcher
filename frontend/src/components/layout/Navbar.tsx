import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Find Matches', href: '/find-teammates' },
  { label: 'Projects',  href: '/projects' },
  { label: 'Requests', href: '/requests' },
  { label: 'Chat', href: '/chat' }
];

export function Navbar() {
  const { isLoggedIn, userId, logout } = useAuth();
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: '64px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--accent-complex)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '14px',
          }}>
            S
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            SyncUp
          </span>
        </Link>

        {/* Center Nav */}
        {isLoggedIn && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', background: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            {navLinks.map((link) => {
              const active = location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: active ? 'var(--bg-color)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    background: active ? 'var(--text-primary)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Auth / Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoggedIn ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px 6px 6px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {userId}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
