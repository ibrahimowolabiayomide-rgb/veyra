'use client';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Store, Package, ShoppingCart, TrendingUp, Settings, Flag, Bell, Shield, CheckCircle, XCircle, Search } from 'lucide-react';

const PLATFORM_STATS = [
  { label: 'Total Users', value: '12,480', change: '+340 this week', color: '#8B5CF6', icon: Users },
  { label: 'Active Sellers', value: '3,124', change: '+89 this week', color: '#3B82F6', icon: Store },
  { label: 'Total Products', value: '98,342', change: '+1.2k this week', color: '#C8A96B', icon: Package },
  { label: 'Platform Revenue', value: '₦28.4M', change: '+18% this month', color: '#4ade80', icon: TrendingUp },
];

const REVENUE_DATA = [
  { month: 'Jan', revenue: 18500000 }, { month: 'Feb', revenue: 21000000 },
  { month: 'Mar', revenue: 19800000 }, { month: 'Apr', revenue: 24500000 },
  { month: 'May', revenue: 26000000 }, { month: 'Jun', revenue: 28400000 },
];

const PENDING_SELLERS = [
  { name: 'Lagos Luxe Ltd', email: 'hello@lagosluxe.ng', category: 'Luxury', applied: '2h ago' },
  { name: 'AfroPunk Styles', email: 'info@afropunk.ng', category: 'Streetwear', applied: '5h ago' },
  { name: 'Kemi Couture', email: 'kemi@kemi-couture.com', category: 'Women', applied: '1d ago' },
];

const FLAGGED_PRODUCTS = [
  { name: 'Counterfeit Sneakers', seller: 'FakeSneaks99', reason: 'Suspected counterfeit', severity: 'high' },
  { name: 'Duplicate Listing', seller: 'CopyShop', reason: 'Duplicate content', severity: 'medium' },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sellers', label: 'Sellers', icon: Store },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'moderation', label: 'AI Moderation', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MOCK_USERS = [
  { name: 'Adaeze N.', email: 'adaeze@email.com', role: 'customer', status: 'active', joined: 'Jan 2026' },
  { name: 'Kola O.', email: 'kola@email.com', role: 'seller', status: 'active', joined: 'Feb 2026' },
  { name: 'Temi E.', email: 'temi@email.com', role: 'customer', status: 'suspended', joined: 'Mar 2026' },
  { name: 'Emeka U.', email: 'emeka@email.com', role: 'customer', status: 'active', joined: 'Apr 2026' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-[70px] flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111] border-r border-white/07 flex flex-col py-6 px-3 sticky top-[70px] h-[calc(100vh-70px)] overflow-y-auto hidden lg:flex">
        <div className="px-3 mb-6">
          <p className="text-xs text-red-400 uppercase tracking-widest font-medium">Admin Panel</p>
          <p className="text-xs text-muted mt-0.5">Super Admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${activeTab === id ? 'bg-red-500/10 text-red-400' : 'text-muted hover:text-white hover:bg-white/04'}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 lg:px-8 py-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl font-light">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          <button className="p-2 glass rounded-xl text-muted hover:text-white transition-colors relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PLATFORM_STATS.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted uppercase tracking-wider">{s.label}</p>
                    <s.icon size={14} style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-green-400 mt-0.5">{s.change}</p>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-4">Platform Revenue (₦)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000000).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }}
                    formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#C8A96B" strokeWidth={2} dot={{ fill: '#C8A96B', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Pending seller approvals */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending Seller Approvals
                </h3>
                <div className="space-y-2.5">
                  {PENDING_SELLERS.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/02 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted">{s.category} · {s.applied}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="w-7 h-7 rounded-lg bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center text-green-400 transition-colors">
                          <CheckCircle size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                          <XCircle size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flagged products */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Flag size={13} className="text-red-400" /> AI-Flagged Products
                </h3>
                <div className="space-y-2.5">
                  {FLAGGED_PRODUCTS.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-red-500/03 border border-red-500/10 rounded-xl p-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                        <Flag size={12} className="text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted">{p.seller} · {p.reason}</p>
                      </div>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 ${p.severity === 'high' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                        {p.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email…"
                className="w-full max-w-sm bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-gold/40 transition-colors" />
            </div>
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted border-b border-white/07">
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {filteredUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-white/02 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300">{u.name.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted text-xs">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] rounded-full px-2.5 py-1 capitalize ${u.role === 'seller' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] rounded-full px-2.5 py-1 capitalize ${u.status === 'active' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>{u.status}</span>
                      </td>
                      <td className="py-3 px-4 text-muted text-xs">{u.joined}</td>
                      <td className="py-3 px-4">
                        <button className="text-xs text-muted hover:text-red-400 transition-colors">
                          {u.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
