import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { MatchCard } from '../components/match/MatchCard';
import { Loader, SkeletonCard } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getMatches } from '../api/matches';
import type { MatchResult } from '../types';
import { extractError } from '../utils/helpers';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function FindTeammatesPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId]     = useState('');
  const [status, setStatus]     = useState<Status>('idle');
  const [matches, setMatches]   = useState<MatchResult[]>([]);
  const [error, setError]       = useState('');
  const [lastQueried, setLastQueried] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/find-teammates' } });
      return;
    }
    if (!userId.trim()) return;

    setStatus('loading');
    setError('');
    setMatches([]);
    try {
      const res = await getMatches(userId.trim());
      setMatches(res.matches);
      setLastQueried(userId.trim());
      setStatus('success');
    } catch (err) {
      setError(extractError(err));
      setStatus('error');
    }
  };

  return (
    <PageWrapper
      title="Find Teammates"
      subtitle="Enter your User ID to get AI-ranked matches based on your skills, interests, and working style."
    >
      {/* Search form */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '48px',
          animation: 'fadeInUp 0.4s ease both',
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            id="find-teammates-userid"
            placeholder="Enter your user ID…"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <Button
          id="find-teammates-search"
          type="submit"
          variant="primary"
          size="md"
          isLoading={status === 'loading'}
        >
          🔍 Find Matches
        </Button>
      </form>

      {/* Not logged in notice */}
      {!isLoggedIn && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          color: '#f59e0b',
          fontSize: '0.875rem',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          🔐 You need to <strong style={{ color: '#fbbf24' }}>log in</strong> to view matches.
          Searching will redirect you to the login page.
        </div>
      )}

      {/* Loading */}
      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <ErrorMessage
          message={error}
          onRetry={() => setStatus('idle')}
        />
      )}

      {/* Results */}
      {status === 'success' && (
        <div style={{ animation: 'fadeIn 0.3s ease both' }}>
          {matches.length === 0 ? (
            <Loader message="No matches found. Add more profiles first!" />
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '1.125rem', color: '#94a3b8', fontWeight: 500 }}>
                  Top matches for{' '}
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>@{lastQueried}</span>
                </h2>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#475569',
                  background: 'rgba(99,102,241,0.08)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(99,102,241,0.12)',
                }}>
                  {matches.length} result{matches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {matches.map((match, idx) => (
                  <MatchCard key={match.user_id} match={match} rank={idx + 1} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Idle empty state */}
      {status === 'idle' && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          animation: 'fadeIn 0.4s ease both',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🤖</div>
          <p style={{ color: '#475569', fontSize: '1rem' }}>
            Enter a User ID and hit search to see your AI-powered matches.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
