'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Heart, X, TrendingUp, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';

const CATS = ['All','Streetwear','Luxury','Sneakers','Native Wear','Hoodies','Women','Accessories','Bags','Jewelry'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
];

function Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const addItem = useCartStore(s => s.addItem);
  const supabase = createClient();

  useEffect(() => { fetchProducts(); }, [query, category, sort, minPrice, maxPrice]);
  useEffect(() => { fetchTrending(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = supabase.from('products')
        .select('id,name,price,compare_price,thumbnail,images,rating,review_count,sold_count,is_featured,categories(name,slug),stores(store_name,is_verified)')
        .order(sort === 'price_asc' || sort === 'price_desc' ? 'price' : sort === 'popular' ? 'sold_count' : sort === 'rating' ? 'rating' : 'created_at',
          { ascending: sort === 'price_asc' });

      if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      if (minPrice) q = q.gte('price', parseFloat(minPrice));
      if (maxPrice) q = q.lte('price', parseFloat(maxPrice));

      if (category && category !== 'all') {
        const slug = category.toLowerCase().replace(/ /g, '-');
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).single();
        if (cat) q = q.eq('category_id', cat.id);
      }

      const { data, error } = await q.limit(40);
      if (error) throw error;
      setProducts(data || []);
    } catch (e) { console.error(e); setProducts([]); }
    setLoading(false);
  };

  const fetchTrending = async () => {
    const { data } = await supabase.from('trending_searches').select('query,count').order('count', { ascending: false }).limit(6);
    setTrending(data || []);
  };

  const toggleWishlist = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to save'); router.push('/auth/login'); return; }
    if (wishlist.includes(id)) {
      await supabase.from('wishlists').delete().eq('user_id', session.user.id).eq('product_id', id);
      setWishlist(p => p.filter(i => i !== id));
      toast.success('Removed');
    } else {
      await supabase.from('wishlists').insert({ user_id: session.user.id, product_id: id });
      setWishlist(p => [...p, id]);
      toast.success('Saved ♡');
    }
  };

  const addToCart = (p: any) => {
    addItem({ id: p.id, productId: p.id, name: p.name, price: p.price, image: p.thumbnail || '', sellerName: p.stores?.store_name || '' });
    toast.success('Added to cart!');
  };

  return (
    <div style={{ background: '#050505', minHeight: '100vh', paddingTop: 70 }}>
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <p style={{ fontSize: '0.68rem', color: '#C8A96B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 1, background: '#C8A96B', display: 'inline-block' }} /> Marketplace
        </p>
        <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 300, color: '#fff', marginBottom: '1.25rem' }}>Discover fashion</h1>

        {/* Search bar */}
        <form onSubmit={e => { e.preventDefault(); setQuery(inputVal); }} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input value={inputVal} onChange={e => setInputVal(e.target.value)}
              placeholder="Search products, styles..."
              style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, paddingLeft: 36, paddingRight: inputVal ? 32 : 12, paddingTop: 10, paddingBottom: 10, color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            {inputVal && <button type="button" onClick={() => { setInputVal(''); setQuery(''); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}><X size={14} /></button>}
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '10px 14px', borderRadius: 12, border: `1px solid ${showFilters ? 'rgba(200,169,107,0.4)' : 'rgba(255,255,255,0.1)'}`, background: showFilters ? 'rgba(200,169,107,0.1)' : '#111', color: showFilters ? '#C8A96B' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', flexShrink: 0 }}>
            <SlidersHorizontal size={14} /> Filter
          </button>
        </form>

        {/* Trending */}
        {!query && trending.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, scrollbarWidth: 'none' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, alignSelf: 'center' }}>🔥</span>
            {trending.map((t: any) => (
              <button key={t.query} onClick={() => { setInputVal(t.query); setQuery(t.query); }}
                style={{ flexShrink: 0, fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '4px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                {t.query}
              </button>
            ))}
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Min ₦</p>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0"
                  style={{ width: '100%', background: '#0B0B0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Max ₦</p>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any"
                  style={{ width: '100%', background: '#0B0B0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Sort by</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => setSort(s.value)}
                    style={{ fontSize: '0.75rem', padding: '5px 12px', borderRadius: 50, border: `1px solid ${sort === s.value ? 'rgba(200,169,107,0.4)' : 'rgba(255,255,255,0.1)'}`, background: sort === s.value ? 'rgba(200,169,107,0.1)' : 'none', color: sort === s.value ? '#C8A96B' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSort('newest'); }} style={{ marginTop: 10, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear all</button>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none', paddingBottom: 4 }}>
          {CATS.map(cat => {
            const isActive = (cat === 'All' && !category) || category === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                style={{ flexShrink: 0, fontSize: '0.78rem', padding: '7px 14px', borderRadius: 50, border: `1px solid ${isActive ? 'rgba(200,169,107,0.4)' : 'rgba(255,255,255,0.1)'}`, background: isActive ? 'rgba(200,169,107,0.1)' : 'rgba(255,255,255,0.03)', color: isActive ? '#C8A96B' : 'rgba(255,255,255,0.5)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
          {loading ? 'Loading...' : `${products.length} products${query ? ` for "${query}"` : ''}`}
        </p>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 1rem 2rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ background: '#111', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#1a1a1a' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ height: 10, background: '#222', borderRadius: 4, marginBottom: 6, width: '50%' }} />
                  <div style={{ height: 12, background: '#222', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#222', borderRadius: 4, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 10 }}>◈</p>
            <p style={{ fontSize: '1rem', marginBottom: 6 }}>No products found</p>
            <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Try a different search or category</p>
            <button onClick={() => { setQuery(''); setInputVal(''); setCategory(''); }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 24px', borderRadius: 50, fontSize: '0.85rem', cursor: 'pointer' }}>
              Clear search
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {products.map(p => {
              const img = p.thumbnail || p.images?.[0];
              const disc = p.compare_price && p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
              return (
                <div key={p.id} style={{ background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#1a1a1a', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
                          <span style={{ fontFamily: 'serif', fontSize: '3rem', opacity: 0.08, color: '#8B5CF6' }}>{p.name?.charAt(0)}</span>
                        </div>
                      )}
                      {disc && <span style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>-{disc}%</span>}
                      {p.is_featured && !disc && <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(11,11,11,0.8)', border: '1px solid rgba(200,169,107,0.4)', color: '#C8A96B', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 50 }}>✦ Featured</span>}
                    </div>
                  </Link>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>{p.stores?.store_name || 'VEYRA'}</p>
                    <Link href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontSize: '0.8rem', color: '#fff', marginBottom: 5, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</p>
                    </Link>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>₦{Number(p.price).toLocaleString()}</span>
                        {p.compare_price && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginLeft: 5 }}>₦{Number(p.compare_price).toLocaleString()}</span>}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#C8A96B' }}>★ {p.rating || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => addToCart(p)}
                        style={{ flex: 1, padding: '7px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.73rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <ShoppingCart size={11} /> Add to Cart
                      </button>
                      <button onClick={() => toggleWishlist(p.id)}
                        style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: wishlist.includes(p.id) ? '#ef4444' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Heart size={12} fill={wishlist.includes(p.id) ? '#ef4444' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`* { -webkit-tap-highlight-color: transparent; } ::-webkit-scrollbar{width:0;height:0;}`}</style>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505', paddingTop: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 32, height: 32, border: '2px solid rgba(200,169,107,0.3)', borderTopColor: '#C8A96B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>}>
      <Content />
    </Suspense>
  );
}
