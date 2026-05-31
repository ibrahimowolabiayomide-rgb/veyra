'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get('redirect') || '/';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicMode, setMagicMode] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // ── Google Sign In ──
  // Note: To remove Supabase branding from the Google consent screen,
  // go to Supabase Dashboard → Authentication → URL Configuration
  // and set Site URL to: https://veyra-umber-sigma.vercel.app
  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
    // If no error, browser redirects — no need to setLoading(false)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email'); return; }
    setLoading(true);

    if (magicMode) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
      });
      if (error) toast.error(error.message);
      else setMagicSent(true);
    } else {
      if (!password) { toast.error('Enter your password'); setLoading(false); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login')) toast.error('Wrong email or password');
        else if (error.message.toLowerCase().includes('email not confirmed')) toast.error('Please confirm your email first');
        else toast.error(error.message);
      } else {
        toast.success('Welcome back! ✦');
        router.push(redirect);
        router.refresh();
      }
    }
    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '13px 14px', color: '#fff', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  if (magicSent) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>✉️</div>
      <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 300, color: '#fff', marginBottom: 10 }}>Check your inbox</h2>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
        We sent a magic link to <strong style={{ color: '#C8A96B' }}>{email}</strong>
      </p>
      <button onClick={() => { setMagicSent(false); setLoading(false); }}
        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 50, padding: '9px 20px', fontSize: '0.82rem', cursor: 'pointer' }}>
        ← Try again
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'Georgia,serif', fontSize: '2.2rem', fontWeight: 300, letterSpacing: '0.35em', color: '#fff', textDecoration: 'none', marginBottom: 6, paddingRight: '0.35em' }}>
          VE<span style={{ color: '#C8A96B' }}>Y</span>RA
        </Link>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 36 }}>Fashion Meets Intelligence</p>

        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.5rem', fontWeight: 300, color: '#fff', marginBottom: 4, textAlign: 'center' }}>Welcome back</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 24 }}>Sign in to your VEYRA account</p>

          {/* ── Google Sign In ── */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 14, marginBottom: 14,
              background: '#fff', border: 'none',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: googleLoading ? 0.75 : 1, transition: 'opacity 0.2s, transform 0.15s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => !googleLoading && ((e.target as HTMLElement).closest('button')!.style.transform = 'scale(0.99)')}
            onMouseLeave={e => ((e.target as HTMLElement).closest('button')!.style.transform = 'scale(1)')}
          >
            {googleLoading ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: googleLoading ? '#999' : '#000' }}>
              {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" autoComplete="email"
                style={{ ...inp, paddingLeft: 40 }} />
            </div>

            {!magicMode && (
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" autoComplete="current-password"
                  style={{ ...inp, paddingLeft: 40, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => setMagicMode(!magicMode)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                {magicMode ? 'Use password instead' : 'Use magic link instead'}
              </button>
              {!magicMode && (
                <Link href="/auth/reset-password" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: loading ? 'rgba(200,169,107,0.5)' : 'linear-gradient(135deg,#C8A96B,#A8872A)',
              border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : magicMode ? 'Send Magic Link' : <>Sign In <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
            No account?{' '}
            <Link href={`/auth/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              style={{ color: '#C8A96B', textDecoration: 'none', fontWeight: 500 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <LoginContent />
    </Suspense>
  );
}
