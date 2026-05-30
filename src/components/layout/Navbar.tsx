'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

const GOLD = '#C8A96B';

// ── Custom SVG icon components ──────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface Suggestion {
  type: 'product' | 'user' | 'category';
  id: string;
  label: string;
  sub?: string;
  href: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Hide on auth pages
  const hideOn = ['/auth/', '/splash'];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  useEffect(() => {
    loadBadges();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadBadges = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [{ count: n }, { count: m }] = await Promise.all([
        supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', session.user.id).eq('is_read', false),
      ]);
      setUnreadNotifs(n || 0);
      setUnreadMsgs(m || 0);
    } catch { /* badges optional */ }
  };

  const handleSearch = (val: string) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowDrop(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Search products
        const { data: products } = await supabase
          .from('products')
          .select('id,name,category')
          .ilike('name', `%${val}%`)
          .eq('is_active', true)
          .limit(4);

        // Search users/stores
        const { data: stores } = await supabase
          .from('stores')
          .select('id,store_name,store_slug')
          .ilike('store_name', `%${val}%`)
          .limit(3);

        const results: Suggestion[] = [
          ...(products || []).map((p: any) => ({
            type: 'product' as const, id: p.id, label: p.name,
            sub: p.category, href: `/product/${p.id}`,
          })),
          ...(stores || []).map((s: any) => ({
            type: 'user' as const, id: s.id, label: s.store_name,
            sub: 'Store', href: `/seller/${s.store_slug}`,
          })),
        ];

        // Add category suggestions
        const cats = ['Dresses', 'Shoes', 'Bags', 'Streetwear', 'Watches', 'Accessories', 'Native Wear', 'Luxury'];
        const matchCat = cats.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 2);
        matchCat.forEach(c => results.push({ type: 'category', id: c, label: c, sub: 'Category', href: `/search?q=${encodeURIComponent(c)}` }));

        // If no DB results, show smart suggestions
        if (results.length === 0) {
          results.push({ type: 'category', id: 'search', label: `Search "${val}"`, sub: 'Press enter', href: `/search?q=${encodeURIComponent(val)}` });
        }

        setSuggestions(results.slice(0, 7));
        setShowDrop(true);
      } catch {
        setSuggestions([{ type: 'category', id: 'search', label: `Search "${val}"`, sub: 'Press enter', href: `/search?q=${encodeURIComponent(val)}` }]);
        setShowDrop(true);
      }
      setSearching(false);
    }, 280);
  };

  const submitSearch = () => {
    if (!query.trim()) return;
    setShowDrop(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    inputRef.current?.blur();
  };

  const typeIcon = (type: string) => type === 'product' ? '◈' : type === 'user' ? '◎' : '◇';

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      // No border-bottom — seamless with status bar
      background: 'rgba(10,10,10,0.98)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      // Safe area + slight padding
      paddingTop: 'env(safe-area-inset-top, 0px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        height: 52,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, marginRight: 2 }}>
          <span style={{
            fontFamily: 'Georgia, serif', fontSize: '1.15rem',
            fontWeight: 300, letterSpacing: '0.22em',
            color: '#fff', paddingRight: '0.22em',
          }}>
            VE<span style={{ color: GOLD }}>Y</span>RA
          </span>
        </Link>

        {/* Search bar */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.07)', borderRadius: 50,
            padding: '0 12px', border: '1px solid rgba(255,255,255,0.08)',
            height: 36,
          }}>
            <SearchIcon />
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') { setShowDrop(false); inputRef.current?.blur(); } }}
              onFocus={() => { if (query && suggestions.length > 0) setShowDrop(true); }}
              placeholder="Search fashion, sellers…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: '0.82rem',
                caretColor: GOLD,
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSuggestions([]); setShowDrop(false); inputRef.current?.focus(); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <XIcon />
              </button>
            )}
            {searching && (
              <div style={{ width: 12, height: 12, border: '1.5px solid rgba(200,169,107,0.3)', borderTopColor: GOLD, borderRadius: '50%', animation: 'nav-spin 0.6s linear infinite', flexShrink: 0 }} />
            )}
          </div>

          {/* Dropdown suggestions */}
          {showDrop && suggestions.length > 0 && (
            <div ref={dropRef} style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 200,
              background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
              overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              animation: 'nav-fade 0.15s ease',
            }}>
              {suggestions.map((s, i) => (
                <div key={`${s.id}-${i}`}
                  onClick={() => { setShowDrop(false); setQuery(''); router.push(s.href); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: '0.75rem', color: s.type === 'product' ? GOLD : s.type === 'user' ? '#8B5CF6' : '#3B82F6', flexShrink: 0 }}>
                    {typeIcon(s.type)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</p>
                    {s.sub && <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'capitalize' }}>{s.sub}</p>}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {/* Notifications */}
          <Link href="/notifications" style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            <BellIcon />
            {unreadNotifs > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: GOLD, border: '1.5px solid #0a0a0a', fontSize: '0.5rem', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </Link>

          {/* Messages */}
          <Link href="/messages" style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            <ChatBubbleIcon />
            {unreadMsgs > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #0a0a0a', fontSize: '0.5rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadMsgs > 9 ? '9+' : unreadMsgs}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link href="/profile" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pathname === '/profile' ? GOLD : 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            <PersonIcon />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes nav-spin { to { transform: rotate(360deg); } }
        @keyframes nav-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
