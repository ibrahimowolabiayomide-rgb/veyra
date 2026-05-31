'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, TrendingUp, Clock, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getProductImage, FASHION_IMAGES, DEMO_PRODUCTS } from '@/lib/fashion-images';

const GOLD = '#C8A96B';

// English-only trending searches
const TRENDING = [
  'Red Dress', 'Sneakers', 'Luxury Handbag', 'Gold Watch', 'Evening Gown',
  'Streetwear', 'High Heels', 'Hoodie', 'Chain Necklace', 'Summer Outfit',
  'Designer Bag', 'Casual Wear', 'Blazer', 'Maxi Dress', 'Running Shoes',
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'dress', label: '👗 Dresses' },
  { key: 'shoes', label: '👟 Shoes' },
  { key: 'bags', label: '👜 Bags' },
  { key: 'watches', label: '⌚ Watches' },
  { key: 'streetwear', label: '🧢 Streetwear' },
  { key: 'accessories', label: '💍 Accessories' },
  { key: 'nativewear', label: '🪡 Native Wear' },
  { key: 'luxury', label: '✦ Luxury' },
  { key: 'hoodies', label: '🧥 Hoodies' },
];

const SORT = ['Trending', 'Newest', 'Price ↑', 'Price ↓', 'Most Liked'];

// Fuzzy score — how similar is needle to haystack
function fuzzyScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  // Word-level partial match
  const words = q.split(/\s+/);
  const matches = words.filter(w => t.includes(w));
  if (matches.length === words.length) return 70;
  if (matches.length > 0) return 50 + (matches.length / words.length) * 20;
  // Character-level trigram similarity
  let score = 0;
  for (let i = 0; i < q.length - 1; i++) {
    if (t.includes(q.slice(i, i + 2))) score++;
  }
  return (score / Math.max(q.length - 1, 1)) * 40;
}

// Synonym/alias mapping for smarter search
const SYNONYMS: Record<string, string[]> = {
  dress: ['gown', 'frock', 'outfit', 'wear', 'cloth'],
  shoes: ['sneakers', 'heels', 'boots', 'sandals', 'footwear', 'kicks'],
  bags: ['handbag', 'purse', 'tote', 'clutch', 'backpack'],
  watches: ['timepiece', 'wristwatch', 'clock'],
  nativewear: ['native', 'traditional', 'ankara', 'agbada', 'buba', 'aso'],
  streetwear: ['street', 'urban', 'casual', 'hip', 'swag'],
  accessories: ['jewelry', 'jewellery', 'necklace', 'ring', 'bracelet', 'chain'],
  luxury: ['premium', 'designer', 'high-end', 'exclusive'],
  hoodies: ['hoodie', 'sweatshirt', 'pullover', 'sweater'],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase();
  const terms = [lower];
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (synonyms.some(s => lower.includes(s)) || lower.includes(key)) {
      terms.push(key, ...synonyms);
    }
  }
  return [...new Set(terms)];
}

