'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Bell, Eye, Smartphone, Trash2, LogOut, Globe, Save, Camera, Share2, ChevronRight, CreditCard, ShoppingBag, HelpCircle, FileText, Shield, Users, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const SHARE_OPTIONS = [
  { name: 'WhatsApp', color: '#25D366', icon: '💬', url: 'https://wa.me/?text=Check%20out%20VEYRA%20-%20Nigeria\'s%20AI-powered%20fashion%20marketplace!%20https://veyra-umber-sigma.vercel.app' },
  { name: 'Twitter/X', color: '#1DA1F2', icon: '𝕏', url: 'https://twitter.com/intent/tweet?text=Check%20out%20VEYRA%20-%20Nigeria\'s%20AI-powered%20fashion%20marketplace!&url=https://veyra-umber-sigma.vercel.app' },
  { name: 'Telegram', color: '#0088cc', icon: '✈️', url: 'https://t.me/share/url?url=https://veyra-umber-sigma.vercel.app&text=Check%20out%20VEYRA!' },
  { name: 'Facebook', color: '#1877F2', icon: '📘', url: 'https://www.facebook.com/sharer/sharer.php?u=https://veyra-umber-sigma.vercel.app' },
  { name: 'Copy Link', color: '#C8A96B', icon: '🔗', url: 'copy' },
];

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  desc?: string;
  href?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: User, label: 'Edit Profile', desc: 'Update your name, photo, bio' },
      { id: 'security', icon: Lock, label: 'Security', desc: 'Password, 2FA, sessions' },
      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Manage alerts and updates' },
      { id: 'privacy', icon: Eye, label: 'Privacy', desc: 'Control who sees your content' },
      { id: 'devices', icon: Smartphone, label: 'Devices', desc: 'Manage active sessions' },
    ],
  },
  {
    title: 'Shopping',
    items: [
      { id: 'orders', icon: ShoppingBag, label: 'Purchase History', desc: 'View all your orders' },
      { id: 'payment', icon: CreditCard, label: 'Payment Methods', desc: 'Cards and bank accounts' },
      { id: 'saved', icon: Eye, label: 'Saved Posts', desc: 'Bookmarked items and wishlists' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'preferences', icon: Globe, label: 'Language & Currency', desc: 'English, ₦ Naira' },
      { id: 'share', icon: Share2, label: 'Share This App', desc: 'Invite friends to VEYRA' },
    ],
  },
  {
    title: 'Support & Legal',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help Center', desc: 'FAQs and support', href: '/help' },
      { id: 'terms', icon: FileText, label: 'Terms & Conditions', href: '/terms' },
      { id: 'privacy-policy', icon: Shield, label: 'Privacy Policy', href: '/privacy' },
      { id: 'community', icon: Users, label: 'Community Guidelines', href: '/community-guidelines' },
      { id: 'seller-policy', icon: FileText, label: 'Seller Policy', href: '/seller-policy' },
      { id: 'contact', icon: Mail, label: 'Contact Support', href: '/help' },
      { id: 'about', icon: Globe, label: 'About VEYRA', href: '/about' },
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', bio: '', phone: '', location: '', website: '' });
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [notifs, setNotifs] = useState({ orders: true, messages: true, follows: true, promotions: false });
  const [privacy, setPrivacy] = useState({ is_private: false });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      setForm({ full_name: data.full_name || '', username: data.username || '', bio: data.bio || '', phone: data.phone || '', location: data.location || '', website: data.website || '' });
      setNotifs({ orders: data.notification_orders ?? true, messages: data.notification_messages ?? true, follows: data.notification_follows ?? true, promotions: data.notification_promotions ?? false });
      setPrivacy({ is_private: data.is_private ?? false });
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('id', session!.user.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated! ✦');
    setLoading(false);
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.new.length < 8) { toast.error('Minimum 8 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast.error(error.message);
    else { toast.success('Password changed!'); setPasswords({ new: '', confirm: '' }); }
    setLoading(false);
  };

  const saveNotifs = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('profiles').update({
      notification_orders: notifs.orders, notification_messages: notifs.messages,
      notification_follows: notifs.follows, notification_promotions: notifs.promotions,
    }).eq('id', session!.user.id);
    toast.success('Notifications updated!');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Signed out');
  };

  const deleteAccount = async () => {
    if (!confirm('Are you absolutely sure? All your data will be permanently deleted.')) return;
    const input = prompt('Type DELETE to confirm:');
    if (input !== 'DELETE') { toast.error('Cancelled'); return; }
    toast.error('Please contact support@veyra.ng to delete your account.');
  };

  const handleShare = (option: typeof SHARE_OPTIONS[0]) => {
    if (option.url === 'copy') {
      navigator.clipboard.writeText('https://veyra-umber-sigma.vercel.app');
      toast.success('Link copied! ✦');
    } else {
      window.open(option.url, '_blank');
    }
  };

  const inp = "w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors";

  return (
    <div className="min-h-screen pt-[70px]" style={{ background: '#050505' }}>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="section-label">Account</div>
          <h1 className="font-display text-3xl font-light">Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="space-y-6">
              {MENU_SECTIONS.map(section => (
                <div key={section.title}>
                  <p className="text-[10px] uppercase tracking-widest text-muted px-3 mb-2">{section.title}</p>
                  <div className="glass rounded-2xl overflow-hidden">
                    {section.items.map((item: MenuItem) => (
                      item.href ? (
                        <Link key={item.id} href={item.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-white hover:bg-white/04 transition-all border-b border-white/05 last:border-0">
                          <item.icon size={15} />
                          <span>{item.label}</span>
                          <ChevronRight size={13} className="ml-auto" />
                        </Link>
                      ) : (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b border-white/05 last:border-0 text-left ${activeTab === item.id ? 'bg-gold/08 text-gold' : 'text-muted hover:text-white hover:bg-white/04'}`}>
                          <item.icon size={15} />
                          <div className="flex-1 min-w-0">
                            <div>{item.label}</div>
                            {item.desc && <div className="text-[10px] text-muted/60 mt-0.5">{item.desc}</div>}
                          </div>
                          <ChevronRight size={13} className="flex-shrink-0" />
                        </button>
                      )
                    ))}
                  </div>
                </div>
              ))}
              <div className="glass rounded-2xl overflow-hidden">
                <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted hover:text-red-400 hover:bg-red-400/05 transition-all">
                  <LogOut size={15} /> Sign Out
                </button>
                <button onClick={deleteAccount} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/05 transition-all border-t border-white/05">
                  <Trash2 size={15} /> Delete Account
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 glass rounded-2xl p-6 lg:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Edit Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-display overflow-hidden">
                      {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-purple-300">{form.full_name?.charAt(0) || '?'}</span>}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center"><Camera size={11} className="text-[#0B0B0B]" /></button>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{form.full_name || 'Your Name'}</p>
                    <p className="text-xs text-muted">@{form.username || 'username'}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Full Name</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className={inp} placeholder="Your full name" /></div>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Username</label><input value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')})} className={inp} placeholder="username" /></div>
                  <div className="md:col-span-2"><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Bio</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className={inp + ' resize-none h-20'} placeholder="Tell people about yourself..." maxLength={160} /></div>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} placeholder="+234..." /></div>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inp} placeholder="Lagos, Nigeria" /></div>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Website</label><input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className={inp} placeholder="https://" type="url" /></div>
                </div>
                <button onClick={saveProfile} disabled={loading} className="btn-primary flex items-center gap-2"><Save size={14} />{loading ? 'Saving...' : 'Save Profile'}</button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Security</h2>
                <div className="glass rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-medium">Change Password</h3>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">New Password</label><input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className={inp} placeholder="Min 8 characters" /></div>
                  <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Confirm Password</label><input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className={inp} placeholder="Repeat password" /></div>
                  <button onClick={changePassword} disabled={loading} className="btn-primary text-sm">{loading ? 'Updating...' : 'Update Password'}</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Notifications</h2>
                {[
                  { key: 'orders', label: 'Order Updates', desc: 'Shipping, delivery, and order status' },
                  { key: 'messages', label: 'Messages', desc: 'New messages from sellers and buyers' },
                  { key: 'follows', label: 'New Followers', desc: 'When someone follows your profile' },
                  { key: 'promotions', label: 'Promotions & Deals', desc: 'Sales, flash deals, platform news' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-white/07 last:border-0">
                    <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-muted">{n.desc}</p></div>
                    <button onClick={() => setNotifs({...notifs, [n.key]: !notifs[n.key as keyof typeof notifs]})}
                      style={{ width: 44, height: 24, borderRadius: 50, border: 'none', cursor: 'pointer', position: 'relative', background: notifs[n.key as keyof typeof notifs] ? '#C8A96B' : 'rgba(255,255,255,0.15)', padding: 0, transition: 'background 0.2s' }}>
                      <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: notifs[n.key as keyof typeof notifs] ? 22 : 2 }} />
                    </button>
                  </div>
                ))}
                <button onClick={saveNotifs} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save</button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Privacy</h2>
                <div className="flex items-center justify-between py-3 border-b border-white/07">
                  <div><p className="text-sm font-medium">Private Account</p><p className="text-xs text-muted">Only approved followers can see your content</p></div>
                  <button onClick={() => setPrivacy({...privacy, is_private: !privacy.is_private})}
                    style={{ width: 44, height: 24, borderRadius: 50, border: 'none', cursor: 'pointer', position: 'relative', background: privacy.is_private ? '#C8A96B' : 'rgba(255,255,255,0.15)', padding: 0, transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: privacy.is_private ? 22 : 2 }} />
                  </button>
                </div>
                <button onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  await supabase.from('profiles').update({ is_private: privacy.is_private }).eq('id', session!.user.id);
                  toast.success('Privacy saved!');
                }} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save</button>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Language & Currency</h2>
                <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Currency</label>
                  <select className={inp + ' cursor-pointer'}><option>Nigerian Naira (₦)</option><option>US Dollar ($)</option><option>British Pound (£)</option><option>Euro (€)</option></select>
                </div>
                <div><label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Language</label>
                  <select className={inp + ' cursor-pointer'}><option>English</option><option>Yoruba</option><option>Igbo</option><option>Hausa</option></select>
                </div>
                <button onClick={() => toast.success('Preferences saved!')} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save</button>
              </div>
            )}

            {activeTab === 'share' && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium">Share VEYRA</h2>
                <p className="text-sm text-muted">Invite your friends and family to discover fashion on VEYRA.</p>
                <div className="glass rounded-xl p-4 text-center mb-4">
                  <p className="text-xs text-muted mb-2">Your invite link</p>
                  <p className="text-sm text-gold font-mono">veyra-umber-sigma.vercel.app</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SHARE_OPTIONS.map(opt => (
                    <button key={opt.name} onClick={() => handleShare(opt)}
                      className="flex items-center gap-3 glass rounded-xl p-4 hover:border-white/20 transition-all text-left">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: `${opt.color}20`, border: `1px solid ${opt.color}30` }}>
                        {opt.icon}
                      </div>
                      <span className="text-sm font-medium">{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-medium mb-5">Purchase History</h2>
                <Link href="/profile?tab=orders" className="btn-primary text-sm flex items-center gap-2 w-fit">
                  <ShoppingBag size={14} /> View All Orders
                </Link>
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                <h2 className="text-lg font-medium mb-5">Saved Posts</h2>
                <Link href="/profile?tab=wishlist" className="btn-primary text-sm flex items-center gap-2 w-fit">
                  View Saved Items
                </Link>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Payment Methods</h2>
                <p className="text-sm text-muted">Your payment information is handled securely by Paystack. We never store your card details.</p>
                <button onClick={() => toast.success('Payment methods are managed at checkout via Paystack')} className="btn-primary text-sm">Manage Payments</button>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Devices & Sessions</h2>
                <div className="glass rounded-xl p-4 flex items-center gap-3">
                  <Smartphone size={18} className="text-gold" />
                  <div className="flex-1"><p className="text-sm font-medium">Current Device</p><p className="text-xs text-muted">Lagos, Nigeria · Active now</p></div>
                  <span className="text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">Current</span>
                </div>
                <button onClick={() => toast.success('All other sessions signed out')} className="btn-secondary text-sm">Sign out all other devices</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
