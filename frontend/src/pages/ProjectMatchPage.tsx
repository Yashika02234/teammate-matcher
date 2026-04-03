import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { MatchCard } from '../components/match/MatchCard';
import { SkeletonCard } from '../components/ui/Loader';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getProjectMatches } from '../api/matches';
import type { MatchResult } from '../types';
import { extractError } from '../utils/helpers';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ProjectMatchPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [projectId, setProjectId]  = useState('');
  const [status, setStatus]        = useState<Status>('idle');
  const [matches, setMatches]      = useState<MatchResult[]>([]);
  const [error, setError]          = useState('');
  const [lastQueried, setLastQueried] = useState('');

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/project-match' } });
      return;
    }
    if (!projectId.trim()) return;

    setStatus('loading');
    setError('');
    setMatches([]);
    try {
      const res = await getProjectMatches(projectId.trim());
      setMatches(res.matches);
      setLastQueried(projectId.trim());
      setStatus('success');
    } catch (err) {
      setError(extractError(err));
      setStatus('error');
    }
  };

  return (
    <PageWrapper
      title="Project Match"
      subtitle="Enter a Project ID to get a ranked list of candidates who best fit your project's needs."
    >
      {/* Search */}
      <form
        onSubmit={handleSearch}
        style={{ display: 'flex', gap: '12px', marginBottom: '48px', animation: 'fadeInUp 0.4s ease both' }}
      >
        <div style={{ flex: 1 }}>
          <Input
            id="project-match-id"
            placeholder="Enter project ID…"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        </div>
        <Button
          id="project-match-search"
          type="submit"
          variant="secondary"
          size="md"
          isLoading={status === 'loading'}
        >
          🎯 Find Candidates
        </Button>
      </form>

      {/* Auth warning */}
      {!isLoggedIn && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          color: '#f59e0b',
          fontSize: '0.875rem',
          marginBottom: '32px',
        }}>
          🔐 You need to <strong style={{ color: '#fbbf24' }}>log in</strong> to view project candidates.
        </div>
      )}

      {/* Loading skeletons */}
      {status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <ErrorMessage message={error} onRetry={() => setStatus('idle')} />
      )}

      {/* Results */}
      {status === 'success' && (
        <div style={{ animation: 'fadeIn 0.3s ease both' }}>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>
              No candidates found. Make sure there are profiles in the system.
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <h2 style={{ fontSize: '1.125rem', color: '#94a3b8', fontWeight: 500 }}>
                  Candidates for project{' '}
                  <span style={{ color: '#22d3ee', fontWeight: 700 }}>"{lastQueried}"</span>
                </h2>
                <span style={{
                  fontSize: '0.8rem',
                  color: '#475569',
                  background: 'rgba(34,211,238,0.06)',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(34,211,238,0.12)',
                }}>
                  {matches.length} candidate{matches.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {matches.map((match, idx) => (
                  <MatchCard
                    key={match.user_id}
                    match={match}
                    rank={idx + 1}
                    type="project"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Idle empty state */}
      {status === 'idle' && (
        <div style={{ textAlign: 'center', padding: '64px 24px', animation: 'fadeIn 0.4s ease both' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
          <p style={{ color: '#475569', fontSize: '1rem' }}>
            Enter a Project ID to find the best-matched candidates.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
