'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, Smartphone, Trash2, LogOut, Moon, Globe, CreditCard, Save, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'danger', label: 'Account', icon: Trash2 },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ full_name: '', username: '', bio: '', phone: '', location: '', website: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({ orders: true, messages: true, follows: true, promotions: false });
  const [privacy, setPrivacy] = useState({ is_private: false });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      setForm({ full_name: data.full_name || '', username: data.username || '', bio: data.bio || '', phone: data.phone || '', location: data.location || '', website: data.website || '' });
      setNotifications({ orders: data.notification_orders, messages: data.notification_messages, follows: data.notification_follows, promotions: data.notification_promotions });
      setPrivacy({ is_private: data.is_private });
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
    if (passwords.new.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast.error(error.message);
    else { toast.success('Password changed successfully!'); setPasswords({ current: '', new: '', confirm: '' }); }
    setLoading(false);
  };

  const saveNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('profiles').update({
      notification_orders: notifications.orders,
      notification_messages: notifications.messages,
      notification_follows: notifications.follows,
      notification_promotions: notifications.promotions,
    }).eq('id', session!.user.id);
    toast.success('Notification settings saved!');
  };

  const savePrivacy = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('profiles').update({ is_private: privacy.is_private }).eq('id', session!.user.id);
    toast.success('Privacy settings saved!');
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone. All your data will be permanently deleted.')) return;
    const confirmText = prompt('Type DELETE to confirm:');
    if (confirmText !== 'DELETE') { toast.error('Deletion cancelled'); return; }
    toast.error('Please contact support@veyra.ng to delete your account.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Signed out successfully');
  };

  const inputClass = "w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors";

  return (
    <div className="min-h-screen pt-[70px] max-w-[1200px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-8">
        <div className="section-label">Account</div>
        <h1 className="font-display text-3xl font-light">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="glass rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap text-left ${tab === id ? (id === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-gold/10 text-gold') : 'text-muted hover:text-white hover:bg-white/04'}`}>
                <Icon size={15} />
                <span className="hidden lg:block">{label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 glass rounded-2xl p-6 lg:p-8">

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Profile Settings</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl font-display relative">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" /> : <span className="text-purple-300">{form.full_name?.charAt(0) || '?'}</span>}
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                    <Camera size={11} className="text-[#0B0B0B]" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium">{form.full_name || 'Your Name'}</p>
                  <p className="text-xs text-muted">@{form.username || 'username'}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className={inputClass} placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Username</label>
                  <input value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} className={inputClass} placeholder="username" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className={inputClass + ' resize-none h-24'} placeholder="Tell people about yourself..." maxLength={160} />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+234..." type="tel" />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Location</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputClass} placeholder="Lagos, Nigeria" />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Website</label>
                  <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className={inputClass} placeholder="https://yoursite.com" type="url" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={loading} className="btn-primary flex items-center gap-2">
                <Save size={15} /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Security Settings</h2>
              <div className="glass rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-medium">Change Password</h3>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">New Password</label>
                  <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className={inputClass} placeholder="Min 8 characters" />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                  <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className={inputClass} placeholder="Repeat new password" />
                </div>
                <button onClick={changePassword} disabled={loading} className="btn-primary text-sm">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-medium mb-1">Two-Factor Authentication</h3>
                <p className="text-xs text-muted mb-3">Add an extra layer of security to your account</p>
                <button className="btn-secondary text-sm">Enable 2FA</button>
              </div>
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-medium mb-1">Active Sessions</h3>
                <p className="text-xs text-muted mb-3">Manage devices that are logged into your account</p>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone size={16} className="text-gold" />
                  <div>
                    <p>This device · Current session</p>
                    <p className="text-xs text-muted">Lagos, Nigeria · Active now</p>
                  </div>
                  <span className="ml-auto text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Notification Preferences</h2>
              {[
                { key: 'orders', label: 'Order Updates', desc: 'Shipping, delivery, and order status notifications' },
                { key: 'messages', label: 'Messages', desc: 'New messages from sellers and buyers' },
                { key: 'follows', label: 'New Followers', desc: 'When someone follows your profile' },
                { key: 'promotions', label: 'Promotions', desc: 'Sales, deals, and platform announcements' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-white/07 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted">{desc}</p>
                  </div>
                  <button onClick={() => setNotifications({...notifications, [key]: !notifications[key as keyof typeof notifications]})}
                    className={`w-11 h-6 rounded-full transition-all relative ${notifications[key as keyof typeof notifications] ? 'bg-gold' : 'bg-white/15'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${notifications[key as keyof typeof notifications] ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button onClick={saveNotifications} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save Preferences</button>
            </div>
          )}

          {/* PRIVACY */}
          {tab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Privacy Settings</h2>
              <div className="flex items-center justify-between py-3 border-b border-white/07">
                <div>
                  <p className="text-sm font-medium">Private Account</p>
                  <p className="text-xs text-muted">Only approved followers can see your posts and activity</p>
                </div>
                <button onClick={() => setPrivacy({...privacy, is_private: !privacy.is_private})}
                  className={`w-11 h-6 rounded-full transition-all relative ${privacy.is_private ? 'bg-gold' : 'bg-white/15'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${privacy.is_private ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <button onClick={savePrivacy} className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save Privacy Settings</button>
            </div>
          )}

          {/* PREFERENCES */}
          {tab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Preferences</h2>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Currency</label>
                <select className={inputClass + ' cursor-pointer'}>
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-1.5 block">Language</label>
                <select className={inputClass + ' cursor-pointer'}>
                  <option value="en">English</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted">VEYRA looks best in dark mode</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-gold relative">
                  <span className="absolute top-0.5 left-[22px] w-5 h-5 rounded-full bg-white" />
                </div>
              </div>
              <button className="btn-primary text-sm flex items-center gap-2"><Save size={14} /> Save Preferences</button>
            </div>
          )}

          {/* DEVICES */}
          {tab === 'devices' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Devices & Sessions</h2>
              <p className="text-sm text-muted">Devices that have been logged into your VEYRA account.</p>
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <Smartphone size={18} className="text-gold flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Windows PC — Chrome</p>
                  <p className="text-xs text-muted">Lagos, Nigeria · Current session</p>
                </div>
                <span className="text-[11px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">Current</span>
              </div>
              <button className="btn-secondary text-sm text-red-400 border-red-400/20 hover:bg-red-400/05">Sign out all other devices</button>
            </div>
          )}

          {/* DANGER ZONE */}
          {tab === 'danger' && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-red-400">Account Actions</h2>
              <div className="glass rounded-xl p-5 border border-white/07">
                <div className="flex items-center gap-3 mb-3">
                  <LogOut size={16} className="text-muted" />
                  <div>
                    <p className="text-sm font-medium">Sign Out</p>
                    <p className="text-xs text-muted">Sign out of your VEYRA account on this device</p>
                  </div>
                </div>
                <button onClick={signOut} className="btn-secondary text-sm">Sign Out</button>
              </div>
              <div className="glass rounded-xl p-5 border border-red-500/15">
                <div className="flex items-center gap-3 mb-3">
                  <Trash2 size={16} className="text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                    <p className="text-xs text-muted">Permanently delete your account and all data. This cannot be undone.</p>
                  </div>
                </div>
                <button onClick={deleteAccount} className="btn-secondary text-sm text-red-400 border-red-400/20 hover:bg-red-400/05">Delete My Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
