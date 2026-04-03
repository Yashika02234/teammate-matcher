import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProjects, createProject } from '../api/projects';
import { ProjectOut } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import { SkeletonCard } from '../components/ui/Loader';
import { SKILLS_LIST } from '../utils/constants.ts';

export default function MyProjectsPage() {
  const { userId } = useAuth();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyProjects();
  }, [userId]);

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const all = await getProjects(0, 100);
      setProjects(all.filter(p => p.owner_id === userId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      showBack
      title="My Projects"
      subtitle="Manage your postings and see who matched with your projects."
      actions={<Button onClick={() => setShowModal(true)}>+ New Project</Button>}
    >
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={fetchMyProjects} userId={userId!} />}

      {loading ? (
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-focus)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
          <h3 style={{ marginBottom: '8px' }}>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Draft your first idea and let the ML engine find your teammates.</p>
          <Button onClick={() => setShowModal(true)}>Create Project</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {projects.map(p => (
            <div key={p.project_id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px', flex: 1 }}>{p.description}</p>
              
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Required Skills</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {p.required_skills.map(s => <Badge key={s} size="sm">{s}</Badge>)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                 <Badge variant="primary" size="sm">{p.domain}</Badge>
                 <Badge variant="default" size="sm">{p.project_id}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function CreateProjectModal({ onClose, onCreated, userId }: { onClose: () => void, onCreated: () => void, userId: string }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [domain, setDomain] = useState('Web Development');
  const [reqSkills, setReqSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const projId = `proj_${Math.random().toString(36).substr(2, 6)}`;
    try {
      await createProject({
        project_id: projId,
        owner_id: userId,
        title,
        description: desc,
        required_skills: reqSkills,
        domain,
        work_style: 'Collaborative',
        availability: 'Flexible',
        interests: []
      });
      onCreated();
      onClose();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (s: string) => {
    if (reqSkills.includes(s)) setReqSkills(reqSkills.filter(x => x !== s));
    else setReqSkills([...reqSkills, s]);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-surface)', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Post a New Project</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Input label="Project Title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. NextGen ML matching platform" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Description</label>
            <textarea style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-sm)', minHeight: '100px' }} value={desc} onChange={e => setDesc(e.target.value)} required />
          </div>
          <Select label="Domain" value={domain} onChange={e => setDomain(e.target.value)} options={[{label: 'Web Dev', value: 'Web Development'}, {label: 'AI/ML', value: 'AI/ML'}, {label: 'Mobile', value: 'Mobile App'}]} />
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Required Skills</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SKILLS_LIST.map((s: string) => (
                <button type="button" key={s} onClick={() => toggleSkill(s)} 
                  style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-full)', cursor: 'pointer',
                    background: reqSkills.includes(s) ? 'rgba(91, 140, 255, 0.15)' : 'var(--bg-surface-hover)',
                    color: reqSkills.includes(s) ? 'var(--accent-blue)' : 'var(--text-primary)',
                    border: reqSkills.includes(s) ? '1px solid var(--accent-blue)' : '1px solid transparent'
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={loading}>Post Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
