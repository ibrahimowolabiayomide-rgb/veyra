'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Smartphone, Monitor, Globe } from 'lucide-react';

const history = [
  { device: 'iPhone · Safari', location: 'Lagos, Nigeria', time: 'Today, 11:21 AM', success: true },
  { device: 'Chrome · Windows', location: 'Lagos, Nigeria', time: 'Today, 8:03 AM', success: true },
  { device: 'Unknown Device', location: 'Abuja, Nigeria', time: 'Yesterday, 9:44 PM', success: false },
  { device: 'iPhone · Safari', location: 'Lagos, Nigeria', time: 'Yesterday, 3:12 PM', success: true },
  { device: 'Chrome · Windows', location: 'Lagos, Nigeria', time: '2 days ago', success: true },
  { device: 'Firefox · Mac', location: 'Port Harcourt, Nigeria', time: '4 days ago', success: true },
];

export default function LoginHistoryPage() {
  const router = useRouter();

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', padding: 4 }}>←</button>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Login History</h2>
      </div>

      <div style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16, lineHeight: 1.6 }}>
          Recent sign-in activity for your account. If you see something suspicious, change your password immediately.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: '#111', border: `1px solid ${h.success ? 'rgba(255,255,255,0.07)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: h.success ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {h.success
                  ? <CheckCircle size={17} style={{ color: '#4ade80' }} />
                  : <XCircle size={17} style={{ color: '#ef4444' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', color: '#fff', margin: '0 0 2px', fontWeight: 500 }}>{h.device}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  <Globe size={10} style={{ display: 'inline', marginRight: 3 }} />
                  {h.location} · {h.time}
                </p>
              </div>
              {!h.success && <span style={{ fontSize: '0.65rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 50, padding: '2px 8px', flexShrink: 0 }}>Failed</span>}
            </div>
          ))}
        </div>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
