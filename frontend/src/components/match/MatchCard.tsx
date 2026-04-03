import type { MatchResult } from '../../types';
import { Badge } from '../ui/Badge';
import { ScoreRing } from './ScoreRing';
import { SKILL_LABELS } from '../../utils/helpers';

interface MatchCardProps {
  match: MatchResult;
  rank: number;
  type?: 'user' | 'project';
  style?: React.CSSProperties;
}

const rankColors: Record<number, string> = {
  1: '#f59e0b',
  2: '#94a3b8',
  3: '#b45309',
};

export function MatchCard({ match, rank, style }: MatchCardProps) {
  const { name, score, reasons, user_id } = match;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        animation: `fadeInUp 0.4s ease ${(rank - 1) * 0.08}s both`,
        ...style,
      }}
    >
      {/* Rank badge */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 800,
          color: rankColors[rank] ?? '#475569',
          letterSpacing: '0.1em',
        }}>
          #{rank}
        </span>
        {/* Avatar */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>
          {initials}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{name}</h3>
          <span style={{ fontSize: '0.78rem', color: '#475569' }}>@{user_id}</span>
        </div>

        {/* Reasons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {reasons.map((reason) => (
            <Badge key={reason} variant="primary" size="sm">
              {SKILL_LABELS[reason] ?? reason}
            </Badge>
          ))}
        </div>
      </div>

      {/* Score ring */}
      <ScoreRing score={score} size={68} />
    </div>
  );
}
