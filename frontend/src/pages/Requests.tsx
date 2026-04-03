import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';
import { getIncomingRequests, getSentRequests, acceptRequest, rejectRequest, CollaborationRequestOut } from '../api/collaboration';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [incoming, setIncoming] = useState<CollaborationRequestOut[]>([]);
  const [sent, setSent] = useState<CollaborationRequestOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [inc, snt] = await Promise.all([
        getIncomingRequests(),
        getSentRequests()
      ]);
      setIncoming(inc);
      setSent(snt);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reqId: string) => {
    try {
      await acceptRequest(reqId);
      // Immediately redirect to the new room, or refresh list
      // For this MVP, let's redirect them straight into the chat room they just created!
      navigate(`/chat`);
    } catch (err) {
      alert("Failed to accept request");
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await rejectRequest(reqId);
      fetchRequests(); // Refresh the list to shift it to rejected
    } catch (err) {
      alert("Failed to reject request");
    }
  };

  if (loading) return <PageWrapper><Loader message="Loading requests..." /></PageWrapper>;

  const displayList = activeTab === 'incoming' ? incoming : sent;

  return (
    <PageWrapper 
      showBack 
      title="Collaboration Hub" 
      subtitle="Manage your team invitations and project join requests."
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-lg)', width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('incoming')}
          style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: activeTab === 'incoming' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'incoming' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Incoming ({incoming.filter(r => r.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('sent')}
          style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', background: activeTab === 'sent' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'sent' ? '#FFF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Sent
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayList.length === 0 ? (
           <div className="glass-panel" style={{ padding: '64px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No {activeTab} requests found.</p>
           </div>
        ) : (
           displayList.map(req => (
             <div key={req.request_id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                   <h3 style={{ fontSize: '1.2rem' }}>
                    {activeTab === 'incoming' ? `@${req.sender_id}` : `@${req.receiver_id}`}
                   </h3>
                   <Badge variant="primary" size="sm">{req.request_type.replace('_', ' ')}</Badge>
                   
                   {req.status === 'pending' && <Badge variant="default" size="sm">Pending</Badge>}
                   {req.status === 'accepted' && <Badge variant="primary" size="sm" style={{ background: 'var(--accent-green)', borderColor: 'var(--accent-green)', color: '#fff' }}>Accepted</Badge>}
                   {req.status === 'rejected' && <span style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 600 }}>Rejected</span>}
                 </div>
                 
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                   {req.message ? `"${req.message}"` : "No message provided."}
                 </p>
                 {req.project_id && (
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                     Project ID: {req.project_id}
                   </p>
                 )}
               </div>

               {activeTab === 'incoming' && req.status === 'pending' && (
                 <div style={{ display: 'flex', gap: '12px' }}>
                   <Button variant="secondary" onClick={() => handleReject(req.request_id)}>Reject</Button>
                   <Button variant="primary" onClick={() => handleAccept(req.request_id)}>Accept</Button>
                 </div>
               )}
             </div>
           ))
        )}
      </div>

    </PageWrapper>
  );
}
