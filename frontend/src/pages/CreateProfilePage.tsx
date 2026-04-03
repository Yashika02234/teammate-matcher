import { useState, FormEvent } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { createProfile } from '../api/profiles';
import {
  ALL_SKILLS, ALL_INTERESTS,
  AVAILABILITY_OPTIONS, WORK_STYLE_OPTIONS,
  SKILL_LABELS, INTEREST_LABELS,
  extractError,
} from '../utils/helpers';

interface SkillEntry {
  name: string;
  level: number;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function CreateProfilePage() {
  const [userId, setUserId]       = useState('');
  const [name, setName]           = useState('');
  const [password, setPassword]   = useState('');
  const [selectedSkills, setSelectedSkills] = useState<SkillEntry[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [workStyle, setWorkStyle] = useState('');
  const [status, setStatus]       = useState<Status>('idle');
  const [message, setMessage]     = useState('');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.name === skill);
      return exists
        ? prev.filter((s) => s.name !== skill)
        : [...prev, { name: skill, level: 3 }];
    });
  };

  const setSkillLevel = (skill: string, level: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.name === skill ? { ...s, level } : s))
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !name.trim() || !password.trim()) {
      setStatus('error');
      setMessage('User ID, name, and password are required.');
      return;
    }

    const payload = {
      user_id: userId.trim(),
      name: name.trim(),
      password,
      skills: selectedSkills.map((s) => s.name),
      skill_levels: Object.fromEntries(selectedSkills.map((s) => [s.name, s.level])),
      interests,
      availability,
      work_style: workStyle,
    };

    setStatus('loading');
    setMessage('');
    try {
      const res = await createProfile(payload);
      setStatus('success');
      setMessage(res.message || 'Profile created successfully!');
    } catch (err) {
      setStatus('error');
      setMessage(extractError(err));
    }
  };

  return (
    <PageWrapper
      title="Create Your Profile"
      subtitle="Tell us about your skills, interests, and working style so we can find your best teammates."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ── Basic Info ─────────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '20px', fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            👤 Basic Info
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              id="profile-userid"
              label="User ID"
              placeholder="e.g. yashika_dev"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              hint="This is your unique identifier"
              required
            />
            <Input
              id="profile-name"
              label="Display Name"
              placeholder="e.g. Yashika Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                id="profile-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                hint="Used for login to access your matches"
                required
              />
            </div>
          </div>
        </section>

        {/* ── Skills ────────────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '6px', fontSize: '0.9375rem', fontWeight: 700 }}>
            🛠 Skills & Proficiency
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
            Click a skill to add it, then set your proficiency level (1 = beginner, 5 = expert).
          </p>

          {/* Skill chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {ALL_SKILLS.map((skill) => {
              const selected = selectedSkills.find((s) => s.name === skill);
              return (
                <button
                  key={skill}
                  type="button"
                  id={`skill-btn-${skill}`}
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

          {/* Level sliders for selected skills */}
          {selectedSkills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Set Levels
              </p>
              {selectedSkills.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Badge variant="primary" size="sm" style={{ minWidth: '100px', justifyContent: 'center' }}>
                    {SKILL_LABELS[s.name]}
                  </Badge>
                  <input
                    id={`skill-level-${s.name}`}
                    type="range"
                    min={1} max={5} step={1}
                    value={s.level}
                    onChange={(e) => setSkillLevel(s.name, Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#6366f1' }}
                  />
                  <span style={{
                    minWidth: '64px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#818cf8',
                    textAlign: 'right',
                  }}>
                    {['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][s.level]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Interests ─────────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '6px', fontSize: '0.9375rem', fontWeight: 700 }}>
            🎯 Interests
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
            What are you building toward?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ALL_INTERESTS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  id={`interest-btn-${interest}`}
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

        {/* ── Preferences ───────────────────────────────────────────── */}
        <section className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ color: '#818cf8', marginBottom: '20px', fontSize: '0.9375rem', fontWeight: 700 }}>
            ⚙️ Preferences
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Select
              id="profile-availability"
              label="Availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              options={AVAILABILITY_OPTIONS}
            />
            <Select
              id="profile-workstyle"
              label="Work Style"
              value={workStyle}
              onChange={(e) => setWorkStyle(e.target.value)}
              options={WORK_STYLE_OPTIONS}
            />
          </div>
        </section>

        {/* ── Status message ──────────────────────────────────────────── */}
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
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            ⚠️ {message}
          </div>
        )}

        <Button
          id="profile-submit"
          type="submit"
          variant="primary"
          size="lg"
          isLoading={status === 'loading'}
          fullWidth
        >
          Create Profile
        </Button>
      </form>
    </PageWrapper>
  );
}
