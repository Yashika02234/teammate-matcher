import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function DashboardPage() {
  const { userId } = useAuth();

  const cards = [
    {
      title: 'My Profile',
      desc: 'Set up your skills, interests, and matching persona.',
      link: '/profile',
      icon: '👤',
      bg: 'linear-gradient(135deg, rgba(88, 86, 214, 0.15), rgba(88, 86, 214, 0))'
    },
    {
      title: 'My Projects',
      desc: 'Post ideas and specify the skills you need from teammates.',
      link: '/projects',
      icon: '🚀',
      bg: 'linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 149, 0, 0))'
    },
    {
      title: 'Find Teammates',
      desc: 'Get ML-powered recommendations for people to work with.',
      link: '/find-teammates',
      icon: '🤝',
      bg: 'linear-gradient(135deg, rgba(48, 209, 88, 0.15), rgba(48, 209, 88, 0))'
    },
    {
      title: 'Find Projects',
      desc: 'Discover exciting projects that match your exact skillset.',
      link: '/find-projects',
      icon: '🔍',
      bg: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(10, 132, 255, 0))'
    }
  ];

  return (
    <PageWrapper
      title={<>Welcome back, <span className="text-gradient">{userId}</span></>}
      subtitle="Your central hub for finding the perfect teammates and projects for your next big idea."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '24px'
      }}>
        {cards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className="glass-panel"
            style={{
              padding: '32px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
              background: `var(--bg-surface), ${card.bg}`,
              backgroundBlendMode: 'overlay',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-sm)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{card.icon}</div>
            <h3 style={{ fontSize: '1.4rem' }}>{card.title} <span style={{ color: 'var(--text-tertiary)' }}>→</span></h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}>
              {card.desc}
            </p>
          </Link>
        ))}
      </div>
    </PageWrapper>
  );
}
