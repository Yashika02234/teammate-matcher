import { useState, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProfiles, updateProfile } from '../api/profiles';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SKILLS_LIST, INTERESTS_LIST } from '../utils/constants.ts';
import api from '../api/client';

export default function ProfilePage() {
  const { userId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewUser = (location.state as any)?.isNewUser;

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [myRoles, setMyRoles] = useState<{ role: string; color: string }[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState('Flexible');
  const [workStyle, setWorkStyle] = useState('Collaborative');
  
  // Custom multi-select states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    async function checkProfile() {
      if (isNewUser) {
        setProfileExists(false); // They just signed up, backend created basic entry
        setLoading(false);
        return;
      }

      try {
        const allProfiles = await getProfiles(0, 100);
        const me = allProfiles.find(p => p.user_id === userId);
        
        if (me) {
          setProfileExists(true);
          setName(me.name);
          setBio(me.bio || '');
          setAvailability(me.availability || 'Flexible');
          setWorkStyle(me.work_style || 'Collaborative');
          setSelectedSkills(me.skills || []);
          setSelectedInterests(me.interests || []);
        } else {
          setProfileExists(false);
        }
      } catch (err) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }
    checkProfile();
  }, [userId, isNewUser]);

  // Fetch ML role tags whenever userId is available
  useEffect(() => {
    if (!userId) return;
    api.get('/my-roles')
      .then(res => {
        const roles: string[] = res.data.roles || [];
        const colors: Record<string, string> = res.data.role_colors || {};
        setMyRoles(roles.map(r => ({ role: r, color: colors[r] || '#888' })));
      })
      .catch(() => {});
  }, [userId]);

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        name,
        bio,
        availability,
        work_style: workStyle,
        skills: selectedSkills,
        interests: selectedInterests,
        skill_levels: selectedSkills.reduce((acc, curr) => ({ ...acc, [curr]: 3 }), {} as Record<string, number>) // Keep a default level of 3 for now
      };
      
      await updateProfile(updateData);
      alert("Profile saved successfully!");
      navigate('/dashboard');
    } catch (err) {
      alert("Error saving profile");
    }
  };

  if (loading) return <PageWrapper title="Loading..."><div className="skeleton-pulse" style={{height:'300px'}} /></PageWrapper>;

  return (
    <PageWrapper 
      showBack
      title="My Profile" 
      subtitle={profileExists ? "Your ML-matching profile details." : "Complete your setup to enable ML teammate matching."}
    >
      {/* ── ML Role Profile Panel ── */}
      {myRoles.length > 0 && (
        <div className="glass-panel" style={{
          padding: '20px 24px', marginBottom: '24px',
          border: '1px solid rgba(0,240,255,0.15)',
          background: 'linear-gradient(135deg, rgba(0,240,255,0.04), rgba(138,43,226,0.04))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                🤖 Your Inferred ML Role Profile
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {myRoles.map(({ role, color }) => (
                  <span key={role} style={{
                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: `${color}22`,
                    color: color,
                    border: `1px solid ${color}55`,
                    boxShadow: `0 0 10px ${color}22`,
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: 'auto', maxWidth: '260px', lineHeight: 1.5 }}>
              Roles are inferred from your skill levels using the onboard ML classification engine.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
          <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="User ID" value={userId || ''} readOnly style={{ opacity: 0.6 }} />
        </div>

        <Input 
          label="Bio / Tagline" 
          placeholder="I'm a full-stack dev looking for a hackathon team..." 
          value={bio} 
          onChange={e => setBio(e.target.value)} 
        />

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
          <Select 
            label="Availability" 
            value={availability} 
            onChange={e => setAvailability(e.target.value)}
            options={[
              {label: 'Flexible', value: 'Flexible'},
              {label: 'Weekends only', value: 'Weekends only'},
              {label: 'Full-time', value: 'Full-time'}
            ]}
          />
          <Select 
            label="Preferred Work Style" 
            value={workStyle} 
            onChange={e => setWorkStyle(e.target.value)}
            options={[
              {label: 'Collaborative', value: 'Collaborative'},
              {label: 'Independent', value: 'Independent'},
              {label: 'Async', value: 'Async'}
            ]}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>
            Skills (Select Multiple)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SKILLS_LIST.map((skill: string) => {
              const active = selectedSkills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                  style={{
                    padding: '8px 16px', background: active ? 'rgba(91, 140, 255, 0.15)' : 'var(--bg-surface-hover)',
                    color: active ? 'var(--accent-blue)' : 'var(--text-primary)',
                    border: active ? '1px solid var(--accent-blue)' : '1px solid transparent',
                    borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'all var(--transition-fast)'
                  }}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>
            Interests & Domains
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {INTERESTS_LIST.map((interest: string) => {
              const active = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleItem(interest, selectedInterests, setSelectedInterests)}
                  style={{
                    padding: '8px 16px', background: active ? 'rgba(140, 130, 209, 0.15)' : 'var(--bg-surface-hover)',
                    color: active ? 'var(--accent-purple)' : 'var(--text-primary)',
                    border: active ? '1px solid var(--accent-purple)' : '1px solid transparent',
                    borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'all var(--transition-fast)'
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" style={{ alignSelf: 'flex-end', marginTop: '16px' }}>
           {isNewUser ? 'Complete Setup' : 'Save Profile'}
        </Button>
      </form>
    </PageWrapper>
  );
}
