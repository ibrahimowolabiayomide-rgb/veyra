'use client';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, TrendingUp, DollarSign, Plus, Bell, Settings, LogOut, Sparkles, Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 85000, orders: 12 },
  { month: 'Feb', revenue: 120000, orders: 18 },
  { month: 'Mar', revenue: 98000, orders: 15 },
  { month: 'Apr', revenue: 156000, orders: 24 },
  { month: 'May', revenue: 180000, orders: 28 },
  { month: 'Jun', revenue: 210000, orders: 32 },
  { month: 'Jul', revenue: 195000, orders: 30 },
];

const RECENT_ORDERS = [
  { id: 'VYR-20260715-A4F2', customer: 'Adaeze N.', product: 'Oversized Black Hoodie', amount: 12500, status: 'delivered', date: '2h ago' },
  { id: 'VYR-20260715-B3E1', customer: 'Kola O.', product: 'Cargo Street Pants', amount: 8999, status: 'shipped', date: '5h ago' },
  { id: 'VYR-20260714-C8D7', customer: 'Temi E.', product: 'Chunky Sneakers', amount: 18750, status: 'processing', date: '1d ago' },
  { id: 'VYR-20260714-D2F9', customer: 'Emeka U.', product: 'Oversized Black Hoodie', amount: 12500, status: 'pending', date: '1d ago' },
];

