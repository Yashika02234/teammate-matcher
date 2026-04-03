import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProjects } from '../api/projects';
import { createRequest } from '../api/collaboration';
import { ProjectOut, ProjectMatchResult } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import api from '../api/client';

const ROLE_COLORS: Record<string, string> = {
  Frontend: '#00F0FF',
  Backend:  '#8A2BE2',
  Database: '#FF9F0A',
  DevOps:   '#2B6AFF',
  Design:   '#FF007F',
  'ML/Data':'#00FF87',
};

export default function FindProjectsPage() {
  const { userId } = useAuth();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, ProjectMatchResult | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const all = await getProjects(0, 100);
        const filtered = all.filter(p => p.owner_id !== userId);
        setProjects(filtered);

        // Fetch ML match data for each project in parallel
        const entries = await Promise.all(
          filtered.map(async (p) => {
            try {
              const res = await api.get(`/project-match/${p.project_id}?limit=1`);
              const myMatch = res.data.matches?.find((m: ProjectMatchResult) => m.user_id === userId);
              return [p.project_id, myMatch || null] as [string, ProjectMatchResult | null];
            } catch {
              return [p.project_id, null] as [string, ProjectMatchResult | null];
            }
          })
        );
        setMatchMap(Object.fromEntries(entries));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchAll();
  }, [userId]);

  if (loading) return <PageWrapper><Loader message="Running ML project fit analysis..." /></PageWrapper>;

  return (
    <PageWrapper
      showBack
      title="Discover Projects"
      subtitle="ML-ranked projects matched against your skill profile and interests."
    >
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No fresh projects available right now. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {projects.map(p => (
            <ProjectDiscoverCard key={p.project_id} project={p} mlMatch={matchMap[p.project_id] ?? null} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function ProjectDiscoverCard({ project, mlMatch }: { project: ProjectOut, mlMatch: ProjectMatchResult | null }) {
  const [requested, setRequested] = useState(false);

  const handleRequest = async () => {
    try {
      await createRequest({
        request_type: 'project_join',
        receiver_id: project.owner_id,
        project_id: project.project_id,
        message: 'Hi! I am interested in joining your project.',
      });
      setRequested(true);
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert('Request already sent!');
        setRequested(true);
      } else {
        alert('Failed to send request.');
      }
    }
  };

  const scoreColor =
    (mlMatch?.score ?? 0) >= 75 ? 'var(--accent-green)' :
    (mlMatch?.score ?? 0) >= 45 ? 'var(--accent-cyan)' :
    'var(--text-tertiary)';

  return (
    <div className="glass-panel" style={{
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
      border: mlMatch && mlMatch.score >= 75 ? '1px solid rgba(0,255,135,0.3)' : '1px solid var(--border-color)',
      boxShadow: mlMatch && mlMatch.score >= 75 ? '0 0 20px rgba(0,255,135,0.12)' : 'var(--shadow-md)',
      transition: 'all var(--transition-smooth)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1.2rem', lineHeight: 1.3, flex: 1 }}>{project.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {project.domain && <Badge variant="primary" size="sm">{project.domain}</Badge>}
          {mlMatch && (
            <span style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor }}>
              {Math.round(mlMatch.score)}% fit
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{project.description}</p>
      )}

      {/* ML Skill coverage bar */}
      {mlMatch && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Skill Coverage
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {Math.round(mlMatch.matched_pct)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-hover)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.round(mlMatch.matched_pct)}%`,
              background: mlMatch.matched_pct >= 75 ? 'var(--accent-green)' : 'var(--accent-gradient)',
              borderRadius: '999px',
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      )}

      {/* Role badges */}
      {mlMatch?.roles && mlMatch.roles.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {mlMatch.roles.map(role => (
            <span key={role} style={{
              padding: '2px 10px', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontWeight: 600,
              background: `${ROLE_COLORS[role] || '#888'}22`,
              color: ROLE_COLORS[role] || '#888',
              border: `1px solid ${ROLE_COLORS[role] || '#888'}44`,
            }}>
              {role}
            </span>
          ))}
        </div>
      )}

      {/* Required skills + missing */}
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
          Looking for
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {project.required_skills.map(s => {
            const isMissing = mlMatch?.missing_skills?.includes(s.toLowerCase());
            return (
              <span key={s} style={{
                padding: '3px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500,
                background: isMissing ? 'rgba(255,100,100,0.08)' : 'rgba(0,255,135,0.08)',
                color: isMissing ? 'var(--accent-red)' : 'var(--accent-green)',
                border: `1px solid ${isMissing ? 'rgba(255,100,100,0.2)' : 'rgba(0,255,135,0.2)'}`,
              }}>
                {isMissing ? '± ' : '✓ '}{s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👤</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{project.owner_id}</span>
        </div>
        <Button
          size="sm"
          variant={requested ? 'secondary' : 'primary'}
          onClick={handleRequest}
          disabled={requested}
          style={requested ? { borderColor: 'var(--accent-green)', color: 'var(--accent-green)' } : {}}
        >
          {requested ? '✓ Applied' : 'Join Project'}
        </Button>
      </div>
    </div>
  );
}
