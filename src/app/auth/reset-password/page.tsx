'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

function ResetContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = createClient();
  const isUpdate = sp.get('type') === 'recovery';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password?type=recovery`,
    });
    if (error) toast.error(error.message);
    else setSent(true);
    setLoading(false);
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success('Password updated! ✦'); router.push('/'); }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '13px 14px', color: '#fff', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };

  if (sent) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Check size={26} style={{ color: '#4ade80' }} />
      </div>
      <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 300, color: '#fff', marginBottom: 10 }}>Check your email</h2>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
        We sent a reset link to <strong style={{ color: '#C8A96B' }}>{email}</strong>. Click it to set a new password.
      </p>
      <Link href="/auth/login" style={{ color: '#C8A96B', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Login</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '35vh', background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <Link href="/" style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 300, letterSpacing: '0.35em', color: '#fff', textDecoration: 'none', marginBottom: 32, paddingRight: '0.35em' }}>
        VE<span style={{ color: '#C8A96B' }}>Y</span>RA
      </Link>

      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 300, color: '#fff', marginBottom: 6, textAlign: 'center' }}>
          {isUpdate ? 'Set New Password' : 'Reset Password'}
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 28 }}>
          {isUpdate ? 'Choose a strong new password' : 'Enter your email to receive a reset link'}
        </p>

        {isUpdate ? (
          <form onSubmit={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="New password" style={{ ...inp, paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password" style={inp} />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14, marginTop: 4,
              background: loading ? 'rgba(200,169,107,0.5)' : 'linear-gradient(135deg,#C8A96B,#A8872A)',
              border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <>Update Password <ArrowRight size={15} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={sendReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address" autoComplete="email" style={{ ...inp, paddingLeft: 40 }} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: loading ? 'rgba(200,169,107,0.5)' : 'linear-gradient(135deg,#C8A96B,#A8872A)',
              border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <>Send Reset Link <ArrowRight size={15} /></>}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
          <Link href="/auth/login" style={{ color: '#C8A96B', textDecoration: 'none' }}>← Back to Login</Link>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <ResetContent />
    </Suspense>
  );
}