const MY_PRODUCTS = [
  { id: '1', name: 'Oversized Black Hoodie', price: 12500, stock: 24, sold: 128, status: 'active' },
  { id: '2', name: 'Cargo Street Pants', price: 8999, stock: 15, sold: 84, status: 'active' },
  { id: '3', name: 'Limited Drop Tee', price: 6500, stock: 0, sold: 200, status: 'out_of_stock' },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: '#4ade80', shipped: '#3B82F6', processing: '#C8A96B', pending: '#A1A1AA',
  active: '#4ade80', out_of_stock: '#ef4444',
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiGenProduct, setAiGenProduct] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const generateDescription = async () => {
    if (!aiGenProduct.trim()) { toast.error('Enter a product name first'); return; }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Write a premium, compelling product description for a fashion marketplace listing for: "${aiGenProduct}". Keep it under 100 words. Make it luxurious and enticing.`, history: [] }),
      });
      const data = await res.json();
      setAiDescription(data.message.replace(/<recommendations>[\s\S]*?<\/recommendations>/, '').trim());
    } catch {
      setAiDescription(`Premium quality ${aiGenProduct} crafted for the modern fashion-forward individual. Designed with meticulous attention to detail and superior materials, this piece elevates any wardrobe. Perfect for those who refuse to compromise on style.`);
    }
    setAiLoading(false);
  };

  const STATS = [
    { label: 'Total Revenue', value: '₦1.04M', change: '+18%', icon: DollarSign, color: '#C8A96B' },
    { label: 'Total Orders', value: '159', change: '+12%', icon: ShoppingBag, color: '#8B5CF6' },
    { label: 'Active Products', value: '24', change: '+3', icon: Package, color: '#3B82F6' },
    { label: 'Store Rating', value: '4.9 ★', change: '+0.1', icon: TrendingUp, color: '#4ade80' },
  ];

  return (
    <div className="min-h-screen pt-[70px] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111] border-r border-white/07 flex flex-col py-6 px-3 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto hidden lg:flex">
        <div className="px-3 mb-6">
          <p className="text-xs uppercase tracking-widest text-muted mb-1">NaijaDrip Co.</p>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Verified Seller
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${activeTab === id ? 'bg-gold/10 text-gold' : 'text-muted hover:text-white hover:bg-white/04'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-1 mt-auto border-t border-white/07 pt-3">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 transition-all">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-light">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-muted mt-0.5">Welcome back, NaijaDrip Co.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 glass rounded-xl text-muted hover:text-white transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </button>
            <button className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1.5">
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.icon size={14} style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-white mb-1">{s.value}</p>
                  <p className="text-xs text-green-400">{s.change} this month</p>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-4">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }}
                    labelStyle={{ color: '#A1A1AA' }}
                    formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#C8A96B" strokeWidth={2} dot={{ fill: '#C8A96B', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent orders */}
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-muted hover:text-gold transition-colors">View all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-muted">
                      <th className="text-left pb-3 font-normal">Order ID</th>
                      <th className="text-left pb-3 font-normal">Customer</th>
                      <th className="text-left pb-3 font-normal hidden md:table-cell">Product</th>
                      <th className="text-right pb-3 font-normal">Amount</th>
                      <th className="text-right pb-3 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/05">
                    {RECENT_ORDERS.map((o) => (
                      <tr key={o.id} className="hover:bg-white/02 transition-colors">
                        <td className="py-3 text-xs text-muted font-mono">{o.id.split('-').slice(-1)[0]}</td>
                        <td className="py-3">{o.customer}</td>
                        <td className="py-3 text-muted hidden md:table-cell truncate max-w-[160px]">{o.product}</td>
                        <td className="py-3 text-right font-medium">₦{o.amount.toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span className="text-[11px] rounded-full px-2 py-0.5 capitalize"
                            style={{ color: STATUS_COLORS[o.status], background: `${STATUS_COLORS[o.status]}15` }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Description Generator */}
            <div className="glass rounded-2xl p-5 border border-purple-500/15"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.03))' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-purple-400" />
                <h3 className="text-sm font-medium">AI Product Description Generator</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={aiGenProduct}
                  onChange={(e) => setAiGenProduct(e.target.value)}
                  placeholder="Enter product name (e.g. Oversized Silk Bomber Jacket)"
                  className="flex-1 bg-[#0B0B0B] border border-white/10 focus:border-purple-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted outline-none transition-colors"
                />
                <button onClick={generateDescription} disabled={aiLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-1.5 transition-all whitespace-nowrap">
                  {aiLoading ? <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" /> : <Sparkles size={12} />}
                  Generate
                </button>
              </div>
              {aiDescription && (
                <div className="bg-white/03 rounded-xl p-3 text-sm text-white/80 leading-relaxed border border-white/07">
                  {aiDescription}
                  <button onClick={() => { navigator.clipboard.writeText(aiDescription); toast.success('Copied!'); }}
                    className="mt-2 block text-xs text-gold hover:text-gold-light transition-colors">Copy text →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted">{MY_PRODUCTS.length} products</p>
              <button className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5"><Plus size={14} /> Add New Product</button>
            </div>
            {MY_PRODUCTS.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex-shrink-0 flex items-center justify-center">
                  <span className="font-display text-xl font-light opacity-20 text-purple-400">{p.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white mb-0.5">{p.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
                    <span>₦{p.price.toLocaleString()}</span>
                    <span>{p.sold} sold</span>
                    <span>Stock: {p.stock}</span>
                  </div>
                </div>
                <span className="text-[11px] rounded-full px-2.5 py-1 capitalize hidden sm:block"
                  style={{ color: STATUS_COLORS[p.status], background: `${STATUS_COLORS[p.status]}15` }}>
                  {p.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-muted hover:text-white transition-colors"><Eye size={14} /></button>
                  <button className="p-2 text-muted hover:text-gold transition-colors"><Pencil size={14} /></button>
                  <button className="p-2 text-muted hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="glass rounded-2xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted border-b border-white/07">
                    {['Order ID', 'Customer', 'Product', 'Amount', 'Date', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 font-normal pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id} className="hover:bg-white/02 transition-colors">
                      <td className="py-3 pr-4 text-xs text-muted font-mono">{o.id}</td>
                      <td className="py-3 pr-4">{o.customer}</td>
                      <td className="py-3 pr-4 text-muted">{o.product}</td>
                      <td className="py-3 pr-4 font-medium">₦{o.amount.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-muted">{o.date}</td>
                      <td className="py-3">
                        <span className="text-[11px] rounded-full px-2.5 py-1 capitalize"
                          style={{ color: STATUS_COLORS[o.status], background: `${STATUS_COLORS[o.status]}15` }}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-4">Monthly Orders vs Revenue</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }} />
                  <Bar dataKey="orders" fill="rgba(139,92,246,0.5)" radius={[4,4,0,0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
