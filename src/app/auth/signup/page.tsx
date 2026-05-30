'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, Store, ArrowRight, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

function SignupContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const isSeller = sp.get('seller') === 'true';
  const redirect = sp.get('redirect') || '/';
  const supabase = createClient();

  const [role, setRole] = useState<'buyer' | 'seller'>(isSeller ? 'seller' : 'buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeSlug: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  const createProfile = async (userId: string, userName: string, userRole: string) => {
    const username = userName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Math.floor(Math.random() * 9999);
    try {
      // Try upsert first (handles duplicate key gracefully)
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: userName.trim(),
        username,
        role: userRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id', ignoreDuplicates: false });
      return !error;
    } catch { return false; }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Enter your full name'); return; }
    if (!form.email.trim()) { toast.error('Enter your email'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!agreed) { toast.error('Please accept the terms'); return; }
    if (role === 'seller' && !form.storeName.trim()) { toast.error('Enter your store name'); return; }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim(), role, store_name: role === 'seller' ? form.storeName.trim() : null },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
      },
    });

    if (error) {
      // Handle specific errors clearly
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        toast.error('This email is already registered — try signing in instead');
      } else if (error.message.toLowerCase().includes('database')) {
        // Database error — account may still have been created, try to create profile separately
        toast.error('Account created but setup had an issue — please sign in and complete your profile');
        setDone(true);
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile — don't block signup if this fails
      await createProfile(data.user.id, form.name, role);

      // Create store for sellers
      if (role === 'seller') {
        const slug = form.storeName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString().slice(-5);
        try {
          await supabase.from('stores').insert({
            owner_id: data.user.id,
            store_name: form.storeName.trim(),
            store_slug: form.storeSlug || slug,
            is_active: true,
            created_at: new Date().toISOString(),
          });
        } catch { /* Store created later in onboarding */ }
      }

      if (data.session) {
        toast.success('Welcome to VEYRA! ✦');
        router.push(redirect);
      } else {
        setDone(true);
      }
    }

    setLoading(false);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '13px 14px', color: '#fff', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
  };

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <Check size={28} style={{ color: '#4ade80' }} />
      </div>
      <h2 style={{ fontFamily: 'serif', fontSize: '1.6rem', fontWeight: 300, color: '#fff', marginBottom: 10 }}>Check your email!</h2>
      <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
        We sent a confirmation link to <strong style={{ color: '#C8A96B' }}>{form.email}</strong>. Click it to activate your account.
      </p>
      <Link href="/auth/login" style={{ background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', borderRadius: 50, padding: '11px 28px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}>
        Go to Login
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <Link href="/" style={{ fontFamily: 'serif', fontSize: '2.2rem', fontWeight: 300, letterSpacing: '0.35em', color: '#fff', textDecoration: 'none', marginBottom: 6, paddingRight: '0.35em' }}>
          VE<span style={{ color: '#C8A96B' }}>Y</span>RA
        </Link>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>Fashion Meets Intelligence</p>

        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.6rem', fontWeight: 300, color: '#fff', marginBottom: 6, textAlign: 'center' }}>Create account</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 24 }}>Join Nigeria&apos;s fashion community</p>

          {/* Google button */}
          <button onClick={handleGoogleSignup} disabled={googleLoading} style={{
            width: '100%', padding: '13px', borderRadius: 14, marginBottom: 16,
            background: '#fff', border: 'none', cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: googleLoading ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
            {googleLoading ? (
              <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#000' }}>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'buyer', icon: '🛍️', label: 'Shop', desc: 'Discover & buy fashion' },
              { key: 'seller', icon: '🏪', label: 'Sell', desc: 'List & sell products' },
            ].map(({ key, icon, label, desc }) => (
              <button key={key} type="button" onClick={() => setRole(key as 'buyer' | 'seller')} style={{
                padding: '12px 10px', borderRadius: 14,
                border: `1px solid ${role === key ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: role === key ? 'rgba(200,169,107,0.08)' : '#111',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: role === key ? '#C8A96B' : '#fff', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name" autoComplete="name" style={{ ...inp, paddingLeft: 40 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email address" autoComplete="email" style={{ ...inp, paddingLeft: 40 }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Password (min 6 characters)" autoComplete="new-password" style={{ ...inp, paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {role === 'seller' && (
              <div style={{ position: 'relative' }}>
                <Store size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                <input type="text" value={form.storeName}
                  onChange={e => { const n = e.target.value; const s = n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); setForm(f => ({ ...f, storeName: n, storeSlug: s })); }}
                  placeholder="Store name" style={{ ...inp, paddingLeft: 40 }} />
              </div>
            )}
            {role === 'seller' && form.storeSlug && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: -4, paddingLeft: 2 }}>
                veyra.ng/seller/<span style={{ color: '#C8A96B' }}>{form.storeSlug}</span>
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 2, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${agreed ? '#C8A96B' : 'rgba(255,255,255,0.2)'}`, background: agreed ? '#C8A96B' : 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1, transition: 'all 0.15s' }}>
                {agreed && <Check size={11} style={{ color: '#000' }} />}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                I agree to the <Link href="/terms" onClick={e => e.stopPropagation()} style={{ color: '#C8A96B', textDecoration: 'none' }}>Terms</Link> and <Link href="/privacy" onClick={e => e.stopPropagation()} style={{ color: '#C8A96B', textDecoration: 'none' }}>Privacy Policy</Link>
              </p>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 14, marginTop: 6,
              background: loading ? 'rgba(200,169,107,0.5)' : 'linear-gradient(135deg,#C8A96B,#A8872A)',
              border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading
                ? <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <>Create Account <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
            Already have an account?{' '}
            <Link href={`/auth/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              style={{ color: '#C8A96B', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <SignupContent />
    </Suspense>
  );
}
