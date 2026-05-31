'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CinematicIntro from '@/components/CinematicIntro';
import { getProductImage, DEMO_PRODUCTS } from '@/lib/fashion-images';

interface Product {
  id: string;
  name: string;
  price: number;
  compare_price: number | null;
  thumbnail: string | null;
  images: string[] | null;
  category: string | null;
  like_count: number;
  sold_count: number;
  stores: { store_name: string } | null;
}

const TOP_CATS = ['All','Fashion','Shoes','Bags','Streetwear','Luxury','Beauty','Native Wear','Hoodies','Accessories'];

// Deterministic hash so same product always gets same demo image
function seedHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h);
}

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [activeCat, setActiveCat] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Show cinematic intro only once per session
    const seen = sessionStorage.getItem('veyra_intro');
    if (!seen) {
      setShowIntro(true);
      sessionStorage.setItem('veyra_intro', '1');
    }
    loadFeed(0, true);
  }, [activeCat, activeTab]);

  const loadFeed = async (pg: number, reset: boolean) => {
    setLoading(pg === 0);
    try {
      let q = supabase
        .from('products')
        .select('id,name,price,compare_price,thumbnail,images,category,like_count,sold_count,stores(store_name)')
        .eq('is_active', true);

      if (activeCat !== 'All') {
        q = q.ilike('category', `%${activeCat}%`);
      }
      if (activeTab === 'popular') {
        q = q.order('like_count', { ascending: false });
      } else {
        q = q.order('created_at', { ascending: false });
      }
      q = q.range(pg * 30, pg * 30 + 29);

      const { data } = await q;
      const real = data || [];

      // Apply real images OR fallback — every product gets an image
      const withImages = real.map((p: any) => ({
        ...p,
        thumbnail: getProductImage(
          p.thumbnail || p.images?.[0],
          p.id,
          p.category || ''
        ),
        stores: Array.isArray(p.stores) ? p.stores[0] : p.stores,
      }));

      // If DB has fewer than 12 items, pad with demo products
      let final = withImages;
      if (reset && withImages.length < 12) {
        const demoWithImages = DEMO_PRODUCTS.map((d, i) => ({
          ...d,
          thumbnail: getProductImage(null, d.id, d.category),
          compare_price: d.compare_price ?? null,
          images: null,
          sold_count: d.sold_count,
          stores: { store_name: d.store },
        }));
        // Mix real + demo, avoiding duplicate IDs
        const realIds = new Set(withImages.map((p: any) => p.id));
        const filtered = demoWithImages.filter(d => !realIds.has(d.id));
        final = [...withImages, ...filtered];
      }

      if (reset) {
        setProducts(final);
        setPage(0);
      } else {
        setProducts(prev => [...prev, ...withImages]);
        setPage(pg);
      }
      setHasMore(real.length === 30);
    } catch {
      // On error show demo products so feed never looks empty
      if (reset) {
        const demo = DEMO_PRODUCTS.map(d => ({
          ...d,
          thumbnail: getProductImage(null, d.id, d.category),
          compare_price: d.compare_price ?? null,
          images: null,
          stores: { store_name: d.store },
        }));
        setProducts(demo);
      }
      setHasMore(false);
    }
    setLoading(false);
  };

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadFeed(page + 1, false);
      }
    }, { threshold: 0.1 });
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading, page]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Split into 3 masonry columns
  const col1: Product[] = [], col2: Product[] = [], col3: Product[] = [];
  products.forEach((p, i) => {
    if (i % 3 === 0) col1.push(p);
    else if (i % 3 === 1) col2.push(p);
    else col3.push(p);
  });

  const heights = ['130%', '100%', '115%', '90%', '140%', '105%', '120%', '95%'];

  const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70';

  return (
    <>
      {showIntro && <CinematicIntro onComplete={() => setShowIntro(false)} />}

      <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>

        {/* ── Top bar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(20px)',
          // NO border-bottom — seamless with status bar
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 52, gap: 8 }}>
            {/* Logo */}
            <Link href="/" style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 300, letterSpacing: '0.22em', color: '#fff', textDecoration: 'none', flexShrink: 0, paddingRight: '0.22em' }}>
              VE<span style={{ color: '#C8A96B' }}>Y</span>RA
            </Link>

            {/* Search — tappable, goes to search page */}
            <button onClick={() => router.push('/search')} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', borderRadius: 50, height: 36,
              padding: '0 14px', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', textAlign: 'left',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>Search fashion…</span>
            </button>

            {/* Nav icons — SVG not emoji */}
            <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
              <Link href="/notifications" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.55)' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </Link>
              <Link href="/messages" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.55)' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </Link>
              <Link href="/profile" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'rgba(255,255,255,0.55)' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 12px 8px', gap: 6 }}>
            {TOP_CATS.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 50,
                border: `1px solid ${activeCat === cat ? 'rgba(200,169,107,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: activeCat === cat ? 'rgba(200,169,107,0.12)' : 'rgba(255,255,255,0.03)',
                color: activeCat === cat ? '#C8A96B' : 'rgba(255,255,255,0.45)',
                fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: activeCat === cat ? 600 : 400,
              }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 12px' }}>
            {[['popular', 'Popular'], ['foryou', 'For You']].map(([k, label]) => (
              <button key={k} onClick={() => setActiveTab(k)} style={{
                padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500,
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === k ? '#fff' : 'rgba(255,255,255,0.35)',
                borderBottom: activeTab === k ? '2px solid #C8A96B' : '2px solid transparent',
                marginBottom: -1,
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Feed ── */}
        <div style={{ padding: '8px 6px' }}>
          {loading ? (
            // Skeleton loader
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
                  backgroundSize: '800px 100%',
                  animation: 'shimmer 1.4s ease-in-out infinite',
                  borderRadius: 10,
                  paddingTop: i % 2 === 0 ? '130%' : '100%',
                }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
              {[col1, col2, col3].map((col, ci) => (
                <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {col.map((p, pi) => {
                    const isLiked = liked.includes(p.id);
                    const isSaved = saved.includes(p.id);
                    const pt = heights[(ci * 3 + pi * 2) % heights.length];
                    const disc = p.compare_price && p.compare_price > p.price
                      ? Math.round((1 - p.price / p.compare_price) * 100) : null;

                    return (
                      <div key={p.id}
                        style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#1a1a1a', cursor: 'pointer' }}
                        onClick={() => router.push(`/product/${p.id}`)}>
                        <div style={{ paddingTop: pt, position: 'relative' }}>
                          <img
                            src={p.thumbnail || FALLBACK}
                            alt={p.name}
                            loading="lazy"
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => { e.target.src = FALLBACK; }}
                          />

                          {/* Discount badge */}
                          {disc && (
                            <span style={{ position: 'absolute', top: 6, left: 6, background: '#ef4444', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>
                              -{disc}%
                            </span>
                          )}

                          {/* Price */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.75),transparent)', padding: '20px 6px 5px' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                              ₦{Number(p.price).toLocaleString()}
                            </p>
                          </div>

                          {/* Save button */}
                          <button onClick={e => toggleSave(p.id, e)} style={{
                            position: 'absolute', top: 6, right: 6,
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSaved ? '#C8A96B' : 'rgba(255,255,255,0.8)',
                          }}>
                            <Bookmark size={11} fill={isSaved ? '#C8A96B' : 'none'} />
                          </button>
                        </div>

                        {/* Info row */}
                        <div style={{ padding: '5px 7px 7px' }}>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 3px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {p.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                              {p.stores?.store_name || 'VEYRA'}
                            </p>
                            <button onClick={e => toggleLike(p.id, e)} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '0.6rem', padding: 0 }}>
                              <Heart size={9} fill={isLiked ? '#ef4444' : 'none'} />
                              {(p.like_count || 0) + (isLiked ? 1 : 0)}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Infinite scroll loader */}
          <div ref={loaderRef} style={{ padding: '16px', textAlign: 'center' }}>
            {!loading && hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8A96B', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            {!loading && !hasMore && products.length > 0 && (
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>✦ You've seen it all</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
        @keyframes bounce  { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </>
  );
}
