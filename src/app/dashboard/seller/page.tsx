'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, DollarSign, Eye, Heart, Star, TrendingUp,
  ShoppingBag, MessageCircle, Bell, Plus, Edit2, Trash2,
  BarChart2, Users, CheckCircle, Clock, XCircle, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getProductImage } from '@/lib/fashion-images';
import toast from 'react-hot-toast';

const GOLD = '#C8A96B';

type Tab = 'overview' | 'products' | 'orders' | 'earnings' | 'analytics';

export default function SellerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Realistic demo stats
  const stats = {
    totalRevenue: store?.total_revenue || 1285000,
    pendingPayout: store?.pending_payout || 245000,
    totalOrders: orders.length || 47,
    totalProducts: products.length || 12,
    profileViews: store?.profile_views || 3240,
    followers: store?.follower_count || 892,
    avgRating: store?.avg_rating || 4.8,
    conversionRate: 3.2,
  };

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/dashboard/seller'); return; }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(p);

    if (p?.role !== 'seller') { router.push('/auth/signup?seller=true'); return; }

    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', session.user.id).single();
    setStore(s);

    if (s) {
      const { data: prods } = await supabase.from('products').select('*').eq('store_id', s.id).order('created_at', { ascending: false });
      setProducts(prods || []);
      const { data: ords } = await supabase.from('orders').select('*,order_items(*)').eq('seller_id', session.user.id).order('created_at', { ascending: false }).limit(30);
      setOrders(ords || []);
    }
    setLoading(false);
  };

  const toggleProductStatus = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
    if (!error) {
      setProducts(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x));
      toast.success(current ? 'Product hidden' : 'Product live ✦');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { setProducts(p => p.filter(x => x.id !== id)); toast.success('Deleted'); }
    else toast.error('Failed to delete');
  };

  const statusColor = (s: string) => ({ pending: '#C8A96B', processing: '#3B82F6', shipped: '#8B5CF6', delivered: '#4ade80', cancelled: '#ef4444' }[s] || '#aaa');
  const statusIcon = (s: string) => ({ pending: Clock, processing: Clock, shipped: Package, delivered: CheckCircle, cancelled: XCircle }[s] || Clock);

  const inp: React.CSSProperties = { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: '0.78rem', outline: 'none' };

  if (loading) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(200,169,107,0.3)', borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Seller Dashboard</p>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{store?.store_name || profile?.full_name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/messages" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </Link>
          <Link href="/create" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(200,169,107,0.15)', border: '1px solid rgba(200,169,107,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={15} style={{ color: GOLD }} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 4px' }}>
        {([['overview', '📊 Overview'], ['products', '📦 Products'], ['orders', '🛍️ Orders'], ['earnings', '💰 Earnings'], ['analytics', '📈 Analytics']] as [Tab, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 14px', fontSize: '0.78rem', fontWeight: tab === k ? 600 : 400, color: tab === k ? '#fff' : 'rgba(255,255,255,0.35)', background: 'none', border: 'none', borderBottom: tab === k ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: -1, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 1rem' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            {/* Store health banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(200,169,107,0.12),rgba(139,92,246,0.06))', border: '1px solid rgba(200,169,107,0.2)', borderRadius: 18, padding: '16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {store?.logo_url ? <img src={store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'serif', fontSize: '1.2rem', color: '#fff' }}>{store?.store_name?.charAt(0) || '?'}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{store?.store_name || 'Your Store'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={11} fill={GOLD} style={{ color: GOLD }} />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{stats.avgRating} rating · {stats.followers} followers</span>
                </div>
              </div>
              <Link href={`/seller/${store?.store_slug || 'me'}`} style={{ fontSize: '0.72rem', color: GOLD, textDecoration: 'none', flexShrink: 0 }}>View Store →</Link>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { icon: DollarSign, label: 'Total Revenue', val: `₦${(stats.totalRevenue / 1000).toFixed(0)}K`, color: '#4ade80', sub: '+12% this month' },
                { icon: ShoppingBag, label: 'Total Orders', val: stats.totalOrders, color: '#3B82F6', sub: `${orders.filter(o => o.status === 'pending').length} pending` },
                { icon: Package, label: 'Products', val: stats.totalProducts, color: GOLD, sub: `${products.filter(p => p.is_active).length} active` },
                { icon: Eye, label: 'Profile Views', val: `${(stats.profileViews / 1000).toFixed(1)}K`, color: '#8B5CF6', sub: '+8% this week' },
              ].map(({ icon: Icon, label, val, color, sub }) => (
                <div key={label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} style={{ color }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '0 0 3px' }}>{val}</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Payout card */}
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 18, padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Pending Payout</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>₦{stats.pendingPayout.toLocaleString()}</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Releases Monday · 1-3 business days</p>
                </div>
                <button style={{ padding: '9px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Withdraw
                </button>
              </div>
            </div>

            {/* Recent orders preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Recent Orders</p>
              <button onClick={() => setTab('orders')} style={{ fontSize: '0.75rem', color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}>See all →</button>
            </div>
            {[
              { id: 'A8F2', buyer: 'Chioma O.', item: 'Luxury Sundress', amount: 28500, status: 'processing' },
              { id: 'B1D9', buyer: 'Tunde A.', item: 'Gold Chain Necklace', amount: 15000, status: 'pending' },
              { id: 'C4E1', buyer: 'Amina K.', item: 'Agbada Set – Royal Blue', amount: 55000, status: 'shipped' },
            ].map(o => {
              const Icon = statusIcon(o.status);
              return (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px', marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: `${statusColor(o.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color: statusColor(o.status) }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.82rem', color: '#fff', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.item}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{o.buyer} · #{o.id}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>₦{o.amount.toLocaleString()}</p>
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, color: statusColor(o.status), background: `${statusColor(o.status)}15`, borderRadius: 50, padding: '1px 6px', textTransform: 'capitalize' }}>{o.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{products.length} products</p>
              <Link href="/create" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 50, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', textDecoration: 'none', color: '#000', fontSize: '0.78rem', fontWeight: 700 }}>
                <Plus size={13} /> Add Product
              </Link>
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: '1rem', marginBottom: 6 }}>No products yet</p>
                <Link href="/create" style={{ display: 'inline-block', marginTop: 12, padding: '10px 24px', borderRadius: 50, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                  + Create First Product
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map(p => {
                  const img = getProductImage(p.thumbnail || p.images?.[0], 0, p.category);
                  return (
                    <div key={p.id} style={{ display: 'flex', gap: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px', alignItems: 'center' }}>
                      <div style={{ width: 54, height: 54, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.85rem', color: '#fff', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>₦{Number(p.price).toLocaleString()}</span>
                          <span style={{ fontSize: '0.65rem', color: p.is_active ? '#4ade80' : 'rgba(255,255,255,0.3)', background: p.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.06)', borderRadius: 50, padding: '1px 7px' }}>
                            {p.is_active ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>{p.sold_count || 0} sold · {p.like_count || 0} likes</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <Link href={`/create?edit=${p.id}`} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(200,169,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={12} style={{ color: GOLD }} />
                        </Link>
                        <button onClick={() => toggleProductStatus(p.id, p.is_active)} style={{ width: 30, height: 30, borderRadius: 8, background: p.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.is_active ? <XCircle size={12} style={{ color: '#ef4444' }} /> : <CheckCircle size={12} style={{ color: '#4ade80' }} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 14 }}>
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                <button key={s} style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Demo orders */}
            {[
              { id: 'A8F2C1', buyer: 'Chioma O.', item: 'Luxury Sundress', amount: 28500, status: 'processing', date: '2 hours ago' },
              { id: 'B1D940', buyer: 'Tunde A.', item: 'Gold Chain Necklace', amount: 15000, status: 'pending', date: '5 hours ago' },
              { id: 'C4E1F2', buyer: 'Amina K.', item: 'Agbada Set – Royal Blue', amount: 55000, status: 'shipped', date: '1 day ago' },
              { id: 'D7A2B3', buyer: 'Kemi S.', item: 'Air Force 1 Custom', amount: 42000, status: 'delivered', date: '3 days ago' },
              { id: 'E9C4D5', buyer: 'Eze M.', item: 'Premium Streetwear Set', amount: 19500, status: 'cancelled', date: '5 days ago' },
            ].map(o => {
              const Icon = statusIcon(o.status);
              return (
                <div key={o.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 3px' }}>#{o.id} · {o.date}</p>
                      <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 500, margin: 0 }}>{o.item}</p>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: statusColor(o.status), background: `${statusColor(o.status)}18`, borderRadius: 50, padding: '3px 8px', textTransform: 'capitalize', flexShrink: 0 }}>{o.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Buyer: {o.buyer}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>₦{o.amount.toLocaleString()}</span>
                  </div>
                  {o.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={() => toast.success('Order confirmed!')} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: '0.78rem', cursor: 'pointer' }}>✓ Accept</button>
                      <button onClick={() => toast.error('Order declined')} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer' }}>✕ Decline</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── EARNINGS TAB ── */}
        {tab === 'earnings' && (
          <div>
            <div style={{ background: 'linear-gradient(135deg,rgba(200,169,107,0.1),rgba(168,135,42,0.05))', border: '1px solid rgba(200,169,107,0.2)', borderRadius: 20, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Total Earnings</p>
              <p style={{ fontFamily: 'serif', fontSize: '2.4rem', fontWeight: 300, color: '#fff', margin: '0 0 4px' }}>₦1,285,000</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Since you joined VEYRA</p>
            </div>

            {/* Monthly breakdown */}
            {[
              { month: 'May 2026', revenue: 245000, orders: 8, commission: 24500 },
              { month: 'Apr 2026', revenue: 318000, orders: 11, commission: 31800 },
              { month: 'Mar 2026', revenue: 189500, orders: 7, commission: 18950 },
              { month: 'Feb 2026', revenue: 412000, orders: 14, commission: 41200 },
            ].map(m => (
              <div key={m.month} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#fff', margin: 0 }}>{m.month}</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>₦{m.revenue.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{m.orders} orders</span>
                  <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>-₦{m.commission.toLocaleString()} commission</span>
                  <span style={{ fontSize: '0.72rem', color: '#4ade80', marginLeft: 'auto' }}>₦{(m.revenue - m.commission).toLocaleString()} net</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Profile Views', val: '3,240', change: '+18%', color: '#8B5CF6' },
                { label: 'Conversion Rate', val: '3.2%', change: '+0.4%', color: '#3B82F6' },
                { label: 'Avg Order Value', val: '₦27,340', change: '+5%', color: GOLD },
                { label: 'Return Rate', val: '1.8%', change: '-0.3%', color: '#4ade80' },
              ].map(({ label, val, change, color }) => (
                <div key={label} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px' }}>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{label}</p>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{val}</p>
                  <span style={{ fontSize: '0.65rem', color, background: `${color}15`, borderRadius: 50, padding: '1px 7px' }}>{change}</span>
                </div>
              ))}
            </div>

            {/* Top products */}
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Top Performing Products</p>
            {[
              { name: 'Luxury Sundress', views: 892, sales: 23, revenue: 655500 },
              { name: 'Gold Chain Necklace', views: 654, sales: 15, revenue: 225000 },
              { name: 'Agbada Set', views: 445, sales: 9, revenue: 495000 },
            ].map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px', marginBottom: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(200,169,107,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: GOLD, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', color: '#fff', margin: '0 0 2px' }}>{p.name}</p>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{p.views} views · {p.sales} sold</p>
                </div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', margin: 0, flexShrink: 0 }}>₦{(p.revenue / 1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent} ::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
