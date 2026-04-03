import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input } from '../components/ui/Input';
import { getRooms, getRoomMessages, sendMessage, RoomOut, MessageOut } from '../api/collaboration';

export default function ChatPage() {
  const { userId } = useAuth();
  const [rooms, setRooms] = useState<RoomOut[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [draft, setDraft] = useState('');
  
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch rooms on mount
  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        
        // Deduplicate any race-condition identical rooms from backend
        const uniqueRooms: RoomOut[] = [];
        const seenKeys = new Set<string>();
        for (const r of data) {
          const key = `${r.project_id || 'none'}-${[...r.members].sort().join()}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueRooms.push(r);
          }
        }
        
        setRooms(uniqueRooms);
        if (uniqueRooms.length > 0) setActiveRoomId(uniqueRooms[0].room_id);
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    }
    loadRooms();
  }, []);

  // Poll for messages in the active room
  useEffect(() => {
    if (!activeRoomId) return;

    const fetchMessages = async () => {
      try {
        const msgs = await getRoomMessages(activeRoomId);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to poll messages");
      }
    };

    fetchMessages(); // Immediate fetch
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeRoomId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !activeRoomId) return;
    
    // Optimistic UI update
    const optimisticMsg: MessageOut = {
       message_id: 'temp-' + Date.now(),
       room_id: activeRoomId,
       sender_id: userId || 'Me',
       text: draft,
       timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    const textToSend = draft;
    setDraft('');

    try {
      await sendMessage(activeRoomId, textToSend);
    } catch (err) {
      alert("Failed to send message. Might be a network issue.");
    }
  };

  return (
    <PageWrapper 
      showBack 
      title="Secure Chat" 
      subtitle="Communicate privately with your accepted collaborators."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '24px', height: '600px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '8px' }}>Active Rooms</h3>
          
          {rooms.length === 0 ? (
            <p style={{ padding: '8px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No rooms yet. Accept incoming requests or have yours accepted to open a room.</p>
          ) : (
            rooms.map(room => {
              const otherUsers = room.members.filter(m => m !== userId);
              const displayName = otherUsers.length > 0 ? `@${otherUsers.join(', ')}` : "Private Room";

              return (
                <button
                  key={room.room_id}
                  onClick={() => setActiveRoomId(room.room_id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: activeRoomId === room.room_id ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                    border: '1px solid transparent',
                    borderColor: activeRoomId === room.room_id ? 'var(--accent-cyan)' : 'transparent',
                    color: activeRoomId === room.room_id ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{displayName}</div>
                  {room.project_id && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Proj: {room.project_id}</div>}
                </button>
              );
            })
          )}
        </div>

        {/* Chat Pane */}
        {activeRoomId ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.length === 0 && (
                <div style={{ margin: 'auto', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  No messages here yet. Say hello!
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === userId;
                return (
                  <div key={msg.message_id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '12px 16px', 
                      borderRadius: 'var(--radius-lg)', 
                      background: isMe ? 'var(--accent-gradient)' : 'var(--bg-surface-hover)', 
                      color: isMe ? '#FFF' : 'var(--text-primary)',
                      borderBottomRightRadius: isMe ? '4px' : 'var(--radius-lg)',
                      borderBottomLeftRadius: isMe ? 'var(--radius-lg)' : '4px'
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', margin: '0 4px' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.sender_id}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', padding: '16px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
               <Input 
                 placeholder="Type your message..." 
                 value={draft}
                 onChange={e => setDraft(e.target.value)}
                 style={{ flex: 1 }}
               />
               <button type="submit" style={{ padding: '0 24px', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                 Send
               </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            Select a room to start messaging
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
