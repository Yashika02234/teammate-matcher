import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getMatches } from '../api/matches';
import { createRequest } from '../api/collaboration';
import { MatchResponse, MatchResult } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';

// Role → color mapping mirroring backend ROLE_COLORS
const ROLE_COLORS: Record<string, string> = {
  Frontend: '#00F0FF',
  Backend:  '#8A2BE2',
  Database: '#FF9F0A',
  DevOps:   '#2B6AFF',
  Design:   '#FF007F',
  'ML/Data':'#00FF87',
};

export default function FindTeammatesPage() {
  const { userId } = useAuth();
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId) fetchMatches();
  }, [userId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMatches(userId!);
      setData(response);
    } catch (err) {
      setError('Unable to fetch ML recommendations. Ensure your profile is fully set up!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageWrapper><Loader message="Running ML matching algorithms..." /></PageWrapper>;

  if (error) {
    return (
      <PageWrapper title="Find Teammates">
        <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--accent-red)' }}>Oops</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <Button variant="secondary" onClick={() => window.location.href = '/profile'} style={{ marginTop: '24px' }}>Setup Profile</Button>
        </div>
      </PageWrapper>
    );
  }

  const matches = data?.matches || [];

  return (
    <PageWrapper
      showBack
      title="Recommended Teammates"
      subtitle="Ranked by ML compatibility — cosine similarity, role fit, and behavioral alignment."
    >
      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No matches found yet. Try adding more skills to your profile.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {matches.map((m, idx) => (
            <MatchUserCard key={m.user_id} match={m} rank={idx + 1} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function MatchUserCard({ match, rank }: { match: MatchResult, rank: number }) {
  const [requestSent, setRequestSent] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // score is already 0-100 from backend
  const percentage = Math.round(match.score);
  const exp = match.explanation;

  const handleRequest = async () => {
    try {
      await createRequest({
        request_type: 'teammate',
        receiver_id: match.user_id,
        message: 'Hi! Let us collaborate based on our ML matching scores.',
      });
      setRequestSent(true);
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert('Request already sent!');
        setRequestSent(true);
      } else {
        alert('Failed to send request.');
      }
    }
  };

  const ringColor =
    percentage >= 80 ? 'var(--accent-green)' :
    percentage >= 55 ? 'var(--accent-cyan)' :
    'var(--text-tertiary)';

  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        padding: '24px',
        border: rank === 1 ? '1px solid var(--accent-purple)' : '1px solid var(--border-color)',
        boxShadow: rank === 1 ? '0 0 28px rgba(138,43,226,0.4)' : 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

        {/* Score Ring */}
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="var(--border-color)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke={ringColor} strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>
            {percentage}%
          </div>
        </div>

        {/* Name + Roles + TOP MATCH badge */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{match.name}</h3>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>@{match.user_id}</span>
            {rank === 1 && (
              <span style={{
                background: 'rgba(138,43,226,0.25)', color: 'var(--accent-cyan)',
                border: '1px solid var(--accent-purple)', padding: '2px 10px',
                borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                textShadow: '0 0 8px var(--accent-cyan)',
              }}>
                ⭐ TOP MATCH
              </span>
            )}
          </div>

          {/* Role badges */}
          {exp?.roles && exp.roles.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {exp.roles.map(role => (
                <span key={role} style={{
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: `${ROLE_COLORS[role] || '#888'}22`,
                  color: ROLE_COLORS[role] || '#888',
                  border: `1px solid ${ROLE_COLORS[role] || '#888'}55`,
                }}>
                  {role}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Send Request */}
        <div style={{ flexShrink: 0 }}>
          <Button
            variant={requestSent ? 'secondary' : 'primary'}
            onClick={handleRequest}
            disabled={requestSent}
            style={requestSent ? { borderColor: 'var(--accent-green)', color: 'var(--accent-green)' } : {}}
          >
            {requestSent ? '✓ Request Sent' : 'Send Request'}
          </Button>
        </div>
      </div>

      {/* ── Skill match bar ── */}
      {exp && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Skill Overlap
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {Math.round(exp.skill_match_pct * 100)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.round(exp.skill_match_pct * 100)}%`,
              background: 'var(--accent-gradient)',
              borderRadius: '999px',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── Matched skills tags ── */}
      {exp?.matched_skills && exp.matched_skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {exp.matched_skills.map(s => (
            <span key={s} style={{
              background: 'rgba(0, 255, 135, 0.1)', color: 'var(--accent-green)',
              border: '1px solid rgba(0,255,135,0.3)',
              padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500,
            }}>
              ✓ {s}
            </span>
          ))}
          {exp.missing_skills && exp.missing_skills.map(s => (
            <span key={s} style={{
              background: 'rgba(255,100,100,0.08)', color: 'var(--accent-red)',
              border: '1px solid rgba(255,100,100,0.2)',
              padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500,
            }}>
              ± {s}
            </span>
          ))}
        </div>
      )}

      {/* ── Reasons row ── */}
      {exp?.reasons && exp.reasons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {exp.reasons.map((reason, i) => (
            <span key={i} style={{
              background: 'var(--bg-surface-hover)', padding: '4px 10px',
              borderRadius: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)',
            }}>
              {reason}
            </span>
          ))}
        </div>
      )}

      {/* ── Score breakdown (toggle) ── */}
      {exp?.score_breakdown && (
        <div>
          <button
            onClick={() => setShowBreakdown(v => !v)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-tertiary)',
              fontSize: '0.78rem', cursor: 'pointer', padding: 0,
              textDecoration: 'underline', textUnderlineOffset: '3px',
            }}
          >
            {showBreakdown ? '▲ Hide' : '▼ Show'} score breakdown
          </button>

          {showBreakdown && (
            <div style={{
              marginTop: '12px', display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px',
            }}>
              {Object.entries(exp.score_breakdown).map(([key, val]) => (
                <div key={key} style={{
                  background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {key.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {val.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
