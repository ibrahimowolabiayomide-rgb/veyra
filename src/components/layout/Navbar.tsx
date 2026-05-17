'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, User, Search, Menu, X, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0B0B0B]/95 border-b border-white/10' : 'bg-[#0B0B0B]/80 border-b border-white/05'
      }`} style={{ backdropFilter: 'blur(20px)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-light tracking-[0.25em]">
            VE<span className="text-gold">Y</span>RA
          </Link>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-8 list-none">
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/ai-stylist', label: 'AI Stylist' },
              { href: '/marketplace?category=streetwear', label: 'Streetwear' },
              { href: '/marketplace?category=luxury', label: 'Luxury' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-muted hover:text-white transition-colors text-sm tracking-wide uppercase">
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="p-2 text-muted hover:text-white transition-colors hidden md:flex">
              <Search size={18} />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-muted hover:text-white transition-colors">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-[#0B0B0B] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link href="/profile?tab=wishlist" className="p-2 text-muted hover:text-white transition-colors hidden md:flex">
              <Heart size={18} />
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 glass rounded-full px-3 py-1.5 text-sm">
                  <User size={15} className="text-gold" />
                  <span className="hidden md:block text-sm max-w-[80px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl py-2 hidden group-hover:block shadow-2xl border border-white/10">
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
                    <User size={14} /> My Profile
                  </Link>
                  <Link href="/dashboard/seller" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
                    <Sparkles size={14} /> Seller Dashboard
                  </Link>
                  <Link href="/profile?tab=orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors">
                    <ShoppingCart size={14} /> My Orders
                  </Link>
                  <hr className="border-white/10 my-2" />
                  <button onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary !py-2 !px-4 text-sm">Login</Link>
                <Link href="/auth/signup" className="btn-primary !py-2 !px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-muted hover:text-white transition-colors">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#111] border-t border-white/07 p-6 flex flex-col gap-4">
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/ai-stylist', label: 'AI Stylist ✦' },
              { href: '/marketplace?category=streetwear', label: 'Streetwear' },
              { href: '/marketplace?category=luxury', label: 'Luxury' },
              { href: '/cart', label: `Cart (${cartCount})` },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="text-muted hover:text-white text-base py-1 transition-colors">
                {label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-3 pt-2">
                <Link href="/auth/login" className="btn-secondary flex-1 justify-center text-sm !py-2" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="btn-primary flex-1 justify-center text-sm !py-2" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 px-6"
          onClick={() => setSearchOpen(false)}>
          <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass rounded-2xl p-2 flex gap-3 border border-white/15">
            <Search size={20} className="text-muted ml-3 self-center flex-shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fashion, brands, styles…"
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-muted py-2"
            />
            <button type="submit" className="btn-primary !py-2 !px-4 text-sm flex-shrink-0">
              Search
            </button>
          </form>
        </div>
      )}
    </>
  );
}
