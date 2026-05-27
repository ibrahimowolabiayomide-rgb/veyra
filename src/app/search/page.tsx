'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, TrendingUp, SlidersHorizontal, Heart, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getProductImage, DEMO_PRODUCTS, FASHION_IMAGES } from '@/lib/fashion-images';

const GOLD = '#C8A96B';

const TRENDING = ['Ankara Dress', 'Nike Sneakers', 'Luxury Bag', 'Gold Watch', 'Agbada Set', 'Streetwear', 'Heels', 'Hoodie', 'Silver Chain', 'Aso-Ebi'];

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
];

const SORT_OPTIONS = ['Trending', 'Newest', 'Price: Low→High', 'Price: High→Low', 'Most Liked'];

// Generate rich demo search results that look amazing with real images
function buildDemoResults(query: string, category: string, page: number) {
  const q = query.toLowerCase();
  const cat = category === 'all' ? '' : category;

  // Map queries to categories
  let imgCat = cat;
  if (!imgCat) {
    if (q.includes('dress') || q.includes('gown')) imgCat = 'dress';
    else if (q.includes('shoe') || q.includes('sneaker') || q.includes('heel') || q.includes('boot')) imgCat = 'shoes';
    else if (q.includes('bag') || q.includes('purse') || q.includes('handbag')) imgCat = 'bags';
    else if (q.includes('watch')) imgCat = 'watches';
    else if (q.includes('street')) imgCat = 'streetwear';
    else if (q.includes('access') || q.includes('chain') || q.includes('necklace') || q.includes('ring')) imgCat = 'accessories';
    else if (q.includes('native') || q.includes('agbada') || q.includes('ankara') || q.includes('aso')) imgCat = 'nativewear';
    else if (q.includes('hoodie') || q.includes('sweat')) imgCat = 'hoodies';
    else if (q.includes('luxury')) imgCat = 'luxury';
  }

  const pool = (FASHION_IMAGES as any)[imgCat] || FASHION_IMAGES.general;
  const stores = ['Lagos Drip Co', 'Eko Fashion House', 'Abuja Luxe', 'Sneaker Republic NG', 'GlamourNG', 'Chidex Collections', 'Gold Class NG', 'Aso-Ebi Palace', 'Street Kings NG', 'Zara Accessories NG'];

  return Array.from({ length: 12 }, (_, i) => {
    const idx = (page * 12 + i);
    const price = 8000 + Math.floor(((idx * 7919) % 100) * 1500);
    const hasDiscount = idx % 3 === 0;
    const nameTemplates = [
      `Premium ${q || imgCat || 'Fashion'} Collection`,
      `Lagos Style ${q || 'Piece'}`,
      `Luxury ${q || imgCat || 'Item'} — New`,
      `${stores[idx % stores.length]} Special`,
      `Designer ${q || 'Fashion'} Set`,
      `Trending ${q || imgCat || 'Style'} Pick`,
    ];
    return {
      id: `demo-${idx}-${q}`,
      name: nameTemplates[idx % nameTemplates.length],
      price,
      compare_price: hasDiscount ? Math.round(price * 1.3) : null,
      thumbnail: pool[idx % pool.length],
      store: stores[idx % stores.length],
      like_count: 50 + Math.floor(((idx * 1031) % 500)),
      rating: 4.3 + (idx % 7) * 0.1,
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

  const [query, setQuery] = useState(sp.get('q') || '');
  const [inputVal, setInputVal] = useState(sp.get('q') || '');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('Trending');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searched, setSearched] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (query) { doSearch(0, true); }
    else { inputRef.current?.focus(); }
  }, [query, category, sort]);

  const doSearch = async (pg: number, reset: boolean) => {
    if (loading) return;
    setLoading(true);
    setSearched(true);

    try {
      let q = supabase.from('products').select('id,name,price,compare_price,thumbnail,images,category,like_count,stores(store_name)', { count: 'exact' });

      if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`);
      if (category !== 'all') q = q.eq('category', category);
      if (minPrice) q = q.gte('price', Number(minPrice));
      if (maxPrice) q = q.lte('price', Number(maxPrice));

      const sortMap: Record<string, { col: string; asc: boolean }> = {
        'Trending': { col: 'like_count', asc: false },
        'Newest': { col: 'created_at', asc: false },
        'Price: Low→High': { col: 'price', asc: true },
        'Price: High→Low': { col: 'price', asc: false },
        'Most Liked': { col: 'like_count', asc: false },
      };
      const s = sortMap[sort] || sortMap['Trending'];
      q = q.order(s.col, { ascending: s.asc });
      q = q.range(pg * 16, pg * 16 + 15);

      const { data, count } = await q;

      // Merge real DB results with demo (fallback)
      const real = (data || []).map((p: any) => ({
        ...p,
        thumbnail: getProductImage(p.thumbnail || p.images?.[0], p.id?.charCodeAt(0) || 0, p.category),
        store: p.stores?.store_name || 'VEYRA Seller',
        isDemo: false,
      }));

      const showDemo = real.length < 8;
      const demo = showDemo ? buildDemoResults(query, category, pg) : [];
      const merged = reset ? [...real, ...demo] : [...results, ...real, ...demo];

      setResults(merged);
      setPage(pg);
      setHasMore((count || 0) > (pg + 1) * 16 || showDemo);
    } catch {
      // On error just show demo results
      const demo = buildDemoResults(query, category, pg);
      setResults(reset ? demo : [...results, ...demo]);
      setHasMore(pg < 3);
      setPage(pg);
    }
    setLoading(false);
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
  }, [hasMore, loading, searched, page]);

  const handleSearch = (val: string) => {
    setQuery(val);
    router.replace(`/search?q=${encodeURIComponent(val)}`, { scroll: false });
  };

  const toggleLike = (id: string) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const getVarHeight = (i: number) => {
    const heights = ['100%', '120%', '90%', '115%', '95%', '110%'];
    return heights[i % heights.length];
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>

      {/* Search bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 90,
        background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '8px 12px',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#1a1a1a', borderRadius: 14, padding: '0 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={15} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(inputVal)}
              placeholder="Search fashion, styles, sellers…"
              autoComplete="off"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.9rem', padding: '11px 0' }}
            />
            {inputVal && (
              <button onClick={() => { setInputVal(''); setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0 }}>
                <X size={14} />
              </button>
            )}
          </div>
          {inputVal !== query && (
            <button onClick={() => handleSearch(inputVal)} style={{ padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Go
            </button>
          )}
          <button onClick={() => setShowFilters(!showFilters)} style={{ width: 40, height: 40, borderRadius: 12, background: showFilters ? 'rgba(200,169,107,0.15)' : '#1a1a1a', border: `1px solid ${showFilters ? 'rgba(200,169,107,0.4)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SlidersHorizontal size={15} style={{ color: showFilters ? GOLD : 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 6, width: '100%' }}>
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₦"
                style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: '0.8rem', outline: 'none' }} />
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₦"
                style={{ flex: 1, background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px', color: '#fff', fontSize: '0.8rem', outline: 'none' }} />
              <button onClick={() => doSearch(0, true)} style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(200,169,107,0.15)', border: '1px solid rgba(200,169,107,0.3)', color: GOLD, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Apply</button>
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', width: '100%' }}>
              {SORT_OPTIONS.map(s => (
                <button key={s} onClick={() => setSort(s)} style={{ padding: '5px 12px', borderRadius: 50, border: `1px solid ${sort === s ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.1)'}`, background: sort === s ? 'rgba(200,169,107,0.1)' : 'none', color: sort === s ? GOLD : 'rgba(255,255,255,0.5)', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingTop: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{ padding: '5px 12px', borderRadius: 50, border: `1px solid ${category === c.key ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.08)'}`, background: category === c.key ? 'rgba(200,169,107,0.12)' : 'rgba(255,255,255,0.03)', color: category === c.key ? GOLD : 'rgba(255,255,255,0.5)', fontSize: '0.73rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: category === c.key ? 600 : 400 }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* TRENDING — shown when no query */}
      {!searched && (
        <div style={{ padding: '1.2rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <TrendingUp size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trending searches</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRENDING.map(t => (
              <button key={t} onClick={() => { setInputVal(t); handleSearch(t); }}
                style={{ padding: '7px 14px', borderRadius: 50, background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Visual demo grid — always show beautiful fashion */}
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 24, marginBottom: 12 }}>✦ Featured this week</p>
          <div style={{ columns: '2 auto', gap: 8 }}>
            {buildDemoResults('', 'all', 0).slice(0, 8).map((p, i) => {
              const disc = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
              return (
                <div key={p.id} onClick={() => { setInputVal(p.name.split(' ')[0]); handleSearch(p.name.split(' ')[0]); }}
                  style={{ breakInside: 'avoid', marginBottom: 8, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', display: 'block' }}>
                  <div style={{ position: 'relative', paddingTop: getVarHeight(i) }}>
                    <img src={p.thumbnail} alt={p.name} loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => { e.target.src = FASHION_IMAGES.general[i % FASHION_IMAGES.general.length]; }} />
                    {disc && <span style={{ position: 'absolute', top: 6, left: 6, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 50 }}>-{disc}%</span>}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent)', padding: '20px 8px 7px' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', margin: 0 }}>₦{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {searched && (
        <div style={{ padding: '10px 8px' }}>
          {results.length > 0 && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', padding: '0 6px 8px' }}>
              {results.length}+ results for <span style={{ color: GOLD }}>&ldquo;{query || category}&rdquo;</span>
            </p>
          )}

          {/* Masonry grid */}
          <div style={{ columns: '2 auto', gap: 8 }}>
            {results.map((p, i) => {
              const disc = p.compare_price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
              const isLiked = liked.has(p.id);
              return (
                <div key={`${p.id}-${i}`} style={{ breakInside: 'avoid', marginBottom: 8, borderRadius: 14, overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                  <Link href={p.isDemo ? '/auth/signup' : `/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ position: 'relative', paddingTop: getVarHeight(i) }}>
                      <img src={p.thumbnail} alt={p.name} loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.target.src = FASHION_IMAGES.general[i % FASHION_IMAGES.general.length]; }} />
                      {disc && <span style={{ position: 'absolute', top: 7, left: 7, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>-{disc}%</span>}
                      <button onClick={e => { e.preventDefault(); toggleLike(p.id); }}
                        style={{ position: 'absolute', top: 7, right: 7, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={13} fill={isLiked ? '#ef4444' : 'none'} style={{ color: isLiked ? '#ef4444' : '#fff' }} />
                      </button>
                    </div>
                    <div style={{ padding: '8px 10px 10px' }}>
                      <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.store}</p>
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

          {/* Loader / end */}
          <div ref={loaderRef} style={{ padding: '20px', textAlign: 'center' }}>
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            {!loading && !hasMore && results.length > 0 && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>✦ You&apos;ve seen it all</p>
            )}
            {!loading && searched && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</p>
                <p style={{ fontSize: '1rem', color: '#fff', marginBottom: 6 }}>No results for &ldquo;{query}&rdquo;</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>Try different keywords or browse categories</p>
                <button onClick={() => { setQuery(''); setInputVal(''); setResults([]); setSearched(false); }} style={{ padding: '10px 22px', borderRadius: 50, background: 'rgba(200,169,107,0.1)', border: '1px solid rgba(200,169,107,0.3)', color: GOLD, fontSize: '0.82rem', cursor: 'pointer' }}>
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        ::-webkit-scrollbar{display:none}
        *{-webkit-tap-highlight-color:transparent}
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
