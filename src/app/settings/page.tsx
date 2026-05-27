'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Bell, Lock, Shield, Heart, Moon, Sun, CreditCard,
  ShoppingBag, HelpCircle, FileText, Users, Store, MessageCircle,
  LogOut, Trash2, ChevronRight, Share2, Check, Copy,
  X, Info, AlertTriangle, Smartphone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const GOLD = '#C8A96B';
const BG = '#0a0a0a';

type Section =
  | 'main' | 'notifications' | 'privacy' | 'security'
  | 'payments' | 'share' | 'delete-confirm';

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

  const [notifs, setNotifs] = useState({
    orders: true, messages: true, likes: true,
    follows: true, promos: false, newsletter: false,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true, showOrders: false,
    aiPersonalisation: true, dataSharing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('veyra-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    load();
  }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/settings'); return; }
    setUser(session.user);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('veyra-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    toast.success(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode enabled`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
    } catch { toast.error('Failed — contact support@veyra.ng'); }
    setDeleting(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://veyra-umber-sigma.vercel.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const shareApps = [
    { name: 'WhatsApp', color: '#25D366', emoji: '💬', url: 'https://wa.me/?text=Check%20out%20VEYRA%20-%20Nigeria%27s%20most%20advanced%20fashion%20marketplace%21%20https%3A%2F%2Fveyra-umber-sigma.vercel.app' },
    { name: 'Telegram', color: '#229ED9', emoji: '✈️', url: 'https://t.me/share/url?url=https%3A%2F%2Fveyra-umber-sigma.vercel.app&text=Check%20out%20VEYRA%20-%20Nigeria%27s%20AI%20Fashion%20Marketplace' },
    { name: 'X (Twitter)', color: '#fff', emoji: '𝕏', url: 'https://twitter.com/intent/tweet?text=Just%20discovered%20VEYRA%20-%20Nigeria%27s%20most%20luxurious%20fashion%20platform%20%E2%9C%A6&url=https%3A%2F%2Fveyra-umber-sigma.vercel.app' },
    { name: 'Facebook', color: '#1877F2', emoji: '📘', url: 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fveyra-umber-sigma.vercel.app' },
    { name: 'Instagram', color: '#E1306C', emoji: '📸', url: 'https://instagram.com' },
    { name: 'TikTok', color: '#ff0050', emoji: '🎵', url: 'https://tiktok.com' },
    { name: 'Snapchat', color: '#FFFC00', emoji: '👻', url: 'https://snapchat.com' },
    { name: 'Messenger', color: '#0084FF', emoji: '💙', url: 'https://www.facebook.com/dialog/send?link=https%3A%2F%2Fveyra-umber-sigma.vercel.app' },
  ];

  /* ─── styles ─── */
  const card: React.CSSProperties = {
    background: '#111', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, overflow: 'hidden', marginBottom: 12,
  };
  const row = (active = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer', background: active ? 'rgba(200,169,107,0.04)' : 'none',
    transition: 'background 0.15s',
  });
  const iconBox = (color: string): React.CSSProperties => ({
    width: 34, height: 34, borderRadius: 10,
    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });
  const toggle = (on: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12,
    background: on ? GOLD : 'rgba(255,255,255,0.12)',
    position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer',
  });
  const dot: React.CSSProperties = { width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left 0.2s' };

  /* ── Header ── */
  const Header = ({ title, back }: { title: string; back?: () => void }) => (
    <div style={{
      position: 'sticky', top: 0, zIndex: 90, height: 52,
      background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12,
    }}>
      <button onClick={back || (() => router.back())}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, fontSize: '0.9rem', marginRight: 4 }}>
        ←
      </button>
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>{title}</h2>
    </div>
  );

  /* ═══════════════════════════════════════════════
     SHARE SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'share') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Share VEYRA" back={() => setSection('main')} />
      <div style={{ padding: '1.5rem 1rem' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(200,169,107,0.15),rgba(139,92,246,0.08))',
          border: '1px solid rgba(200,169,107,0.2)', borderRadius: 20,
          padding: '20px', textAlign: 'center', marginBottom: 24,
        }}>
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>✦</p>
          <h2 style={{ fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 300, color: '#fff', marginBottom: 6 }}>Invite Friends to VEYRA</h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Share Nigeria's most luxurious fashion platform with your circle</p>
        </div>

        {/* App grid */}
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Share via</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {shareApps.map(app => (
            <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: `${app.color}18`, border: `1px solid ${app.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: app.name === 'X (Twitter)' ? '1.1rem' : '1.5rem',
                color: app.name === 'X (Twitter)' ? app.color : undefined,
              }}>
                {app.emoji}
              </div>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.2 }}>{app.name}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Or copy link</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px',
        }}>
          <span style={{ flex: 1, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            https://veyra-umber-sigma.vercel.app
          </span>
          <button onClick={copyLink} style={{
            padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(200,169,107,0.15)',
            color: copied ? '#4ade80' : GOLD, fontSize: '0.78rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          }}>
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>

        {/* Native share */}
        {typeof navigator !== 'undefined' && (navigator as any).share && (
          <button onClick={() => (navigator as any).share({ title: 'VEYRA', text: "Nigeria's most luxurious fashion platform", url: 'https://veyra-umber-sigma.vercel.app' })} style={{
            width: '100%', marginTop: 12, padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)',
            background: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Smartphone size={16} /> More options…
          </button>
        )}
      </div>
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  /* ═══════════════════════════════════════════════
     NOTIFICATIONS SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'notifications') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Notifications" back={() => setSection('main')} />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {(Object.keys(notifs) as (keyof typeof notifs)[]).map((key, i, arr) => {
            const labels: Record<string, string> = {
              orders: 'Order updates', messages: 'New messages',
              likes: 'Likes on your posts', follows: 'New followers',
              promos: 'Promotions & deals', newsletter: 'VEYRA newsletter',
            };
            return (
              <div key={key} style={{ ...row(), borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}>
                <span style={{ fontSize: '0.88rem', color: '#fff' }}>{labels[key]}</span>
                <div style={toggle(notifs[key])}>
                  <div style={{ ...dot, left: notifs[key] ? 23 : 3 }} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, padding: '0 4px' }}>
          You can also manage push notifications in your device settings. Email notifications use your registered address.
        </p>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PRIVACY SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'privacy') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Privacy" back={() => setSection('main')} />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {(Object.keys(privacy) as (keyof typeof privacy)[]).map((key, i, arr) => {
            const labels: Record<string, [string, string]> = {
              showProfile: ['Public profile', 'Anyone can view your profile'],
              showOrders: ['Show order history', 'Visible to sellers you buy from'],
              aiPersonalisation: ['AI personalisation', 'Get smarter product recommendations'],
              dataSharing: ['Analytics data sharing', 'Help improve VEYRA with usage data'],
            };
            return (
              <div key={key} style={{ ...row(), borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))}>
                  <div>
                    <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 2px' }}>{labels[key][0]}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{labels[key][1]}</p>
                  </div>
                  <div style={toggle(privacy[key])}>
                    <div style={{ ...dot, left: privacy[key] ? 23 : 3 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ ...card, padding: '14px 16px' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
            Want to download or delete your data? Email <span style={{ color: GOLD }}>privacy@veyra.ng</span> and we'll respond within 72 hours per our Privacy Policy.
          </p>
        </div>
        <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, textDecoration: 'none', marginBottom: 12 }}>
          <span style={{ fontSize: '0.88rem', color: '#fff' }}>Read full Privacy Policy</span>
          <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
        </Link>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     SECURITY SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'security') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Security" back={() => setSection('main')} />
      <div style={{ padding: '1rem' }}>
        <div style={card}>
          {[
            { label: 'Change Password', desc: 'Update your login password', href: '/auth/reset-password' },
            { label: 'Two-Factor Authentication', desc: 'Add extra security to your account', href: '/settings/2fa' },
            { label: 'Active Sessions', desc: 'Manage devices with access', href: '/settings/sessions' },
            { label: 'Login History', desc: 'See recent sign-in activity', href: '/settings/login-history' },
          ].map(({ label, desc, href }, i, arr) => (
            <Link key={label} href={href} style={{ ...row(), textDecoration: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div>
                <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </Link>
          ))}
        </div>
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Shield size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: '0.78rem', color: 'rgba(74,222,128,0.8)', lineHeight: 1.6, margin: 0 }}>
            Your account is secured with 256-bit encryption. VEYRA never stores your full card details.
          </p>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     PAYMENTS SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'payments') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Payment Methods" back={() => setSection('main')} />
      <div style={{ padding: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: 20, padding: '20px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>Accepted Payments</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Paystack', 'Flutterwave', 'Bank Transfer', 'USSD', 'Pay on Delivery'].map(m => (
              <span key={m} style={{ fontSize: '0.75rem', color: '#fff', background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 10px' }}>{m}</span>
            ))}
          </div>
        </div>
        <div style={{ ...card, padding: '16px' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
            Payment cards and bank details are securely processed by Paystack and Flutterwave. VEYRA does not store your full payment information.
            <br /><br />
            To add or remove saved cards, visit <span style={{ color: GOLD }}>your bank's Paystack portal</span> or contact <span style={{ color: GOLD }}>support@veyra.ng</span>.
          </p>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     DELETE CONFIRM SECTION
  ═══════════════════════════════════════════════ */
  if (section === 'delete-confirm') return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      <Header title="Delete Account" back={() => setSection('main')} />
      <div style={{ padding: '1.5rem 1rem' }}>
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '20px', marginBottom: 20 }}>
          <AlertTriangle size={28} style={{ color: '#ef4444', marginBottom: 12, display: 'block' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>This cannot be undone</h3>
          <ul style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 2, margin: 0, paddingLeft: 16 }}>
            <li>Your profile and posts will be permanently deleted</li>
            <li>Active orders will still be fulfilled</li>
            <li>Pending seller payouts will be held for 90 days</li>
            <li>You cannot recover your account after deletion</li>
          </ul>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm:</p>
        <input value={deleteText} onChange={e => setDeleteText(e.target.value.toUpperCase())}
          placeholder="Type DELETE here"
          style={{ width: '100%', background: '#111', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', color: '#ef4444', fontSize: '0.9rem', outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />
        <button onClick={deleteAccount} disabled={deleting || deleteText !== 'DELETE'} style={{
          width: '100%', padding: '13px', borderRadius: 14, border: 'none',
          background: deleteText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)',
          color: deleteText === 'DELETE' ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: '0.9rem', fontWeight: 700, cursor: deleteText === 'DELETE' ? 'pointer' : 'not-allowed',
        }}>
          {deleting ? 'Deleting…' : 'Permanently Delete Account'}
        </button>
        <button onClick={() => setSection('main')} style={{ width: '100%', marginTop: 10, padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
     MAIN SETTINGS PAGE
  ═══════════════════════════════════════════════ */
  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 90, height: 52,
        background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem',
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}>←</button>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Settings</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '1rem' }}>

        {/* Profile card */}
        <Link href="/profile" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg,rgba(200,169,107,0.08),rgba(139,92,246,0.04))',
          border: '1px solid rgba(200,169,107,0.2)', borderRadius: 18, padding: '14px',
          textDecoration: 'none', marginBottom: 20,
        }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: 'serif', fontSize: '1.4rem', color: '#fff' }}>{profile?.full_name?.charAt(0) || '?'}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name || 'Your Name'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>@{profile?.username || 'username'} · Tap to edit profile</p>
          </div>
          <ChevronRight size={16} style={{ color: GOLD, flexShrink: 0 }} />
        </Link>

        {/* Appearance */}
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Appearance</p>
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ ...row(), borderBottom: 'none' }} onClick={toggleTheme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox(GOLD)}>
                {theme === 'dark' ? <Moon size={15} style={{ color: GOLD }} /> : <Sun size={15} style={{ color: GOLD }} />}
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 1px' }}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Tap to switch</p>
              </div>
            </div>
            <div style={toggle(theme === 'dark')}>
              <div style={{ ...dot, left: theme === 'dark' ? 23 : 3 }} />
            </div>
          </div>
        </div>

        {/* Account */}
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Account</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { icon: Bell, label: 'Notifications', desc: 'Alerts & push settings', color: '#8B5CF6', action: () => setSection('notifications') },
            { icon: Lock, label: 'Privacy', desc: 'Control your visibility', color: '#3B82F6', action: () => setSection('privacy') },
            { icon: Shield, label: 'Security', desc: 'Password & 2FA', color: '#4ade80', action: () => setSection('security') },
            { icon: CreditCard, label: 'Payment Methods', desc: 'Cards & bank accounts', color: GOLD, action: () => setSection('payments') },
          ].map(({ icon: Icon, label, desc, color, action }, i, arr) => (
            <div key={label} style={{ ...row(), borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }} onClick={action}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconBox(color)}><Icon size={15} style={{ color }} /></div>
                <div>
                  <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 1px' }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
                </div>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          ))}
        </div>

        {/* Activity */}
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Activity</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { icon: Heart, label: 'Saved Posts', href: '/profile?tab=wishlist', color: '#ef4444' },
            { icon: ShoppingBag, label: 'Purchase History', href: '/profile?tab=orders', color: '#f59e0b' },
            { icon: Store, label: 'Seller Dashboard', href: '/dashboard/seller', color: GOLD },
          ].map(({ icon: Icon, label, href, color }, i, arr) => (
            <Link key={label} href={href} style={{ ...row(), textDecoration: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconBox(color)}><Icon size={15} style={{ color }} /></div>
                <span style={{ fontSize: '0.88rem', color: '#fff' }}>{label}</span>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </Link>
          ))}
        </div>

        {/* Share */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ ...row(), borderBottom: 'none' }} onClick={() => setSection('share')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={iconBox('#EC4899')}><Share2 size={15} style={{ color: '#EC4899' }} /></div>
              <div>
                <p style={{ fontSize: '0.88rem', color: '#fff', margin: '0 0 1px' }}>Share VEYRA</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>WhatsApp, TikTok, Telegram & more</p>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
          </div>
        </div>

        {/* Legal / Help */}
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 4 }}>Help & Legal</p>
        <div style={{ ...card, marginBottom: 16 }}>
          {[
            { icon: HelpCircle, label: 'Help Center', href: '/help', color: '#06b6d4' },
            { icon: MessageCircle, label: 'Contact Support', href: 'mailto:support@veyra.ng', color: '#8B5CF6' },
            { icon: FileText, label: 'Terms & Conditions', href: '/terms', color: 'rgba(255,255,255,0.5)' },
            { icon: Lock, label: 'Privacy Policy', href: '/privacy', color: 'rgba(255,255,255,0.5)' },
            { icon: ShoppingBag, label: 'Refund Policy', href: '/refund-policy', color: 'rgba(255,255,255,0.5)' },
            { icon: Store, label: 'Seller Policy', href: '/seller-policy', color: 'rgba(255,255,255,0.5)' },
            { icon: Users, label: 'Community Guidelines', href: '/community-guidelines', color: 'rgba(255,255,255,0.5)' },
            { icon: Info, label: 'About VEYRA', href: '/about', color: 'rgba(255,255,255,0.5)' },
          ].map(({ icon: Icon, label, href, color }, i, arr) => (
            <Link key={label} href={href} style={{ ...row(), textDecoration: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={iconBox(typeof color === 'string' && color.startsWith('rgba') ? '#fff' : color)}>
                  <Icon size={15} style={{ color: typeof color === 'string' && color.startsWith('rgba') ? 'rgba(255,255,255,0.4)' : color }} />
                </div>
                <span style={{ fontSize: '0.88rem', color: '#fff' }}>{label}</span>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </Link>
          ))}
        </div>

        {/* App info */}
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', margin: '0 0 14px' }}>
          VEYRA v1.0.0 · Built in Lagos, Nigeria 🇳🇬
        </p>

        {/* Sign out */}
        <button onClick={signOut} style={{
          width: '100%', padding: '13px', borderRadius: 14, marginBottom: 10,
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
          color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <LogOut size={15} /> Sign Out
        </button>

        {/* Delete account */}
        <button onClick={() => setSection('delete-confirm')} style={{
          width: '100%', padding: '13px', borderRadius: 14,
          background: 'none', border: '1px solid rgba(255,255,255,0.07)',
          color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Trash2 size={13} /> Delete Account
        </button>
      </div>

      <style>{`*{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
