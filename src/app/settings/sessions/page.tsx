'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Smartphone, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function SessionsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const signOutAll = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) toast.error(error.message);
    else { toast.success('Signed out from all devices'); router.push('/auth/login'); }
    setLoading(false);
  };

  const sessions = [
    { device: 'Current Session', type: 'mobile', location: 'Lagos, Nigeria', time: 'Active now', isCurrent: true },
    { device: 'Chrome on Windows', type: 'desktop', location: 'Lagos, Nigeria', time: '2 hours ago', isCurrent: false },
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, fontSize: '0.9rem' }}>←</button>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Active Sessions</h2>
      </div>

      <div style={{ padding: '1rem' }}>
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 20 }}>
          <Shield size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: 'rgba(74,222,128,0.8)', margin: 0, lineHeight: 1.6 }}>
            These are all devices currently signed into your account. If you don&apos;t recognise one, sign out everywhere immediately.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {sessions.map((s, i) => (
            <div key={i} style={{ background: '#111', border: `1px solid ${s.isCurrent ? 'rgba(200,169,107,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.isCurrent ? 'rgba(200,169,107,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.type === 'mobile' ? <Smartphone size={18} style={{ color: s.isCurrent ? '#C8A96B' : 'rgba(255,255,255,0.4)' }} /> : <Monitor size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 2px', fontWeight: 500 }}>{s.device}</p>
                  {s.isCurrent && <span style={{ fontSize: '0.6rem', background: 'rgba(200,169,107,0.15)', color: '#C8A96B', borderRadius: 50, padding: '1px 7px', fontWeight: 600 }}>Current</span>}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{s.location} · {s.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={signOutAll} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: 14,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: loading ? 0.6 : 1,
        }}>
          <LogOut size={15} /> {loading ? 'Signing out…' : 'Sign Out From All Devices'}
        </button>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