// Build smart demo results that never repeat
function buildSmartResults(query: string, category: string, page: number, count = 16): any[] {
  const q = query.toLowerCase();
  const cat = category === 'all' ? '' : category;

  // Determine best image category from query
  let imgCat = cat;
  if (!imgCat) {
    const terms = expandQuery(q);
    for (const [key] of Object.entries(SYNONYMS)) {
      if (terms.some(t => t.includes(key) || key.includes(t))) { imgCat = key; break; }
    }
    if (!imgCat) {
      if (q.includes('dress') || q.includes('gown')) imgCat = 'dress';
      else if (q.includes('shoe') || q.includes('sneak') || q.includes('heel')) imgCat = 'shoes';
      else if (q.includes('bag') || q.includes('purse')) imgCat = 'bags';
      else if (q.includes('watch')) imgCat = 'watches';
      else if (q.includes('chain') || q.includes('necklace') || q.includes('jewel')) imgCat = 'accessories';
    }
  }

  const pool = (FASHION_IMAGES as any)[imgCat] || FASHION_IMAGES.general;

  const stores = ['Style Hub', 'Fashion Forward', 'Urban Luxe', 'Trend Setter', 'Elite Wear', 'Mode Collection', 'Premier Style', 'Chic Boutique', 'The Fashion House', 'Luxury Zone'];
  const adjectives = ['Premium', 'Luxury', 'Designer', 'Classic', 'Modern', 'Exclusive', 'Elegant', 'Stylish', 'Trendy', 'Signature'];
  const queryLabel = query ? query.replace(/\b\w/g, c => c.toUpperCase()) : (imgCat || 'Fashion').replace(/\b\w/g, c => c.toUpperCase());

  return Array.from({ length: count }, (_, i) => {
    const seed = page * count + i;
    // Use different prime numbers to distribute images evenly
    const imgIdx = (seed * 7 + page * 3 + i * 11) % pool.length;
    const price = 8000 + Math.floor(((seed * 7919 + i * 1031) % 100) * 1500);
    const hasDiscount = (seed + i) % 3 === 0;

    return {
      id: `smart-${seed}-${q.slice(0, 5)}-${i}`,
      name: `${adjectives[seed % adjectives.length]} ${queryLabel} ${['Collection', 'Style', 'Set', 'Piece', 'Edition', 'Series'][i % 6]}`,
      price,
      compare_price: hasDiscount ? Math.round(price * (1.2 + (seed % 3) * 0.1)) : null,
      thumbnail: pool[imgIdx],
      store: stores[seed % stores.length],
      like_count: 20 + ((seed * 1031 + i * 7) % 800),
      rating: 4.0 + ((seed + i) % 10) * 0.1,
      category: imgCat || 'fashion',
      isDemo: true,
    };
  });
}

function SearchContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const [query, setQuery] = useState(sp.get('q') || '');
  const [inputVal, setInputVal] = useState(sp.get('q') || '');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('Trending');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searched, setSearched] = useState(!!sp.get('q'));
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('veyra_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
    if (query) doSearch(0, true);
    else inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query) doSearch(0, true);
  }, [category, sort]);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem('veyra_recent_searches', JSON.stringify(updated));
  };

  const doSearch = async (pg: number, reset: boolean) => {
    if (loading && !reset) return;
    setLoading(true);
    setSearched(true);

    const expandedTerms = expandQuery(query || category);

    try {
      // Build Supabase query with smart matching
      let q = supabase.from('products')
        .select('id,name,price,compare_price,thumbnail,images,category,like_count,stores(store_name)', { count: 'exact' })
        .eq('is_active', true);

      if (query) {
        // Try multiple search strategies
        const searchTerms = expandedTerms.slice(0, 3).map(t => `name.ilike.%${t}%`).join(',');
        q = q.or(`${searchTerms},description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      if (category !== 'all') q = q.ilike('category', `%${category}%`);
      if (minPrice) q = q.gte('price', Number(minPrice));
      if (maxPrice) q = q.lte('price', Number(maxPrice));

      const sortMap: Record<string, { col: string; asc: boolean }> = {
        'Trending': { col: 'like_count', asc: false },
        'Newest': { col: 'created_at', asc: false },
        'Price ↑': { col: 'price', asc: true },
        'Price ↓': { col: 'price', asc: false },
        'Most Liked': { col: 'like_count', asc: false },
      };
      const s = sortMap[sort] || sortMap['Trending'];
      q = q.order(s.col, { ascending: s.asc }).range(pg * 16, pg * 16 + 15);

      const { data, count } = await q;

      // Apply images to real results
      const real = (data || []).map((p: any, i: number) => ({
        ...p,
        thumbnail: getProductImage(p.thumbnail || p.images?.[0], p.id || i, p.category),
        store: Array.isArray(p.stores) ? p.stores[0]?.store_name : p.stores?.store_name || 'VEYRA',
        isDemo: false,
      }));

      // Score and sort real results by relevance
      const scored = real.map(p => ({
        ...p,
        _score: fuzzyScore(p.name + ' ' + (p.category || ''), query || category),
      })).sort((a, b) => b._score - a._score);

      // Always pad with smart demo results so we never show empty
      const smartDemo = buildSmartResults(query, category, pg, Math.max(0, 16 - scored.length));
      // Deduplicate: don't show demo IDs that match real ones
      const realIds = new Set(scored.map(p => p.id));
      const filteredDemo = smartDemo.filter(d => !realIds.has(d.id));

      const merged = [...scored, ...filteredDemo];
      const allResults = reset ? merged : [...results, ...merged];

      setResults(allResults);
      setTotalCount(count || allResults.length);
      setPage(pg);
      setHasMore((count || 0) > (pg + 1) * 16 || pg < 3);
    } catch {
      // On error, always show demo results
      const demo = buildSmartResults(query, category, pg);
      setResults(reset ? demo : [...results, ...demo]);
      setHasMore(pg < 3);
      setPage(pg);
    }

    setLoading(false);
  };

  // Live suggestions while typing
  const handleInputChange = (val: string) => {
    setInputVal(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }

    debounceRef.current = setTimeout(async () => {
      const expanded = expandQuery(val);
      const trending = TRENDING.filter(t => t.toLowerCase().includes(val.toLowerCase())).slice(0, 3);
      try {
        const { data } = await supabase.from('products')
          .select('name').eq('is_active', true)
          .or(expanded.slice(0, 2).map(t => `name.ilike.%${t}%`).join(','))
          .limit(4);
        const names = (data || []).map((p: any) => p.name).slice(0, 4);
        setSuggestions([...trending, ...names].slice(0, 7));
        setShowSuggestions(true);
      } catch {
        setSuggestions(trending);
        setShowSuggestions(trending.length > 0);
      }
    }, 200);
  };

  const handleSearch = (val: string) => {
    const q = val.trim();
    setQuery(q);
    setInputVal(q);
    setShowSuggestions(false);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
    if (q) { saveRecentSearch(q); doSearch(0, true); }
  };

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading && searched) {
        doSearch(page + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page, searched]);

  const heights = ['100%', '120%', '90%', '115%', '95%', '110%'];
  const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70';

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Search header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)', paddingTop: 'env(safe-area-inset-top,0px)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '0 12px', border: '1px solid rgba(255,255,255,0.08)', height: 40 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                ref={inputRef}
                value={inputVal}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(inputVal); if (e.key === 'Escape') setShowSuggestions(false); }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search dresses, shoes, bags…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.88rem', caretColor: GOLD }}
              />
              {inputVal && (
                <button onClick={() => { setInputVal(''); setQuery(''); setResults([]); setSearched(false); setSuggestions([]); inputRef.current?.focus(); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => handleSearch(s)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <TrendingUp size={12} style={{ color: GOLD, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#fff' }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {inputVal !== query && (
            <button onClick={() => handleSearch(inputVal)} style={{ padding: '9px 14px', borderRadius: 12, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
              Search
            </button>
          )}

          <button onClick={() => setShowFilters(!showFilters)} style={{ width: 40, height: 40, borderRadius: 12, background: showFilters ? 'rgba(200,169,107,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showFilters ? 'rgba(200,169,107,0.4)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SlidersHorizontal size={15} style={{ color: showFilters ? GOLD : 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₦" style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: '0.8rem', outline: 'none' }} />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₦" style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: '0.8rem', outline: 'none' }} />
              <button onClick={() => doSearch(0, true)} style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(200,169,107,0.15)', border: '1px solid rgba(200,169,107,0.3)', color: GOLD, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply</button>
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {SORT.map(s => (
                <button key={s} onClick={() => setSort(s)} style={{ padding: '5px 12px', borderRadius: 50, border: `1px solid ${sort === s ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.1)'}`, background: sort === s ? 'rgba(200,169,107,0.1)' : 'none', color: sort === s ? GOLD : 'rgba(255,255,255,0.5)', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 12px 8px' }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{ padding: '5px 12px', borderRadius: 50, border: `1px solid ${category === c.key ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.08)'}`, background: category === c.key ? 'rgba(200,169,107,0.12)' : 'rgba(255,255,255,0.03)', color: category === c.key ? GOLD : 'rgba(255,255,255,0.5)', fontSize: '0.73rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: category === c.key ? 600 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Not searched yet: show trending + recent ── */}
      {!searched && (
        <div style={{ padding: '1rem' }}>
          {recentSearches.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent</span>
                </div>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem('veyra_recent_searches'); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', cursor: 'pointer' }}>Clear</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recentSearches.map(r => (
                  <button key={r} onClick={() => handleSearch(r)} style={{ padding: '6px 14px', borderRadius: 50, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <TrendingUp size={13} style={{ color: GOLD }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trending</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {TRENDING.map(t => (
              <button key={t} onClick={() => handleSearch(t)} style={{ padding: '6px 14px', borderRadius: 50, background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Featured grid */}
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>✦ Featured</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {buildSmartResults('', 'all', 0, 8).map((p, i) => (
              <div key={p.id} onClick={() => handleSearch(TRENDING[i % TRENDING.length])}
                style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative', background: '#1a1a1a' }}>
                <div style={{ paddingTop: i % 2 === 0 ? '115%' : '90%', position: 'relative' }}>
                  <img src={p.thumbnail} alt="" loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.src = FALLBACK; }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.75),transparent)', padding: '20px 10px 8px' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', margin: 0 }}>₦{p.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {searched && (
        <div style={{ padding: '8px 8px 0' }}>
          {results.length > 0 && !loading && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', padding: '0 4px 8px' }}>
              {totalCount > 0 ? `${totalCount.toLocaleString()}+` : results.length} results
              {query && <> for <span style={{ color: GOLD }}>&ldquo;{query}&rdquo;</span></>}
            </p>
          )}

          {/* Skeleton */}
          {loading && results.length === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.4s ease-in-out infinite', borderRadius: 14, paddingTop: i % 2 === 0 ? '130%' : '100%' }} />
              ))}
            </div>
          )}

          {/* Grid */}
          {results.length > 0 && (
            <div style={{ columns: '2 auto', gap: 8 }}>
              {results.map((p, i) => {
                const disc = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
                const isLiked = liked.has(p.id);
                return (
                  <div key={`${p.id}-${i}`} style={{ breakInside: 'avoid', marginBottom: 8, borderRadius: 14, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link href={p.isDemo ? `/auth/signup` : `/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ position: 'relative', paddingTop: heights[i % heights.length] }}>
                        <img src={p.thumbnail || FALLBACK} alt={p.name} loading="lazy"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => { e.target.src = FALLBACK; }} />
                        {disc && <span style={{ position: 'absolute', top: 7, left: 7, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>-{disc}%</span>}
                        <button onClick={e => { e.preventDefault(); setLiked(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; }); }}
                          style={{ position: 'absolute', top: 7, right: 7, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Heart size={13} fill={isLiked ? '#ef4444' : 'none'} style={{ color: isLiked ? '#ef4444' : '#fff' }} />
                        </button>
                      </div>
                      <div style={{ padding: '8px 10px 10px' }}>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.store || 'VEYRA'}</p>
                        <p style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 5px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>₦{Number(p.price).toLocaleString()}</span>
                          {p.compare_price && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₦{Number(p.compare_price).toLocaleString()}</span>}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loader */}
          <div ref={loaderRef} style={{ padding: '20px', textAlign: 'center' }}>
            {loading && results.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: `bounce 1s ${i * 0.15}s infinite` }} />)}
              </div>
            )}
            {!loading && !hasMore && results.length > 0 && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>✦ All results shown</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '1rem' }}>
        <div style={{ height: 44, background: '#1a1a1a', borderRadius: 14, marginBottom: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Array(8).fill(0).map((_, i) => <div key={i} style={{ height: i % 2 === 0 ? 240 : 190, background: '#1a1a1a', borderRadius: 14 }} />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
