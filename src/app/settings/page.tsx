'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Bell, Lock, Shield, Heart, Moon, Sun, CreditCard,
  ShoppingBag, HelpCircle, FileText, Users, Store, MessageCircle,
  LogOut, Trash2, ChevronRight, Share2, Check, Copy,
  AlertTriangle, Smartphone, Edit2, Info,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const GOLD = '#C8A96B';

type Section = 'main' | 'notifications' | 'privacy' | 'security' | 'payments' | 'share' | 'delete-confirm';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [section, setSection] = useState<Section>('main');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [notifs, setNotifs] = useState({ orders: true, messages: true, likes: true, follows: true, promos: false, newsletter: false });
  const [privacy, setPrivacy] = useState({ showProfile: true, showOrders: false, aiPersonalisation: true, dataSharing: false });

  useEffect(() => {
    const saved = localStorage.getItem('veyra-theme') as 'dark' | 'light' | null;
    if (saved) { setTheme(saved); applyTheme(saved); }
    load();
  }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/settings'); return; }
    setUser(session.user);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
  };

  const applyTheme = (t: 'dark' | 'light') => {
    if (t === 'light') {
      document.body.style.background = '#f8f8f6';
      document.body.style.color = '#0a0a0a';
      document.documentElement.style.setProperty('--bg', '#f8f8f6');
      document.documentElement.style.setProperty('--text', '#0a0a0a');
      document.documentElement.style.setProperty('--card', '#fff');
      document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--muted', 'rgba(0,0,0,0.4)');
    } else {
      document.body.style.background = '#0a0a0a';
      document.body.style.color = '#fff';
      document.documentElement.style.setProperty('--bg', '#0a0a0a');
      document.documentElement.style.setProperty('--text', '#fff');
      document.documentElement.style.setProperty('--card', '#111');
      document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.07)');
      document.documentElement.style.setProperty('--muted', 'rgba(255,255,255,0.4)');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('veyra-theme', next);
    applyTheme(next);
    toast.success(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode enabled`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    applyTheme('dark');
    localStorage.removeItem('veyra-theme');
    toast.success('Signed out');
    router.push('/');
  };

  const deleteAccount = async () => {
    if (deleteText !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    setDeleting(true);
    try {
      await supabase.from('profiles').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', user.id);
      await supabase.auth.signOut();
      toast.success('Account deleted');
      router.push('/');
    } catch { toast.error('Failed — contact support'); }
    setDeleting(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://veyra-umber-sigma.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const username = profile?.full_name || profile?.username || 'user';
  const supportMsg = encodeURIComponent(`Hi, I'm ${username} and I need support.`);
  const waNumber = '2348000000000'; // hidden — routed through support system

  /* ── Shared styles ── */
  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0a' : '#f8f8f6';
  const cardBg = isDark ? '#111' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textMain = isDark ? '#fff' : '#0a0a0a';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)';
  const textFaint = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

  const card: React.CSSProperties = { background: cardBg, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 };
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${border}`, cursor: 'pointer' };
  const iconBox = (color: string): React.CSSProperties => ({ width: 34, height: 34, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
  const toggle = (on: boolean): React.CSSProperties => ({ width: 44, height: 24, borderRadius: 12, background: on ? GOLD : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'), position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer' });
  const dot: React.CSSProperties = { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' };

  const Header = ({ title }: { title: string }) => (
    <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: isDark ? 'rgba(10,10,10,0.97)' : 'rgba(248,248,246,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12 }}>
      <button onClick={() => section === 'main' ? router.back() : setSection('main')} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 4, fontSize: '0.9rem' }}>←</button>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: textMain, margin: 0 }}>{title}</h2>
    </div>
  );

  /* ══ SHARE SECTION ══ */
  if (section === 'share') {
    const shareApps = [
      { name: 'WhatsApp', url: `https://wa.me/?text=Check%20out%20VEYRA%20-%20Nigeria%27s%20most%20luxurious%20fashion%20marketplace%21%20https%3A%2F%2Fveyra-umber-sigma.vercel.app`, svg: (<svg viewBox="0 0 24 24" width="26" height="26" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.523 5.837L.057 23.882a.5.5 0 0 0 .606.63l6.198-1.624A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.901 0-3.68-.51-5.21-1.402l-.374-.214-3.878 1.017.984-3.793-.234-.389A9.945 9.945 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>) },
      { name: 'Telegram', url: `https://t.me/share/url?url=https%3A%2F%2Fveyra-umber-sigma.vercel.app&text=Check%20out%20VEYRA`, svg: (<svg viewBox="0 0 24 24" width="26" height="26" fill="#229ED9"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.545 13.931l-2.98-.929c-.648-.203-.66-.648.136-.961l11.647-4.492c.537-.194 1.006.131.546 1.672z"/></svg>) },
      { name: 'X', url: `https://twitter.com/intent/tweet?text=Just%20discovered%20VEYRA%20%E2%9C%A6&url=https%3A%2F%2Fveyra-umber-sigma.vercel.app`, svg: (<svg viewBox="0 0 24 24" width="22" height="22" fill={isDark ? '#fff' : '#000'}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>) },
      { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fveyra-umber-sigma.vercel.app`, svg: (<svg viewBox="0 0 24 24" width="26" height="26" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
      { name: 'Instagram', url: `https://instagram.com`, svg: (<svg viewBox="0 0 24 24" width="26" height="26"><defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs><path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
      { name: 'TikTok', url: `https://tiktok.com`, svg: (<svg viewBox="0 0 24 24" width="24" height="24"><path fill={isDark ? '#fff' : '#000'} d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.29 6.29 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>) },
      { name: 'Snapchat', url: `https://snapchat.com`, svg: (<svg viewBox="0 0 24 24" width="26" height="26" fill="#FFFC00"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.053.029.114.058.192.088.131.048.315.093.56.093.422-.002.906-.169 1.47-.519.099-.061.219-.094.327-.094.39-.002.794.315.794.702 0 .478-.575.947-1.244 1.254-.125.063-.26.122-.394.181-.479.214-1.074.48-1.222 1.014-.012.04-.016.078-.017.112-.003.102.017.218.051.344l.01.043c.285 1.071 1.175 3.232 3.648 3.792.134.031.228.149.228.288v.005c0 1.315-2.528 1.88-3.77 2.197-.128.033-.248.063-.369.094l-.047.012c-.192.052-.433.118-.503.392-.079.313-.158.626-.325.939l-.003.005c-.111.217-.206.247-.382.247-.073 0-.161-.01-.274-.029-.329-.055-.738-.126-1.32-.126-.285 0-.592.022-.927.066-.517.069-1.051.291-1.614.522-.634.258-1.29.525-2.083.525-.795 0-1.45-.267-2.083-.525-.563-.231-1.097-.453-1.614-.522-.335-.044-.642-.066-.927-.066-.584 0-.992.071-1.319.126-.114.019-.201.029-.275.029-.176 0-.271-.03-.383-.247l-.003-.005c-.167-.313-.247-.626-.325-.939-.07-.274-.311-.34-.503-.392l-.047-.012c-.121-.031-.241-.061-.369-.094C2.528 19.13 0 18.565 0 17.25v-.005c0-.139.094-.257.228-.288 2.473-.56 3.363-2.721 3.648-3.792l.01-.043c.034-.126.054-.242.051-.344-.001-.034-.005-.072-.017-.112-.148-.534-.743-.8-1.222-1.014-.134-.059-.269-.118-.394-.181C1.575 11.204 1 10.735 1 10.257c0-.387.404-.704.794-.702.108 0 .228.033.327.094.564.35 1.048.517 1.47.519.245 0 .429-.045.56-.093.078-.03.139-.059.192-.088l-.03-.51-.003-.06c-.104-1.628-.23-3.654.299-4.847C6.059 1.069 9.416.793 10.406.793h.008c.282 0 .571.016.857.049.287-.033.576-.049.857-.049h.078z"/></svg>) },
      { name: 'Messenger', url: `https://www.facebook.com/dialog/send?link=https%3A%2F%2Fveyra-umber-sigma.vercel.app`, svg: (<svg viewBox="0 0 24 24" width="26" height="26" fill="#0084FF"><path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.626 0 12-4.975 12-11.111S18.626 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/></svg>) },
    ];

    return (
      <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
        <Header title="Share VEYRA" />
        <div style={{ padding: '1.5rem 1rem' }}>
          <div style={{ background: isDark ? 'linear-gradient(135deg,rgba(200,169,107,0.12),rgba(139,92,246,0.06))' : 'linear-gradient(135deg,rgba(200,169,107,0.08),rgba(139,92,246,0.04))', border: `1px solid ${isDark ? 'rgba(200,169,107,0.2)' : 'rgba(200,169,107,0.3)'}`, borderRadius: 20, padding: '20px', textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>✦</p>
            <h2 style={{ fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 300, color: textMain, marginBottom: 6 }}>Invite Friends to VEYRA</h2>
            <p style={{ fontSize: '0.82rem', color: textMuted, lineHeight: 1.6 }}>Share fashion&apos;s most luxurious platform</p>
          </div>

          <p style={{ fontSize: '0.7rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Share via</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {shareApps.map(app => (
              <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {app.svg}
                </div>
                <span style={{ fontSize: '0.62rem', color: textMuted, textAlign: 'center' }}>{app.name}</span>
              </a>
            ))}
          </div>

          <p style={{ fontSize: '0.7rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Copy link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '12px 14px' }}>
            <span style={{ flex: 1, fontSize: '0.82rem', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>veyra-umber-sigma.vercel.app</span>
            <button onClick={copyLink} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(200,169,107,0.15)', color: copied ? '#4ade80' : GOLD, fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
            </button>
          </div>

          {typeof navigator !== 'undefined' && (navigator as any).share && (
            <button onClick={() => (navigator as any).share({ title: 'VEYRA', text: "Nigeria's most luxurious fashion platform", url: 'https://veyra-umber-sigma.vercel.app' })} style={{ width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, border: `1px solid ${border}`, background: 'none', color: textMuted, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Smartphone size={16} /> More options…
            </button>
          )}
        </div>
        <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
      </div>
    );
  }

  /* ══ NOTIFICATIONS ══ */
  if (section === 'notifications') return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Notifications" />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {(Object.keys(notifs) as (keyof typeof notifs)[]).map((key, i, arr) => {
            const labels: Record<string, string> = { orders: 'Order updates', messages: 'New messages', likes: 'Likes on posts', follows: 'New followers', promos: 'Promotions', newsletter: 'Newsletter' };
            return (
              <div key={key} style={{ ...row, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }} onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}>
                <span style={{ fontSize: '0.88rem', color: textMain }}>{labels[key]}</span>
                <div style={toggle(notifs[key])}><div style={{ ...dot, left: notifs[key] ? 23 : 3 }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ══ PRIVACY ══ */
  if (section === 'privacy') return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Privacy" />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {(Object.keys(privacy) as (keyof typeof privacy)[]).map((key, i, arr) => {
            const labels: Record<string, [string, string]> = { showProfile: ['Public profile', 'Anyone can view your profile'], showOrders: ['Show order history', 'Visible to sellers you buy from'], aiPersonalisation: ['AI personalisation', 'Smarter product recommendations'], dataSharing: ['Analytics sharing', 'Help improve VEYRA'] };
            return (
              <div key={key} style={{ ...row, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))}>
                  <div>
                    <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 2px' }}>{labels[key][0]}</p>
                    <p style={{ fontSize: '0.72rem', color: textMuted, margin: 0 }}>{labels[key][1]}</p>
                  </div>
                  <div style={toggle(privacy[key])}><div style={{ ...dot, left: privacy[key] ? 23 : 3 }} /></div>
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: cardBg, border: `1px solid ${border}`, borderRadius: 16, textDecoration: 'none' }}>
          <span style={{ fontSize: '0.88rem', color: textMain }}>Read Privacy Policy</span>
          <ChevronRight size={15} style={{ color: textFaint }} />
        </Link>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ══ SECURITY ══ */
  if (section === 'security') return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Security" />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {[
            { label: 'Change Password', href: '/auth/reset-password' },
            { label: 'Two-Factor Authentication', href: '/settings/2fa' },
            { label: 'Active Sessions', href: '/settings/sessions' },
            { label: 'Login History', href: '/settings/login-history' },
          ].map(({ label, href }, i, arr) => (
            <Link key={label} href={href} style={{ ...row, textDecoration: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
              <span style={{ fontSize: '0.88rem', color: textMain }}>{label}</span>
              <ChevronRight size={15} style={{ color: textFaint }} />
            </Link>
          ))}
        </div>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ══ PAYMENTS ══ */
  if (section === 'payments') return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Payment Methods" />
      <div style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.7rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Naira (₦ NGN)</p>
        <div style={card}>
          {[
            { label: 'Bank Transfer', desc: 'Pay directly from any Nigerian bank', icon: '🏦' },
            { label: 'USSD', desc: '*737#, *901#, *966# and more', icon: '📱' },
            { label: 'Paystack', desc: 'Cards, bank, USSD via Paystack', icon: '💳' },
            { label: 'Flutterwave', desc: 'Cards, mobile money, bank', icon: '⚡' },
            { label: 'Pay on Delivery', desc: 'Cash on delivery (Lagos & Abuja)', icon: '🤝' },
          ].map(({ label, desc, icon }, i, arr) => (
            <div key={label} style={{ ...row, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <div>
                  <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>{desc}</p>
                </div>
              </div>
              <Check size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.7rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 16 }}>Dollar ($ USD)</p>
        <div style={card}>
          {[
            { label: 'Stripe', desc: 'Visa, Mastercard, American Express', icon: '💳' },
            { label: 'PayPal', desc: 'Pay with your PayPal balance', icon: '🅿️' },
            { label: 'Cryptocurrency', desc: 'BTC, USDT, ETH (coming soon)', icon: '₿' },
          ].map(({ label, desc, icon }, i, arr) => (
            <div key={label} style={{ ...row, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <div>
                  <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: textFaint, lineHeight: 1.6, padding: '0 4px', marginTop: 10 }}>
          All transactions are secured by 256-bit encryption. VEYRA never stores your full card details.
        </p>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ══ DELETE CONFIRM ══ */
  if (section === 'delete-confirm') return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Delete Account" />
      <div style={{ padding: '1.5rem 1rem' }}>
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '20px', marginBottom: 20 }}>
          <AlertTriangle size={28} style={{ color: '#ef4444', marginBottom: 12, display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>This cannot be undone</h3>
          <ul style={{ fontSize: '0.82rem', color: textMuted, lineHeight: 2, margin: 0, paddingLeft: 16 }}>
            <li>Your profile and posts are permanently deleted</li>
            <li>Active orders will still be fulfilled</li>
            <li>Pending payouts held for 90 days</li>
          </ul>
        </div>
        <p style={{ fontSize: '0.82rem', color: textMuted, marginBottom: 10 }}>Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm:</p>
        <input value={deleteText} onChange={e => setDeleteText(e.target.value.toUpperCase())} placeholder="Type DELETE here"
          style={{ width: '100%', background: cardBg, border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', color: '#ef4444', fontSize: '0.9rem', outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
        <button onClick={deleteAccount} disabled={deleting || deleteText !== 'DELETE'} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: deleteText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)', color: deleteText === 'DELETE' ? '#fff' : textFaint, fontSize: '0.9rem', fontWeight: 700, cursor: deleteText === 'DELETE' ? 'pointer' : 'not-allowed' }}>
          {deleting ? 'Deleting…' : 'Permanently Delete Account'}
        </button>
        <button onClick={() => setSection('main')} style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 14, border: `1px solid ${border}`, background: 'none', color: textMuted, fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ══ MAIN SETTINGS ══ */
  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80, transition: 'background 0.3s' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: isDark ? 'rgba(10,10,10,0.97)' : 'rgba(248,248,246,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 4 }}>←</button>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: textMain, margin: 0 }}>Settings</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Profile card */}
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, background: isDark ? 'linear-gradient(135deg,rgba(200,169,107,0.08),rgba(139,92,246,0.04))' : 'linear-gradient(135deg,rgba(200,169,107,0.06),rgba(139,92,246,0.03))', border: `1px solid ${isDark ? 'rgba(200,169,107,0.2)' : 'rgba(200,169,107,0.3)'}`, borderRadius: 18, padding: '14px', textDecoration: 'none', marginBottom: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'serif', fontSize: '1.4rem', color: '#fff' }}>{profile?.full_name?.charAt(0) || '?'}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: textMain, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Your Name'}</p>
            <p style={{ fontSize: '0.75rem', color: textMuted, margin: 0 }}>@{profile?.username || 'username'} · Tap to edit profile</p>
          </div>
          <ChevronRight size={16} style={{ color: GOLD, flexShrink: 0 }} />
        </Link>

        {/* Theme toggle */}
        <p style={{ fontSize: '0.65rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Appearance</p>
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ ...row, borderBottom: 'none' }} onClick={toggleTheme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox(GOLD)}>{theme === 'dark' ? <Moon size={15} style={{ color: GOLD }} /> : <Sun size={15} style={{ color: GOLD }} />}</div>
              <div>
                <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 1px' }}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>Tap to switch</p>
              </div>
            </div>
            <div style={toggle(theme === 'dark')}><div style={{ ...dot, left: theme === 'dark' ? 23 : 3 }} /></div>
          </div>
        </div>

        {/* Account */}
        <p style={{ fontSize: '0.65rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Account</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { icon: Bell, label: 'Notifications', color: '#8B5CF6', action: () => setSection('notifications') },
            { icon: Lock, label: 'Privacy', color: '#3B82F6', action: () => setSection('privacy') },
            { icon: Shield, label: 'Security', color: '#4ade80', action: () => setSection('security') },
            { icon: CreditCard, label: 'Payment Methods', color: GOLD, action: () => setSection('payments') },
          ].map(({ icon: Icon, label, color, action }, i, arr) => (
            <div key={label} style={{ ...row, borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }} onClick={action}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconBox(color)}><Icon size={15} style={{ color }} /></div>
                <span style={{ fontSize: '0.88rem', color: textMain }}>{label}</span>
              </div>
              <ChevronRight size={15} style={{ color: textFaint }} />
            </div>
          ))}
        </div>

        {/* Activity */}
        <p style={{ fontSize: '0.65rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Activity</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { icon: Heart, label: 'Saved Posts', href: '/profile?tab=wishlist', color: '#ef4444' },
            { icon: ShoppingBag, label: 'Purchase History', href: '/profile?tab=orders', color: '#f59e0b' },
            { icon: Store, label: 'Seller Dashboard', href: '/dashboard/seller', color: GOLD },
          ].map(({ icon: Icon, label, href, color }, i, arr) => (
            <Link key={label} href={href} style={{ ...row, textDecoration: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconBox(color)}><Icon size={15} style={{ color }} /></div>
                <span style={{ fontSize: '0.88rem', color: textMain }}>{label}</span>
              </div>
              <ChevronRight size={15} style={{ color: textFaint }} />
            </Link>
          ))}
        </div>

        {/* Share */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ ...row, borderBottom: 'none' }} onClick={() => setSection('share')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox('#EC4899')}><Share2 size={15} style={{ color: '#EC4899' }} /></div>
              <div>
                <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 1px' }}>Share VEYRA</p>
                <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>WhatsApp, TikTok, Telegram & more</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: textFaint }} />
          </div>
        </div>

        {/* Support */}
        <p style={{ fontSize: '0.65rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Support</p>
        <div style={{ ...card, marginBottom: 16 }}>
          <a href={`mailto:support@veyra.ng?subject=Support%20Request&body=Hi%2C%20I'm%20${encodeURIComponent(username)}%20and%20I%20need%20support.`}
            style={{ ...row, textDecoration: 'none', borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox('#8B5CF6')}><MessageCircle size={15} style={{ color: '#8B5CF6' }} /></div>
              <div>
                <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 1px' }}>Email Support</p>
                <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>support@veyra.ng</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: textFaint }} />
          </a>
          <a href={`https://wa.me/${waNumber}?text=${supportMsg}`} target="_blank" rel="noopener noreferrer"
            style={{ ...row, textDecoration: 'none', borderBottom: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox('#25D366')}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.523 5.837L.057 23.882a.5.5 0 0 0 .606.63l6.198-1.624A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.901 0-3.68-.51-5.21-1.402l-.374-.214-3.878 1.017.984-3.793-.234-.389A9.945 9.945 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', color: textMain, margin: '0 0 1px' }}>WhatsApp Support</p>
                <p style={{ fontSize: '0.7rem', color: textMuted, margin: 0 }}>Chat with our team</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: textFaint }} />
          </a>
        </div>

        {/* Legal */}
        <p style={{ fontSize: '0.65rem', color: textFaint, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Legal</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { label: 'Help Center', href: '/help' },
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Refund Policy', href: '/refund-policy' },
            { label: 'Seller Policy', href: '/seller-policy' },
            { label: 'Community Guidelines', href: '/community-guidelines' },
            { label: 'About VEYRA', href: '/about' },
          ].map(({ label, href }, i, arr) => (
            <Link key={label} href={href} style={{ ...row, textDecoration: 'none', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
              <span style={{ fontSize: '0.85rem', color: textMain }}>{label}</span>
              <ChevronRight size={15} style={{ color: textFaint }} />
            </Link>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: textFaint, margin: '0 0 14px' }}>VEYRA v1.0.0</p>

        <button onClick={signOut} style={{ width: '100%', padding: '13px', borderRadius: 14, marginBottom: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <LogOut size={15} /> Sign Out
        </button>
        <button onClick={() => setSection('delete-confirm')} style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'none', border: `1px solid ${border}`, color: textFaint, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Trash2 size={13} /> Delete Account
        </button>
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
