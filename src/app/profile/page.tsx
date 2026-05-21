'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Heart, Bookmark, Settings, User, Edit2, MapPin, Globe, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#A1A1AA', confirmed: '#3B82F6', processing: '#C8A96B',
  shipped: '#8B5CF6', delivered: '#4ade80', cancelled: '#ef4444', refunded: '#f97316',
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }

    const [profileRes, ordersRes, wishlistRes, bookmarksRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('orders').select('*, order_items(*, products(name, thumbnail, price))').eq('customer_id', session.user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('wishlists').select('*, products(id, name, price, thumbnail, rating, stores(store_name))').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('bookmarks').select('*, products(id, name, price, thumbnail, rating, stores(store_name))').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ]);

    setProfile(profileRes.data);
    setOrders(ordersRes.data || []);
    setWishlist(wishlistRes.data || []);
    setBookmarks(bookmarksRes.data || []);
    setLoading(false);
  };

  const removeWishlist = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('wishlists').delete().eq('user_id', session!.user.id).eq('product_id', productId);
    setWishlist(prev => prev.filter(w => w.product_id !== productId));
    toast.success('Removed from wishlist');
  };

  const removeBookmark = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('bookmarks').delete().eq('user_id', session!.user.id).eq('product_id', productId);
    setBookmarks(prev => prev.filter(b => b.product_id !== productId));
    toast.success('Removed from saved');
  };

  if (loading) return (
    <div className="min-h-screen pt-[70px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-[70px]">
      {/* Profile header */}
      <div className="bg-[#111] border-b border-white/07">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center text-3xl font-display flex-shrink-0 overflow-hidden border-2 border-white/10">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-purple-300">{profile?.full_name?.charAt(0) || '?'}</span>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold">{profile?.full_name || 'User'}</h1>
                {profile?.is_verified && <Check size={14} className="text-blue-400 bg-blue-400/15 rounded-full p-0.5" />}
                {profile?.role === 'seller' && <span className="text-[11px] text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">Seller</span>}
              </div>
              <p className="text-muted text-sm mb-2">@{profile?.username || 'user'}</p>
              {profile?.bio && <p className="text-sm text-white/70 mb-2">{profile.bio}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-muted">
                {profile?.location && <span className="flex items-center gap-1"><MapPin size={11} />{profile.location}</span>}
                {profile?.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold hover:text-gold-light"><Globe size={11} />{profile.website.replace('https://', '')}</a>}
                <span>{profile?.follower_count || 0} followers</span>
                <span>{profile?.following_count || 0} following</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1.5">
                <Edit2 size={13} /> Edit Profile
              </Link>
              <Link href="/settings" className="btn-ghost !py-2 !px-3">
                <Settings size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/07 mb-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-all ${tab === id ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-white'}`}>
              <Icon size={14} /> {label}
              {id === 'orders' && orders.length > 0 && <span className="bg-white/10 rounded-full px-1.5 text-xs">{orders.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, icon: Package, color: '#8B5CF6' },
              { label: 'Wishlist Items', value: wishlist.length, icon: Heart, color: '#ef4444' },
              { label: 'Saved Items', value: bookmarks.length, icon: Bookmark, color: '#C8A96B' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <p className="text-3xl font-display font-light">{s.value}</p>
              </div>
            ))}
            {profile?.role === 'seller' && (
              <div className="md:col-span-3 glass rounded-2xl p-5 border border-gold/15">
                <p className="text-sm font-medium mb-2">🏪 Seller Account</p>
                <p className="text-xs text-muted mb-3">Manage your store, products, and orders from the Seller Dashboard.</p>
                <Link href="/dashboard/seller" className="btn-primary text-sm">Open Seller Dashboard</Link>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <Package size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-sm mb-6">Start shopping to see your orders here</p>
                <Link href="/marketplace" className="btn-primary text-sm">Browse Marketplace</Link>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium font-mono">{order.order_number}</p>
                    <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₦{Number(order.total).toLocaleString()}</p>
                    <span className="text-[11px] rounded-full px-2.5 py-0.5 capitalize" style={{ color: STATUS_COLORS[order.status], background: `${STATUS_COLORS[order.status]}15` }}>
                      {order.status}
                    </span>
                  </div>
                </div>
                {order.order_items?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.order_items.slice(0, 4).map((item: any) => (
                      <div key={item.id} className="w-12 h-12 rounded-lg bg-[#111] border border-white/07 overflow-hidden flex-shrink-0">
                        {item.products?.thumbnail ? <img src={item.products.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-display opacity-20">{item.products?.name?.charAt(0)}</div>}
                      </div>
                    ))}
                    {order.order_items.length > 4 && <div className="w-12 h-12 rounded-lg glass flex items-center justify-center text-xs text-muted">+{order.order_items.length - 4}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Wishlist */}
        {tab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <Heart size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No wishlist items</p>
                <p className="text-sm mb-6">Heart products to save them here</p>
                <Link href="/marketplace" className="btn-primary text-sm">Browse Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map(w => w.products && (
                  <div key={w.id} className="glass rounded-2xl overflow-hidden group">
                    <Link href={`/product/${w.products.id}`}>
                      <div className="w-full aspect-[3/4] bg-[#1a1a1a] overflow-hidden">
                        {w.products.thumbnail ? <img src={w.products.thumbnail} alt={w.products.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center font-display text-4xl opacity-10">{w.products.name?.charAt(0)}</div>}
                      </div>
                    </Link>
                    <div className="p-3">
                      <p className="text-xs text-muted mb-0.5">{w.products.stores?.store_name}</p>
                      <p className="text-sm font-medium text-white mb-1 line-clamp-1">{w.products.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">₦{Number(w.products.price).toLocaleString()}</span>
                        <button onClick={() => removeWishlist(w.product_id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                          <Heart size={13} className="fill-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved/Bookmarks */}
        {tab === 'saved' && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <Bookmark size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No saved items</p>
                <p className="text-sm mb-6">Bookmark products to save them here</p>
                <Link href="/marketplace" className="btn-primary text-sm">Browse Products</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bookmarks.map(b => b.products && (
                  <div key={b.id} className="glass rounded-2xl overflow-hidden group">
                    <Link href={`/product/${b.products.id}`}>
                      <div className="w-full aspect-[3/4] bg-[#1a1a1a] overflow-hidden">
                        {b.products.thumbnail ? <img src={b.products.thumbnail} alt={b.products.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center font-display text-4xl opacity-10">{b.products.name?.charAt(0)}</div>}
                      </div>
                    </Link>
                    <div className="p-3">
                      <p className="text-xs text-muted mb-0.5">{b.products.stores?.store_name}</p>
                      <p className="text-sm font-medium mb-1 line-clamp-1">{b.products.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">₦{Number(b.products.price).toLocaleString()}</span>
                        <button onClick={() => removeBookmark(b.product_id)} className="text-gold hover:text-gold-light transition-colors p-1">
                          <Bookmark size={13} className="fill-gold" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <Suspense fallback={<div className="min-h-screen pt-[70px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}><ProfileContent /></Suspense>;
}
