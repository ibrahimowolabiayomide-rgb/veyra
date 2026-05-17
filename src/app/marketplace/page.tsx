'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Heart, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Streetwear', 'Luxury', 'Sneakers', 'Native Wear', 'Hoodies', 'Women', 'Accessories'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular', 'Top Rated'];

// Mock products for demo (replace with Supabase query)
const MOCK_PRODUCTS = Array.from({ length: 16 }, (_, i) => ({
  id: String(i + 1),
  name: ['Oversized Black Hoodie', 'Cargo Street Pants', 'Premium Agbada Set', 'Chunky Sneakers', 'Silk Wrap Dress', 'Leather Crossbody Bag', 'Gold Chain Necklace', 'Vintage Denim Jacket', 'Ankara Bomber Jacket', 'Ribbed Knit Coord Set', 'Platform Chelsea Boots', 'Structured Tote Bag', 'Wide Leg Trousers', 'Oversized Polo Shirt', 'Embroidered Caftan', 'Statement Sunglasses'][i],
  price: [12500, 8999, 45000, 18750, 22000, 15000, 8500, 19000, 28000, 16500, 24000, 13000, 9500, 7200, 38000, 6000][i],
  seller: ['NaijaDrip Co.', 'UrbanThreads', 'Lagos Luxe', 'KickZone NG', 'SheStyles', 'Crafted NG', 'Glam Lagos', 'RetroVibes', 'AfroPunk', 'StyleMate', 'StepUp', 'CarryOn', 'TrendHaus', 'StreetEdit', 'KingsWear', 'ShadeShop'][i],
  rating: [4.9, 4.7, 5.0, 4.8, 4.6, 4.5, 4.3, 4.7, 4.8, 4.5, 4.6, 4.4, 4.7, 4.3, 4.9, 4.2][i],
  category: ['Streetwear', 'Streetwear', 'Luxury', 'Sneakers', 'Women', 'Accessories', 'Accessories', 'Streetwear', 'Streetwear', 'Women', 'Sneakers', 'Accessories', 'Women', 'Streetwear', 'Native Wear', 'Accessories'][i],
  tag: ['Trending', 'New', 'Premium', '🔥 Hot', null, null, null, 'Vintage', null, 'New', null, null, null, null, 'Premium', null][i],
  accent: ['#8B5CF6', '#3B82F6', '#C8A96B', '#4ade80', '#f472b6', '#a78bfa', '#fbbf24', '#60a5fa', '#f97316', '#a78bfa', '#34d399', '#f472b6', '#818cf8', '#4ade80', '#C8A96B', '#60a5fa'][i],
  reviews: Math.floor(Math.random() * 200 + 20),
}));

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ? searchParams.get('category')!.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All');
  const [sort, setSort] = useState('Newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesQuery = !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.seller.toLowerCase().includes(query.toLowerCase());
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchesCategory && matchesQuery && matchesPrice;
  }).sort((a, b) => {
    if (sort === 'Price: Low to High') return a.price - b.price;
    if (sort === 'Price: High to Low') return b.price - a.price;
    if (sort === 'Top Rated') return b.rating - a.rating;
    return 0;
  });

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    toast.success(wishlist.includes(id) ? 'Removed from wishlist' : 'Added to wishlist ♡');
  };

  const handleAddToCart = (p: typeof MOCK_PRODUCTS[0]) => {
    addItem({ id: `${p.id}-default`, productId: p.id, name: p.name, price: p.price, image: '', sellerName: p.seller });
    toast.success(`${p.name} added to cart!`);
  };

  return (
    <div className="min-h-screen pt-[70px] max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="section-label">Marketplace</div>
        <h1 className="font-display text-3xl md:text-4xl font-light">Discover fashion</h1>
      </div>

      {/* Search + Sort bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search "black hoodie", "sneakers under ₦15k"…'
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-gold/40 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-muted outline-none focus:border-white/20 cursor-pointer">
          {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${showFilters ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-[#111] border-white/10 text-muted hover:text-white'}`}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-5 mb-6 border border-white/10">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Price Range</p>
              <div className="flex items-center gap-3 text-sm">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                  placeholder="Min"
                />
                <span className="text-muted">—</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 bg-[#0B0B0B] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                  placeholder="Max"
                />
                <span className="text-muted text-xs">₦</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Rating</p>
              <div className="flex gap-2">
                {[4, 4.5, 5].map((r) => (
                  <button key={r} className="glass rounded-full px-3 py-1.5 text-xs text-muted hover:text-gold transition-colors">
                    ★ {r}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              activeCategory === cat
                ? 'bg-gold/10 border border-gold/30 text-gold'
                : 'glass text-muted hover:text-white'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted mb-6">
        {filtered.length} products {query && `for "${query}"`}
        {activeCategory !== 'All' && ` in ${activeCategory}`}
      </p>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <p className="text-4xl mb-4">◈</p>
          <p className="text-lg mb-2">No products found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="group bg-[#111] border border-white/07 hover:border-white/15 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5">
              {/* Visual */}
              <Link href={`/product/${p.id}`} className="block">
                <div className="relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.accent}15, ${p.accent}08)` }}>
                  <span className="font-display text-6xl font-light opacity-[0.07]" style={{ color: p.accent }}>
                    {p.name.charAt(0)}
                  </span>
                  {p.tag && (
                    <span className="absolute top-2.5 left-2.5 bg-[#0B0B0B]/80 border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] backdrop-blur-sm" style={{ color: p.accent }}>
                      {p.tag}
                    </span>
                  )}
                </div>
              </Link>
              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(p.id)}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-[#0B0B0B]/80 border border-white/10 rounded-full flex items-center justify-center text-xs backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                style={{ color: wishlist.includes(p.id) ? '#ef4444' : '#fff', position: 'static', marginTop: '-28px', marginRight: '6px', float: 'right', display: 'flex' }}>
                {wishlist.includes(p.id) ? '♥' : '♡'}
              </button>
              {/* Info */}
              <div className="p-3">
                <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">{p.seller}</p>
                <Link href={`/product/${p.id}`}>
                  <p className="text-sm font-medium text-white leading-snug mb-2 hover:text-gold transition-colors">{p.name}</p>
                </Link>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">₦{p.price.toLocaleString()}</span>
                  <span className="text-[11px] text-gold">★ {p.rating} ({p.reviews})</span>
                </div>
                <button
                  onClick={() => handleAddToCart(p)}
                  className="w-full py-1.5 rounded-xl border border-white/10 text-xs text-muted hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-all">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-[70px] flex items-center justify-center text-muted">Loading marketplace…</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
