'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, Search, ArrowLeft, Circle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

function MessagesContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
      // Real-time subscription
      const channel = supabase.channel(`messages-${activeConv.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
          payload => setMessages(prev => [...prev, payload.new]))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    setUser(session.user);
    loadConversations(session.user.id);
  };

  const loadConversations = async (userId: string) => {
    const { data } = await supabase
      .from('conversation_members')
      .select(`conversation_id, conversations(id, last_message, last_message_at, updated_at), unread_count`)
      .eq('user_id', userId)
      .order('conversation_id');
    
    // Get other member info for each conversation
    const convs = await Promise.all((data || []).map(async (cm: any) => {
      const { data: members } = await supabase
        .from('conversation_members')
        .select('user_id, profiles(id, full_name, username, avatar_url, role)')
        .eq('conversation_id', cm.conversation_id)
        .neq('user_id', userId);
      return { ...cm.conversations, unread: cm.unread_count, other: members?.[0]?.profiles };
    }));
    setConversations(convs.filter(Boolean));
    setLoading(false);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles!sender_id(id, full_name, username, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages(data || []);
    // Mark as read
    if (user) await supabase.from('conversation_members').update({ unread_count: 0 }).eq('conversation_id', convId).eq('user_id', user.id);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv || !user || sending) return;
    setSending(true);
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: newMsg.trim(),
    }).select('*, profiles!sender_id(id, full_name, username, avatar_url)').single();
    if (!error && data) {
      setMessages(prev => [...prev, data]);
      await supabase.from('conversations').update({ last_message: newMsg.trim(), last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', activeConv.id);
      setNewMsg('');
    }
    setSending(false);
  };

  const timeAgo = (d: string) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'now';
    if (m < 60) return `${m}m`;
    if (m < 1440) return `${Math.floor(m / 60)}h`;
    return `${Math.floor(m / 1440)}d`;
  };

  const showConvList = !activeConv;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: 56, paddingBottom: 60 }}>
      {/* Mobile: show either list or chat */}
      {showConvList ? (
        // Conversation list
        <div>
          <div style={{ padding: '14px 1rem 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h1 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 300, color: '#fff', margin: 0 }}>Messages</h1>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array(5).fill(0).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 1rem', alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#1a1a1a', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 13, background: '#1a1a1a', borderRadius: 6, marginBottom: 6, width: '60%' }} />
                    <div style={{ height: 11, background: '#1a1a1a', borderRadius: 6, width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: '1rem', marginBottom: 6 }}>No messages yet</p>
              <p style={{ fontSize: '0.85rem' }}>Message a seller from any product page</p>
            </div>
          ) : (
            <div>
              {conversations.map(conv => (
                <button key={conv.id} onClick={() => setActiveConv(conv)}
                  style={{ width: '100%', display: 'flex', gap: 12, padding: '12px 1rem', alignItems: 'center', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                    {conv.other?.avatar_url ? <img src={conv.other.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{conv.other?.full_name?.charAt(0) || '?'}</span>}
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#4ade80', border: '1.5px solid #0a0a0a' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: conv.unread > 0 ? 600 : 400, color: '#fff' }}>{conv.other?.full_name || conv.other?.username || 'User'}</span>
                      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>{timeAgo(conv.last_message_at)}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message || 'Start a conversation'}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#C8A96B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#000', flexShrink: 0 }}>{conv.unread}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Chat view
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px - 60px)' }}>
          {/* Chat header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', flexShrink: 0 }}>
            <button onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {activeConv.other?.avatar_url ? <img src={activeConv.other.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{activeConv.other?.full_name?.charAt(0) || '?'}</span>}
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', margin: 0 }}>{activeConv.other?.full_name || 'User'}</p>
              <p style={{ fontSize: '0.68rem', color: '#4ade80', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} /> Active now
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                  {!isMe && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {msg.profiles?.avatar_url ? <img src={msg.profiles.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '0.65rem', color: '#fff' }}>{msg.profiles?.full_name?.charAt(0)}</span>}
                    </div>
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      padding: '9px 13px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe ? 'linear-gradient(135deg,rgba(200,169,107,0.25),rgba(168,135,42,0.2))' : '#1a1a1a',
                      border: `1px solid ${isMe ? 'rgba(200,169,107,0.25)' : 'rgba(255,255,255,0.07)'}`,
                      fontSize: '0.85rem', color: '#fff', lineHeight: 1.5,
                    }}>
                      {msg.content}
                    </div>
                    <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', margin: '2px 4px 0', textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.25)' }}>
                <p style={{ fontSize: '0.85rem' }}>Send a message to start the conversation</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 1rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '10px 16px', color: '#fff', fontSize: '0.88rem', outline: 'none' }} />
            <button onClick={sendMessage} disabled={!newMsg.trim() || sending}
              style={{ width: 40, height: 40, borderRadius: '50%', background: newMsg.trim() ? 'linear-gradient(135deg,#C8A96B,#A8872A)' : '#1a1a1a', border: 'none', cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
              <Send size={15} style={{ color: newMsg.trim() ? '#000' : 'rgba(255,255,255,0.2)' }} />
            </button>
          </div>
        </div>
      )}
      <style>{`::-webkit-scrollbar{width:4px;height:0} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}><MessagesContent /></Suspense>;
}
