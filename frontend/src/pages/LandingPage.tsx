import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Matching',
    desc: 'Cosine similarity + weighted scoring across skills, interests, and work style.',
  },
  {
    icon: '⚡',
    title: 'Complementary Skills',
    desc: 'We find teammates who fill your gaps — not just those who mirror your stack.',
  },
  {
    icon: '📅',
    title: 'Availability Aware',
    desc: 'Match only with people who share your time commitments.',
  },
  {
    icon: '🎯',
    title: 'Project Fit',
    desc: 'Post a project and instantly see the best-matched candidates.',
  },
];

const ctaCards = [
  {
    id: 'cta-create-profile',
    href: '/create-profile',
    icon: '👤',
    title: 'Create Profile',
    desc: 'Build your profile with skills, interests, and work preferences.',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08))',
    border: 'rgba(99,102,241,0.35)',
    accent: '#818cf8',
  },
  {
    id: 'cta-find-teammates',
    href: '/find-teammates',
    icon: '🔍',
    title: 'Find Teammates',
    desc: 'Get AI-ranked matches based on your unique profile.',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.06))',
    border: 'rgba(34,211,238,0.35)',
    accent: '#22d3ee',
  },
  {
    id: 'cta-create-project',
    href: '/create-project',
    icon: '🚀',
    title: 'Create Project',
    desc: 'Post your hackathon or startup idea and find the right team.',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(167,139,250,0.06))',
    border: 'rgba(167,139,250,0.35)',
    accent: '#a78bfa',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(99,102,241,0.3) 0%, transparent 65%),
            radial-gradient(ellipse 50% 30% at 80% 80%, rgba(34,211,238,0.1) 0%, transparent 60%)
          `,
        }} />

        {/* Pill badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px',
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '999px',
          fontSize: '0.8125rem',
          color: '#818cf8',
          fontWeight: 600,
          marginBottom: '32px',
          animation: 'fadeInUp 0.5s ease both',
        }}>
          <span>✦</span>
          <span>AI-Powered · Built for Students</span>
        </div>

        {/* Heading */}
        <h1 style={{
          maxWidth: '760px',
          marginBottom: '24px',
          animation: 'fadeInUp 0.5s ease 0.1s both',
          color: '#f1f5f9',
        }}>
          Find your{' '}
          <span className="gradient-text">perfect teammate</span>
          <br />in seconds
        </h1>

        <p style={{
          maxWidth: '520px',
          fontSize: '1.125rem',
          lineHeight: 1.7,
          marginBottom: '48px',
          animation: 'fadeInUp 0.5s ease 0.2s both',
          color: '#94a3b8',
        }}>
          Stop relying on group chats and luck. SyncUp uses AI to match you with
          skill-compatible teammates for hackathons, projects, and startups.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.5s ease 0.3s both',
        }}>
          <Link to="/create-profile">
            <Button variant="primary" size="lg" id="hero-cta-profile">Create Profile</Button>
          </Link>
          <Link to="/find-teammates">
            <Button variant="secondary" size="lg" id="hero-cta-match">Find Teammates</Button>
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '48px', marginTop: '72px', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 0.5s ease 0.4s both',
        }}>
          {[
            { value: '8+', label: 'Skill dimensions' },
            { value: '5', label: 'Matching factors' },
            { value: '100%', label: 'AI-ranked results' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500, marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Cards ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ marginBottom: '12px' }}>Get started in 3 steps</h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
            Create your profile, describe your project, and let the AI do the rest.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {ctaCards.map((card, i) => (
            <Link key={card.id} to={card.href} style={{ textDecoration: 'none' }}>
              <div
                id={card.id}
                style={{
                  padding: '32px',
                  borderRadius: '18px',
                  background: card.gradient,
                  border: `1px solid ${card.border}`,
                  cursor: 'pointer',
                  transition: 'transform 250ms ease, box-shadow 250ms ease',
                  animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s both`,
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.25rem', marginBottom: '16px' }}>{card.icon}</div>
                <h3 style={{ color: card.accent, marginBottom: '10px' }}>{card.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: '#94a3b8', margin: 0 }}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 120px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ marginBottom: '12px' }}>Why SyncUp?</h2>
          <p style={{ color: '#94a3b8' }}>
            Built on real metrics — not just vibes.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card"
              style={{
                padding: '28px',
                animation: `fadeInUp 0.5s ease ${0.1 + i * 0.1}s both`,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', color: '#f1f5f9', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
