import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createProfile } from '../api/profiles';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(userId, password);
        navigate(from, { replace: true });
      } else {
        // Register flow: Backend creates user identity during profile creation
        await createProfile({
          user_id: userId,
          password: password,
          name: name || userId,
          skills: [],
          skill_levels: {},
          interests: [],
          availability: 'Flexible',
          work_style: 'Collaborative',
          bio: 'New user'
        });
        
        // Auto-login after registration
        await login(userId, password);
        
        // Ensure user knows they need to finish profile setup
        navigate('/profile', { replace: true, state: { isNewUser: true }});
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageWrapper maxWidth="480px">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isLogin 
            ? 'Enter your credentials to access your dashboard.' 
            : 'Get started by creating your unique user ID.'}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', background: 'var(--bg-color)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                background: isLogin ? 'var(--bg-surface-hover)' : 'transparent',
                color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLogin ? 600 : 500, border: 'none', cursor: 'pointer'
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)',
                background: !isLogin ? 'var(--bg-surface-hover)' : 'transparent',
                color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: !isLogin ? 600 : 500, border: 'none', cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(255, 69, 58, 0.15)', color: 'var(--accent-red)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {!isLogin && (
            <Input
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required={!isLogin}
            />
          )}

          <Input
            label="User ID"
            placeholder="e.g. jdoe99"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            autoComplete="username"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            fullWidth 
            isLoading={loading}
            style={{ marginTop: '12px' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </PageWrapper>
  );
}
