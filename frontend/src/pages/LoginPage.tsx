import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractError } from '../utils/helpers';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = location.search.includes('session=expired');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string })?.from ?? '/find-teammates';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both user ID and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper maxWidth="440px">
      <div style={{
        background: 'linear-gradient(145deg, #0d1424, #131c30)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        padding: '40px',
        animation: 'fadeInUp 0.4s ease both',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 0 32px rgba(99,102,241,0.35)',
          }}>✦</div>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#f1f5f9' }}>Welcome back</h2>
        <p style={{ textAlign: 'center', marginBottom: '32px', fontSize: '0.9rem', color: '#64748b' }}>
          Log in to access your matches
        </p>

        {sessionExpired && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#f59e0b',
          }}>
            ⚠️ Your session expired. Please log in again.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            id="login-userid"
            label="User ID"
            type="text"
            placeholder="your_user_id"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#ef4444',
            }}>
              {error}
            </div>
          )}

          <Button
            id="login-submit"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            Log in
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: '#475569' }}>
          No account yet?{' '}
          <Link to="/create-profile" style={{ color: '#818cf8', fontWeight: 600 }}>
            Create a profile
          </Link>
        </p>
      </div>
    </PageWrapper>
  );
}
