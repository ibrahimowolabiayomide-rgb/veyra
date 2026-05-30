'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Settings, ShoppingBag, Heart, Grid, LogOut, Camera,
  ChevronRight, Package, Edit2, Copy, Check, Store,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getProductImage } from '@/lib/fashion-images';
import toast from 'react-hot-toast';

function ProfileContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'posts' | 'orders' | 'wishlist' | 'settings'>(
    (sp.get('tab') as any) || 'posts'
  );
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    setUser(session.user);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) {
      setProfile(data);
      setEditForm({ full_name: data.full_name || '', username: data.username || '', bio: data.bio || '' });
    }
    await Promise.all([loadPosts(session.user.id), loadOrders(session.user.id), loadWishlist(session.user.id)]);
    setLoading(false);
  };

  const loadPosts = async (uid: string) => {
    const { data } = await supabase
      .from('products')
      .select('id,name,price,thumbnail,images,like_count,sold_count,is_active,category,created_at')
      .eq('seller_id', uid)
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const loadOrders = async (uid: string) => {
    const { data } = await supabase
      .from('orders')
      .select('id,status,total,created_at,order_items(id,quantity,price,products(name,thumbnail))')
      .eq('buyer_id', uid)
      .order('created_at', { ascending: false })
      .limit(20);
    setOrders(data || []);
  };

  const loadWishlist = async (uid: string) => {
    const { data } = await supabase
      .from('wishlists')
      .select('id,products(id,name,price,compare_price,thumbnail,images,category,stores(store_name))')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setWishlist((data || []).map((w: any) => w.products).filter(Boolean));
  };

  // ── Avatar upload — uses Supabase Storage directly ──
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setAvatarUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `avatars/${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // 3. Save to profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw new Error(updateError.message);

      // 4. Update local state
      setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
      toast.success('Profile photo updated ✦');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.error(err.message || 'Upload failed — check storage permissions');
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveProfile = async () => {
    if (!editForm.full_name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name.trim(),
        username: editForm.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        bio: editForm.bio.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) toast.error(error.message);
    else {
      setProfile((p: any) => ({ ...p, ...editForm }));
      toast.success('Profile updated ✦');
      setEditing(false);
    }
    setSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Signed out');
  };

  const copyUsername = () => {
    navigator.clipboard.writeText(`@${profile?.username || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const statusColor = (s: string) => ({
    pending: '#C8A96B', processing: '#3B82F6', shipped: '#8B5CF6',
    delivered: '#4ade80', cancelled: '#ef4444',
  }[s] || '#aaa');

  const inp: React.CSSProperties = {
    width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '11px 14px', color: '#fff', fontSize: '0.88rem',
    outline: 'none', boxSizing: 'border-box',
  };

  const heights = ['110%', '90%', '120%', '100%', '115%', '95%'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(200,169,107,0.3)', borderTopColor: '#C8A96B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: 52 }}>
        <span style={{ fontFamily: 'serif', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.2em', color: '#fff' }}>VE<span style={{ color: '#C8A96B' }}>Y</span>RA</span>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#fff', margin: 0 }}>Profile</h2>
        <Link href="/settings" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </Link>
      </div>

      {/* Profile header */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>

          {/* Avatar with upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2.5px solid rgba(200,169,107,0.35)' }}>
              {profile?.avatar_url
                ? <img
                    src={profile.avatar_url}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                : <span style={{ fontFamily: 'serif', fontSize: '2rem', color: '#fff' }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                  </span>
              }
            </div>

            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: avatarUploading ? 'rgba(200,169,107,0.5)' : '#C8A96B', border: '2px solid #0a0a0a', cursor: avatarUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Change profile photo"
            >
              {avatarUploading
                ? <div style={{ width: 10, height: 10, border: '1.5px solid rgba(0,0,0,0.4)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                : <Camera size={11} style={{ color: '#000' }} />
              }
            </button>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || user?.email?.split('@')[0] || 'Your Name'}
              </h1>
              {profile?.is_verified && (
                <span style={{ fontSize: '0.6rem', color: '#3B82F6', background: 'rgba(59,130,246,0.12)', borderRadius: 50, padding: '1px 6px' }}>✓</span>
              )}
            </div>
            <button onClick={copyUsername} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 5 }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>@{profile?.username || 'username'}</span>
              {copied ? <Check size={11} style={{ color: '#4ade80' }} /> : <Copy size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />}
            </button>
            {profile?.bio && (
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, margin: 0 }}>{profile.bio}</p>
            )}
          </div>

          <button onClick={() => { setEditing(!editing); setTab('settings'); }}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Edit2 size={12} /> Edit
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 14 }}>
          {[
            [posts.length, 'Posts'],
            [profile?.follower_count || 0, 'Followers'],
            [profile?.following_count || 0, 'Following'],
            [orders.length, 'Orders'],
          ].map(([n, l], i, arr) => (
            <div key={String(l)} style={{ flex: 1, padding: '12px 6px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{Number(n).toLocaleString()}</p>
              <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Become seller CTA */}
        {profile?.role === 'buyer' && (
          <Link href="/auth/signup?seller=true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg,rgba(200,169,107,0.1),rgba(168,135,42,0.06))', border: '1px solid rgba(200,169,107,0.25)', borderRadius: 12, padding: '10px 14px', textDecoration: 'none', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={15} style={{ color: '#C8A96B' }} />
              <div>
                <p style={{ fontSize: '0.82rem', color: '#fff', margin: 0, fontWeight: 500 }}>Become a Seller</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Start selling on VEYRA</p>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#C8A96B' }} />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { key: 'posts', icon: Grid, label: 'Posts' },
          { key: 'orders', icon: Package, label: 'Orders' },
          { key: 'wishlist', icon: Heart, label: 'Saved' },
          { key: 'settings', icon: Settings, label: 'Settings' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTab(key as any); setEditing(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px', fontSize: '0.8rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: tab === key ? '#fff' : 'rgba(255,255,255,0.35)', borderBottom: tab === key ? '2px solid #C8A96B' : '2px solid transparent', marginBottom: -1, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '10px 8px' }}>

        {/* POSTS */}
        {tab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 10 }}>◈</p>
              <p style={{ fontSize: '1rem', marginBottom: 6, color: '#fff' }}>No posts yet</p>
              <p style={{ fontSize: '0.82rem', marginBottom: 20 }}>Share your fashion with the world</p>
              <Link href="/create" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', borderRadius: 50, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>+ Create Post</Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 6px 8px' }}>
                <Link href="/create" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(200,169,107,0.1)', border: '1px solid rgba(200,169,107,0.3)', color: '#C8A96B', borderRadius: 50, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>+ New Post</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                {posts.map((p, i) => {
                  const img = getProductImage(p.thumbnail || p.images?.[0], p.id, p.category);
                  return (
                    <Link key={p.id} href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none', position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#1a1a1a' }}>
                      <div style={{ paddingTop: heights[i % heights.length], position: 'relative' }}>
                        <img src={img} alt={p.name} loading="lazy"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => { e.target.src = `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70`; }}
                        />
                        {!p.is_active && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>Hidden</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', padding: '8px 6px 4px' }}>
                          <p style={{ fontSize: '0.62rem', fontWeight: 600, color: '#fff', margin: 0 }}>₦{Number(p.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
              <ShoppingBag size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
              <p style={{ fontSize: '1rem', marginBottom: 6, color: '#fff' }}>No orders yet</p>
              <p style={{ fontSize: '0.82rem', marginBottom: 20 }}>Start shopping to see your orders here</p>
              <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', borderRadius: 50, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Explore Feed</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 6px' }}>
              {orders.map((order: any) => (
                <div key={order.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: '0 0 2px' }}>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>₦{Number(order.total).toLocaleString()}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: statusColor(order.status), background: `${statusColor(order.status)}18`, borderRadius: 50, padding: '3px 8px', textTransform: 'capitalize' }}>{order.status}</span>
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {(order.order_items || []).map((item: any) => (
                      <div key={item.id} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: '#1a1a1a', overflow: 'hidden', flexShrink: 0 }}>
                          {item.products?.thumbnail && <img src={item.products.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: '#fff', margin: '0 0 2px', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.products?.name}</p>
                          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* WISHLIST */}
        {tab === 'wishlist' && (
          wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
              <Heart size={40} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
              <p style={{ fontSize: '1rem', marginBottom: 6, color: '#fff' }}>No saved items</p>
              <p style={{ fontSize: '0.82rem', marginBottom: 20 }}>Tap ♡ on any product to save it</p>
              <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', borderRadius: 50, padding: '10px 24px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Browse Feed</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, padding: '0 6px' }}>
              {wishlist.map((p: any) => {
                const img = getProductImage(p.thumbnail || p.images?.[0], p.id, p.category);
                const disc = p.compare_price && p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
                return (
                  <Link key={p.id} href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none', background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ position: 'relative', paddingTop: '120%', background: '#1a1a1a' }}>
                      <img src={img} alt={p.name} loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70'; }}
                      />
                      {disc && <span style={{ position: 'absolute', top: 7, left: 7, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>-{disc}%</span>}
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 3px' }}>{p.stores?.store_name || 'VEYRA'}</p>
                      <p style={{ fontSize: '0.82rem', color: '#fff', margin: '0 0 5px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>₦{Number(p.price).toLocaleString()}</span>
                        {p.compare_price && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₦{Number(p.compare_price).toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div style={{ padding: '0 6px' }}>
            {editing ? (
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <p style={{ fontSize: '0.72rem', color: '#C8A96B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Edit Profile</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Full Name</label>
                    <input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Username</label>
                    <input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell people about yourself..." style={{ ...inp, minHeight: 70, resize: 'none', lineHeight: 1.5 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveProfile} disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200,169,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit2 size={14} style={{ color: '#C8A96B' }} />
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#fff' }}>Edit Profile</span>
                </div>
                <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
              </button>
            )}

            <Link href="/settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, textDecoration: 'none', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings size={14} style={{ color: '#8B5CF6' }} />
                </div>
                <span style={{ fontSize: '0.88rem', color: '#fff' }}>All Settings</span>
              </div>
              <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </Link>

            <button onClick={signOut} style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid rgba(200,169,107,0.3)', borderTopColor: '#C8A96B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
