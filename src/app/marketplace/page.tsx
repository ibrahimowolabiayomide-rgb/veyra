'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Heart, X, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';

const CATEGORIES = ['All','Streetwear','Luxury','Sneakers','Native Wear','Hoodies','Women','Accessories','Bags','Jewelry'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'liked', label: 'Most Liked' },
];

function ProductCard({ p, onWishlist, wishlisted, onCart }: any) {
  const img = p.thumbnail || p.images?.[0];
  return (
    <div className="group bg-[#111] border border-white/07 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      <Link href={`/product/${p.id}`} className="block">
        <div className="relative w-full aspect-[3/4] bg-[#1a1a1a] overflow-hidden">
          {img ? (
            <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/30 to-blue-900/20">
              <span className="font-display text-6xl font-light opacity-10 text-purple-300">{p.name?.charAt(0)}</span>
            </div>
          )}
          {p.compare_price && p.compare_price > p.price && (
            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{Math.round((1 - p.price/p.compare_price)*100)}%
            </span>
          )}
          {p.is_featured && (
            <span className="absolute top-2.5 left-2.5 bg-[#0B0B0B]/80 border border-gold/30 text-gold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">✦ Featured</span>
          )}
        </div>
      </Link>
      <button onClick={() => onWishlist(p.id)}
        className="absolute top-2.5 right-2.5 w-8 h-8 bg-[#0B0B0B]/80 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
        style={{ position: 'static', marginTop: '-34px', marginRight: '8px', float: 'right', display: 'flex' }}>
        <Heart size={13} className={wishlisted ? 'fill-red-400 text-red-400' : 'text-muted'} />
      </button>
      <div className="p-3">
        <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">{p.stores?.store_name || p.profiles?.username}</p>
        <Link href={`/product/${p.id}`}>
          <p className="text-sm font-medium text-white leading-snug mb-2 hover:text-gold transition-colors line-clamp-2">{p.name}</p>
        </Link>
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-semibold text-white">₦{Number(p.price).toLocaleString()}</span>
            {p.compare_price && <span className="text-muted text-xs line-through ml-1.5">₦{Number(p.compare_price).toLocaleString()}</span>}
          </div>
          <span className="text-[11px] text-gold">★ {p.rating || '—'} {p.review_count > 0 && `(${p.review_count})`}</span>
        </div>
        <button onClick={() => onCart(p)}
          className="w-full py-1.5 rounded-xl border border-white/10 text-xs text-muted hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const addItem = useCartStore(s => s.addItem);
  const supabase = createClient();

  useEffect(() => { fetchProducts(); }, [query, activeCategory, sort, page, priceRange]);
  useEffect(() => { fetchTrending(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=16&sort=${sort}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;
    if (activeCategory && activeCategory !== 'all') url += `&category=${encodeURIComponent(activeCategory.toLowerCase().replace(/ /g, '-'))}`;
    if (priceRange.min) url += `&minPrice=${priceRange.min}`;
    if (priceRange.max) url += `&maxPrice=${priceRange.max}`;

    try {
      // If there's a search query, use search API
      if (query) {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=products&limit=32`);
        const data = await res.json();
        setProducts(data.results?.products || []);
        setTotal(data.results?.products?.length || 0);
      } else {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch {
      // Fallback to direct Supabase query
      let q = supabase.from('products').select('*, stores(store_name, store_slug, is_verified), categories(name, slug)', { count: 'exact' }).eq('is_approved', true).eq('is_active', true);
      if (priceRange.min) q = q.gte('price', parseFloat(priceRange.min));
      if (priceRange.max) q = q.lte('price', parseFloat(priceRange.max));
      q = q.order('created_at', { ascending: false }).range(0, 31);
      const { data, count } = await q;
      setProducts(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  const fetchTrending = async () => {
    const res = await fetch('/api/search');
    const data = await res.json();
    setTrending(data.trending || []);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setPage(1);
  };

  const toggleWishlist = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to save items'); router.push('/auth/login'); return; }
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'bookmark', target_id: id }) });
    toast.success(wishlist.includes(id) ? 'Removed from saved' : 'Saved! ♡');
  };

  const handleAddToCart = (p: any) => {
    addItem({ id: `${p.id}-default`, productId: p.id, name: p.name, price: p.price, image: p.thumbnail || '', sellerName: p.stores?.store_name || '' });
    toast.success(`${p.name} added to cart!`);
  };

  return (
    <div className="min-h-screen pt-[70px] max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-8">
        <div className="section-label">Marketplace</div>
        <h1 className="font-display text-3xl md:text-4xl font-light">Discover fashion</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={inputValue} onChange={e => setInputValue(e.target.value)}
            placeholder='Search products, brands, styles...'
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-gold/40 transition-colors" />
          {inputValue && <button type="button" onClick={() => { setInputValue(''); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"><X size={15} /></button>}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-muted outline-none hidden md:block cursor-pointer">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${showFilters ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-[#111] border-white/10 text-muted hover:text-white'}`}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </form>

      {/* Trending searches */}
      {!query && trending.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <TrendingUp size={13} className="text-muted" />
          <span className="text-xs text-muted">Trending:</span>
          {trending.slice(0, 6).map((t: any) => (
            <button key={t.query} onClick={() => { setInputValue(t.query); setQuery(t.query); }}
              className="text-xs glass rounded-full px-3 py-1 text-muted hover:text-gold hover:border-gold/25 transition-all">
              {t.query}
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-5 mb-5 border border-white/10">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Min Price (₦)</p>
              <input type="number" value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                placeholder="0" className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-gold/40" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Max Price (₦)</p>
              <input type="number" value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                placeholder="Any" className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-gold/40" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Sort</p>
              <select value={sort} onChange={e => setSort(e.target.value)} className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setPriceRange({min:'',max:''}); setSort('newest'); }} className="mt-3 text-xs text-muted hover:text-white transition-colors">Clear filters</button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat === 'All' ? 'all' : cat); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${(activeCategory === 'all' && cat === 'All') || activeCategory === cat ? 'bg-gold/10 border border-gold/30 text-gold' : 'glass text-muted hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-5">
        {loading ? 'Loading...' : `${total} products${query ? ` for "${query}"` : ''}`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-[#111] rounded-2xl overflow-hidden">
              <div className="w-full aspect-[3/4] shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
                <div className="h-4 w-20 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4 opacity-20">◈</p>
          <p className="text-lg font-medium mb-2">No products found</p>
          <p className="text-sm text-muted mb-6">Try a different search or category</p>
          <button onClick={() => { setQuery(''); setInputValue(''); setActiveCategory('all'); }} className="btn-secondary text-sm">Clear search</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} p={p} wishlisted={wishlist.includes(p.id)} onWishlist={toggleWishlist} onCart={handleAddToCart} />
            ))}
          </div>
          {total > products.length && (
            <div className="text-center mt-10">
              <button onClick={() => setPage(p => p + 1)} className="btn-secondary">Load more products</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return <Suspense fallback={<div className="min-h-screen pt-[70px] flex items-center justify-center text-muted">Loading...</div>}><MarketplaceContent /></Suspense>;
}
