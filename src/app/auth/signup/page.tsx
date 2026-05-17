'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'customer' | 'seller'>(searchParams.get('seller') === 'true' ? 'seller' : 'customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to verify. ✦');
      router.push('/auth/login');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-[70px] pb-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,169,107,0.06) 0%, transparent 70%)' }} className="absolute inset-0" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-light tracking-[0.3em]">
            VE<span className="text-gold">Y</span>RA
          </Link>
          <p className="text-muted text-sm mt-2">Create your account</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <h1 className="text-xl font-medium mb-5">Get started — it's free</h1>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={() => setRole('customer')}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-all ${role === 'customer' ? 'bg-gold/10 border-gold/40 text-gold' : 'glass text-muted hover:text-white'}`}>
              <ShoppingBag size={18} /> Customer
            </button>
            <button onClick={() => setRole('seller')}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-all ${role === 'seller' ? 'bg-gold/10 border-gold/40 text-gold' : 'glass text-muted hover:text-white'}`}>
              <Store size={18} /> Seller
            </button>
          </div>

          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 glass hover:bg-white/07 rounded-xl py-2.5 text-sm transition-all mb-5 border border-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/07" /></div>
            <div className="relative flex justify-center text-xs text-muted"><span className="bg-[#161616] px-3">or with email</span></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name" required
                className="w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors" />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" required
                className="w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors" />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 8 chars)" required
                className="w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60 mt-2">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#0B0B0B]/50 border-t-[#0B0B0B] rounded-full animate-spin" /> Creating account…</span> : `Create ${role === 'seller' ? 'Seller' : ''} Account`}
            </button>
          </form>

          <p className="text-xs text-muted text-center mt-4">
            By signing up you agree to our{' '}
            <Link href="#" className="text-gold/70 hover:text-gold">Terms</Link> and{' '}
            <Link href="#" className="text-gold/70 hover:text-gold">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
