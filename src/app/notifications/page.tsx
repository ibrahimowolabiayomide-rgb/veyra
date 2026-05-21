'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Package, Heart, MessageCircle, UserPlus, Tag, CheckCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const TYPE_ICONS: Record<string, any> = {
  order: Package, like: Heart, comment: MessageCircle,
  follow: UserPlus, message: MessageCircle, promo: Tag, system: Bell,
};
const TYPE_COLORS: Record<string, string> = {
  order: '#C8A96B', like: '#ef4444', comment: '#8B5CF6',
  follow: '#3B82F6', message: '#4ade80', promo: '#f97316', system: '#A1A1AA',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
    // Realtime subscription
    const channel = supabase.channel('notifications').on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      payload => setNotifications(prev => [payload.new, ...prev])
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(50);
    setNotifications(data || []);
    setLoading(false);
    // Mark all as read
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
  };

  const clearAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('notifications').delete().eq('user_id', session.user.id);
    setNotifications([]);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen pt-[70px] max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="section-label">Updates</div>
          <h1 className="font-display text-3xl font-light">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors">
            <CheckCheck size={14} /> Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl p-4 flex gap-3"><div className="w-10 h-10 rounded-full shimmer flex-shrink-0" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 shimmer rounded" /><div className="h-3 w-1/2 shimmer rounded" /></div></div>)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Bell size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">No notifications yet</p>
          <p className="text-sm">We'll notify you about orders, likes, follows, and more</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const color = TYPE_COLORS[n.type] || '#A1A1AA';
            return (
              <Link key={n.id} href={n.action_url || '#'}
                className={`flex gap-3 p-4 rounded-2xl transition-all hover:bg-white/03 ${!n.is_read ? 'glass border border-white/10' : 'border border-transparent hover:border-white/07'}`}>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  {n.body && <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-[11px] text-muted/60 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
