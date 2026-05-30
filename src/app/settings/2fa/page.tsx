'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Mail, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TwoFactorPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<'sms' | 'email' | null>(null);

  const enable = (m: 'sms' | 'email') => {
    setMethod(m);
    setEnabled(true);
    toast.success(`2FA enabled via ${m === 'sms' ? 'SMS' : 'Email'} ✦`);
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', padding: 4 }}>←</button>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Two-Factor Authentication</h2>
      </div>

      <div style={{ padding: '1.5rem 1rem' }}>
        {/* Status banner */}
        <div style={{ background: enabled ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.04)', border: `1px solid ${enabled ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 18, padding: '18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: enabled ? 'rgba(74,222,128,0.12)' : 'rgba(200,169,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={22} style={{ color: enabled ? '#4ade80' : '#C8A96B' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 3px' }}>
              {enabled ? '2FA is Active' : '2FA is Disabled'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
              {enabled ? `Protected via ${method === 'sms' ? 'SMS code' : 'Email code'}` : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>

        {!enabled && (
          <>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Choose 2FA Method</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'sms', icon: Smartphone, label: 'SMS Code', desc: 'Get a code sent to your phone number', color: '#3B82F6' },
                { key: 'email', icon: Mail, label: 'Email Code', desc: 'Get a code sent to your email', color: '#8B5CF6' },
              ].map(({ key, icon: Icon, label, desc, color }) => (
                <button key={key} onClick={() => enable(key as 'sms' | 'email')} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 16,
                  background: '#111', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', color: '#fff', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </>
        )}

        {enabled && (
          <button onClick={() => { setEnabled(false); setMethod(null); toast.success('2FA disabled'); }}
            style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', marginTop: 10 }}>
            Disable 2FA
          </button>
        )}
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
