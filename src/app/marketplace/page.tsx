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
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const addItem = useCartStore(s => s.addItem);
  const supabase = createClient();

  useEffect(() => { fetchProducts(); }, [query, activeCategory, sort, minPrice, maxPrice]);
  useEffect(() => { fetchTrending(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('products')
        .select(`
          id, name, slug, price, compare_price, thumbnail, images,
          rating, review_count, sold_count, like_count, is_featured,
          sizes, colors, tags, stock,
          categories(name, slug),
          stores(store_name, store_slug, is_verified)
        `)
        .eq('is_approved', true)
        .eq('is_active', true);

      if (query) {
        q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (activeCategory && activeCategory !== 'all') {
        const catSlug = activeCategory.toLowerCase().replace(/ /g, '-');
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', catSlug)
          .single();
        if (cat) q = q.eq('category_id', cat.id);
      }

      if (minPrice) q = q.gte('price', parseFloat(minPrice));
      if (maxPrice) q = q.lte('price', parseFloat(maxPrice));

      switch (sort) {
        case 'price_asc': q = q.order('price', { ascending: true }); break;
        case 'price_desc': q = q.order('price', { ascending: false }); break;
        case 'popular': q = q.order('sold_count', { ascending: false }); break;
        case 'rating': q = q.order('rating', { ascending: false }); break;
        default: q = q.order('created_at', { ascending: false });
      }

      const { data, error } = await q.limit(32);
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchTrending = async () => {
    const { data } = await supabase
      .from('trending_searches')
      .select('query, count')
      .order('count', { ascending: false })
      .limit(8);
    setTrending(data || []);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  const toggleWishlist = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Login to save items'); router.push('/auth/login'); return; }
    if (wishlist.includes(id)) {
      await supabase.from('wishlists').delete().eq('user_id', session.user.id).eq('product_id', id);
      setWishlist(prev => prev.filter(i => i !== id));
      toast.success('Removed from wishlist');
    } else {
      await supabase.from('wishlists').insert({ user_id: session.user.id, product_id: id });
      setWishlist(prev => [...prev, id]);
      toast.success('Added to wishlist ♡');
    }
  };

  const handleAddToCart = (p: any) => {
    addItem({
      id: `${p.id}-default`,
      productId: p.id,
      name: p.name,
      price: p.price,
      image: p.thumbnail || p.images?.[0] || '',
      sellerName: p.stores?.store_name || '',
    });
    toast.success(`${p.name} added to cart!`);
  };

  return (
    <div className="min-h-screen pt-[70px] max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-8">
        <div className="section-label">Marketplace</div>
        <h1 className="font-display text-3xl md:text-4xl font-light">
          Discover fashion
        </h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search products, brands, styles..."
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-gold/40 transition-colors"
          />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(''); setQuery(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-muted outline-none hidden md:block cursor-pointer">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button type="button" onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${showFilters ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-[#111] border-white/10 text-muted hover:text-white'}`}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </form>

      {/* Trending */}
      {!query && trending.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <TrendingUp size={13} className="text-muted" />
          <span className="text-xs text-muted">Trending:</span>
          {trending.slice(0, 6).map((t: any) => (
            <button key={t.query}
              onClick={() => { setInputValue(t.query); setQuery(t.query); }}
              className="text-xs glass rounded-full px-3 py-1 text-muted hover:text-gold hover:border-gold/25 transition-all">
              {t.query}
            </button>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-5 mb-5 border border-white/10">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Min Price (₦)</p>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-gold/40" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Max Price (₦)</p>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-gold/40" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-2">Sort</p>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSort('newest'); }}
            className="mt-3 text-xs text-muted hover:text-white transition-colors">
            Clear filters
          </button>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setActiveCategory(cat === 'All' ? '' : cat)}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              (cat === 'All' && !activeCategory) || activeCategory === cat
                ? 'bg-gold/10 border border-gold/30 text-gold'
                : 'glass text-muted hover:text-white'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-muted mb-5">
        {loading ? 'Loading...' : `${products.length} products${query ? ` for "${query}"` : ''}`}
      </p>

      {/* Loading skeleton */}
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
          <button onClick={() => { setQuery(''); setInputValue(''); setActiveCategory(''); }}
            className="btn-secondary text-sm">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => {
            const img = p.thumbnail || p.images?.[0];
            const discount = p.compare_price && p.compare_price > p.price
              ? Math.round((1 - p.price / p.compare_price) * 100) : null;
            return (
              <div key={p.id}
                className="group bg-[#111] border border-white/07 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <Link href={`/product/${p.id}`} className="block">
                  <div className="relative w-full aspect-[3/4] bg-[#1a1a1a] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/10">
                        <span className="font-display text-6xl font-light opacity-10 text-purple-300">
                          {p.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    {discount && (
                      <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    {p.is_featured && !discount && (
                      <span className="absolute top-2.5 left-2.5 bg-[#0B0B0B]/80 border border-gold/30 text-gold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        ✦ Featured
                      </span>
                    )}
                  </div>
                </Link>

                {/* Wishlist button */}
                <div className="flex justify-end px-2 -mt-4 relative z-10">
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="w-8 h-8 bg-[#0B0B0B]/90 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                    <Heart size={13} className={wishlist.includes(p.id) ? 'fill-red-400 text-red-400' : 'text-muted'} />
                  </button>
                </div>

                <div className="p-3 pt-1">
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">
                    {p.stores?.store_name || 'VEYRA'}
                  </p>
                  <Link href={`/product/${p.id}`}>
                    <p className="text-sm font-medium text-white leading-snug mb-2 hover:text-gold transition-colors line-clamp-2">
                      {p.name}
                    </p>
                  </Link>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-white">₦{Number(p.price).toLocaleString()}</span>
                      {p.compare_price && (
                        <span className="text-muted text-xs line-through ml-1.5">
                          ₦{Number(p.compare_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gold">
                      ★ {p.rating || '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="w-full py-1.5 rounded-xl border border-white/10 text-xs text-muted hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all">
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-[70px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
