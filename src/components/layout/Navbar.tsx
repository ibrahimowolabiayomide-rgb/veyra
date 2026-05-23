'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, User, Search, Menu, X, Sparkles, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));

  useEffect(() => {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 50));
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setUnreadNotifs(0); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    // Count unread notifications
    const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
    setUnreadNotifs(count || 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setDropdownOpen(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 70,
        background: scrolled ? 'rgba(5,5,5,0.97)' : 'rgba(5,5,5,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.3s ease',
        display: 'flex', alignItems: 'center',
        padding: '0 3rem',
        gap: '2rem',
      }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'serif', fontSize: '1.6rem', fontWeight: 300, letterSpacing: '0.3em', color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
          VE<span style={{ color: '#C8A96B' }}>Y</span>RA
        </Link>

        {/* Desktop nav */}
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0, flex: 1 }} className="hidden lg:flex">
          {[
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/ai-stylist', label: 'AI Stylist' },
            { href: '/marketplace?category=streetwear', label: 'Streetwear' },
            { href: '/marketplace?category=luxury', label: 'Luxury' },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link href={href} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Search */}
          <button onClick={() => setSearchOpen(true)} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', borderRadius: '50%', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            <Search size={18} />
          </button>

          {/* Cart */}
          <Link href="/cart" style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: 1, right: 1, background: '#C8A96B', color: '#0B0B0B', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          {user && (
            <Link href="/notifications" style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}>
              <Bell size={18} />
              {unreadNotifs > 0 && (
                <span style={{ position: 'absolute', top: 1, right: 1, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </Link>
          )}

          {/* User */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '6px 12px 6px 6px', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>{profile?.full_name?.charAt(0) || '?'}</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#fff', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 220, background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: '8px 0', zIndex: 100,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>{profile?.full_name}</p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>@{profile?.username}</p>
                    </div>
                    {[
                      { label: '👤 My Profile', href: '/profile' },
                      { label: '📦 My Orders', href: '/profile?tab=orders' },
                      { label: '♡ Wishlist', href: '/profile?tab=wishlist' },
                      { label: '🏪 Seller Dashboard', href: '/dashboard/seller' },
                      { label: '⚙️ Settings', href: '/settings' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                        style={{ display: 'block', padding: '9px 16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.target as HTMLElement).style.background = 'none'; }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
                      <button onClick={handleSignOut}
                        style={{ width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: '0.85rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.background = 'none'; }}>
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login" className="btn-ghost !py-2 !px-4 text-sm">Login</Link>
              <Link href="/auth/signup" className="btn-primary !py-2 !px-4 text-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 70, left: 0, right: 0, background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', zIndex: 99, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/ai-stylist', label: '✦ AI Stylist' },
            { href: '/marketplace?category=streetwear', label: 'Streetwear' },
            { href: '/marketplace?category=luxury', label: 'Luxury' },
            { href: '/cart', label: `🛒 Cart (${cartCount})` },
            { href: '/notifications', label: '🔔 Notifications' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '1rem', padding: '4px 0' }}>
              {label}
            </Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <Link href="/auth/login" className="btn-secondary flex-1 justify-center text-sm !py-2" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/auth/signup" className="btn-primary flex-1 justify-center text-sm !py-2" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12rem', padding: '12rem 1.5rem 0' }}>
          <form onSubmit={handleSearch} onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: 8 }}>
            <Search size={20} style={{ color: 'rgba(255,255,255,0.4)', alignSelf: 'center', marginLeft: 8, flexShrink: 0 }} />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fashion, brands, styles…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '1.1rem', padding: '8px 0' }} />
            <button type="submit" className="btn-primary !py-2 !px-4 text-sm flex-shrink-0">Search</button>
          </form>
        </div>
      )}
    </>
  );
}
