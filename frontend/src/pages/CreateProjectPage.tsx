import { useState, FormEvent } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { createProject } from '../api/projects';
import {
  ALL_SKILLS, ALL_INTERESTS,
  AVAILABILITY_OPTIONS, WORK_STYLE_OPTIONS,
  SKILL_LABELS, INTEREST_LABELS,
  extractError,
} from '../utils/helpers';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function CreateProjectPage() {
  const [projectId, setProjectId]   = useState('');
  const [ownerId, setOwnerId]       = useState('');
  const [title, setTitle]           = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [interests, setInterests]   = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [workStyle, setWorkStyle]   = useState('');
  const [status, setStatus]         = useState<Status>('idle');
  const [message, setMessage]       = useState('');

  const toggleSkill = (skill: string) => {
    setRequiredSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId.trim() || !ownerId.trim() || !title.trim()) {
      setStatus('error');
      setMessage('Project ID, Owner ID, and title are required.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await createProject({
        project_id: projectId.trim(),
        owner_id: ownerId.trim(),
        title: title.trim(),
        required_skills: requiredSkills,
        interests,
        availability,
        work_style: workStyle,
      });
      setStatus('success');
      setMessage(res.message || 'Project created!');
    } catch (err) {
      setStatus('error');
      setMessage(extractError(err));
    }
  };

  return (
    <PageWrapper
      title="Create a Project"
      subtitle="Describe your project and the skills you need. We'll rank the best candidates for you."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── Project Info ─────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '20px', fontSize: '0.9375rem', fontWeight: 700 }}>
            🚀 Project Info
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                id="project-id"
                label="Project ID"
                placeholder="e.g. hackathon_2025"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                hint="Unique identifier for this project"
                required
              />
              <Input
                id="project-owner"
                label="Owner ID"
                placeholder="Your user ID"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
              />
            </div>
            <Input
              id="project-title"
              label="Project Title"
              placeholder="e.g. AI Resume Builder for Students"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </section>

        {/* ── Required Skills ──────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '6px', fontSize: '0.9375rem', fontWeight: 700 }}>
            🛠 Required Skills
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
            Pick the skills your ideal teammate should have.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ALL_SKILLS.map((skill) => {
              const selected = requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  id={`req-skill-${skill}`}
                  onClick={() => toggleSkill(skill)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '999px',
                    border: selected ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(99,102,241,0.18)',
                    background: selected ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: selected ? '#818cf8' : '#94a3b8',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  {SKILL_LABELS[skill]}
                </button>
              );
            })}
          </div>
          {requiredSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
              {requiredSkills.map((s) => (
                <Badge key={s} variant="primary" size="sm">✓ {SKILL_LABELS[s]}</Badge>
              ))}
            </div>
          )}
        </section>

        {/* ── Interests ──────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '6px', fontSize: '0.9375rem', fontWeight: 700 }}>
            🎯 Project Focus
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
            What is this project about?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ALL_INTERESTS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  id={`proj-interest-${interest}`}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: selected ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(34,211,238,0.18)',
                    background: selected ? 'rgba(34,211,238,0.15)' : 'transparent',
                    color: selected ? '#22d3ee' : '#94a3b8',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                >
                  {INTEREST_LABELS[interest]}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Preferences ──────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '20px', fontSize: '0.9375rem', fontWeight: 700 }}>
            ⚙️ Collaboration Preferences
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              id="project-availability"
              label="Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              options={AVAILABILITY_OPTIONS}
            />
            <Select
              id="project-workstyle"
              label="Work Style"
              value={workStyle}
              onChange={(e) => setWorkStyle(e.target.value)}
              options={WORK_STYLE_OPTIONS}
            />
          </div>
        </section>

        {status === 'success' && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '12px',
            color: '#10b981',
            fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            ✅ {message}
          </div>
        )}
        {status === 'error' && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px',
            color: '#ef4444',
            fontWeight: 600,
          }}>
            ⚠️ {message}
          </div>
        )}

        <Button
          id="project-submit"
          type="submit"
          variant="primary"
          size="lg"
          isLoading={status === 'loading'}
          fullWidth
        >
          Create Project
        </Button>
      </form>
    </PageWrapper>
  );
}
