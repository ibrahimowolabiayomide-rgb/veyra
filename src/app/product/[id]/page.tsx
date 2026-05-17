'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';

// Mock product data — replace with Supabase fetch using params.id
const PRODUCT = {
  id: '1', name: 'Oversized Black Tech Hoodie', price: 12500, comparePrice: 18000,
  seller: 'NaijaDrip Co.', sellerRating: 4.9, sellerSales: 1240,
  rating: 4.9, reviews: 128, sold: 345,
  category: 'Streetwear', description: 'Premium heavyweight cotton-blend oversized hoodie with dropped shoulders and minimal branding. Perfect for layering or wearing solo. Features a kangaroo pocket, ribbed cuffs, and a relaxed silhouette designed for the modern streetwear aesthetic.',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'Charcoal', 'Cream'],
  tags: ['oversized', 'hoodie', 'streetwear', 'minimal'],
  features: ['100% Heavyweight Cotton', 'Dropped Shoulders', 'Kangaroo Pocket', 'Pre-shrunk fabric', 'Unisex fit'],
  accent: '#8B5CF6',
};

const REVIEWS = [
  { name: 'Adaeze N.', rating: 5, comment: 'Absolutely love this! The quality is premium and the oversized fit is perfect. Will be ordering more colors.', date: '2 weeks ago', verified: true },
  { name: 'Kola O.', rating: 5, comment: 'Best hoodie I\'ve bought on Veyra. Delivery was fast and the packaging was clean.', date: '1 month ago', verified: true },
  { name: 'Temi E.', rating: 4, comment: 'Great quality but ran a bit large. Recommend sizing down if you want a true oversized but not too baggy look.', date: '1 month ago', verified: true },
];

const RELATED = [
  { id: '2', name: 'Cargo Street Pants', price: 8999, accent: '#3B82F6' },
  { id: '3', name: 'Chunky Sneakers', price: 18750, accent: '#4ade80' },
  { id: '4', name: 'Mini Crossbody Bag', price: 7500, accent: '#C8A96B' },
  { id: '5', name: 'Ribbed Knit Beanie', price: 3500, accent: '#f472b6' },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutfit, setAiOutfit] = useState('');
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    addItem({ id: `${PRODUCT.id}-${selectedSize}-${selectedColor}`, productId: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, image: '', size: selectedSize, color: selectedColor, quantity: qty, sellerName: PRODUCT.seller });
    toast.success('Added to cart! 🛍️');
  };

  const generateOutfit = async () => {
    setAiLoading(true);
    setAiOutfit('');
    try {
      const res = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate a complete outfit combination featuring the ${PRODUCT.name}. Give me 3 other pieces that would work perfectly with it.`, history: [] }),
      });
      const data = await res.json();
      setAiOutfit(data.message);
    } catch {
      setAiOutfit('Try pairing this hoodie with cargo pants, chunky sneakers, and a minimal crossbody bag for a complete streetwear look. ✦');
    }
    setAiLoading(false);
  };

  const discount = Math.round((1 - PRODUCT.price / PRODUCT.comparePrice) * 100);

  return (
    <div className="min-h-screen pt-[70px] max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
        <span>/</span>
        <Link href={`/marketplace?category=${PRODUCT.category.toLowerCase()}`} className="hover:text-white transition-colors">{PRODUCT.category}</Link>
        <span>/</span>
        <span className="text-white truncate max-w-[200px]">{PRODUCT.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left: image gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PRODUCT.accent}15, ${PRODUCT.accent}08)` }}>
            <span className="font-display text-[12rem] font-light opacity-[0.06]" style={{ color: PRODUCT.accent }}>
              {PRODUCT.name.charAt(0)}
            </span>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button onClick={() => { setWishlisted(!wishlisted); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡'); }}
                className={`w-10 h-10 rounded-full glass flex items-center justify-center text-base transition-all ${wishlisted ? 'text-red-400 bg-red-400/10' : 'text-muted hover:text-white'}`}>
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>
            {/* Discount badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </div>
          </div>
          {/* Thumbnail row */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all ${n === 1 ? 'border-2 border-gold/50' : 'border border-white/10 hover:border-white/25'}`}
                style={{ background: `${PRODUCT.accent}0a` }}>
                <span className="font-display text-2xl font-light opacity-10" style={{ color: PRODUCT.accent }}>
                  {PRODUCT.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: product info */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{PRODUCT.category}</p>
          <h1 className="font-display text-3xl md:text-4xl font-light mb-3">{PRODUCT.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={13} className={s <= Math.round(PRODUCT.rating) ? 'text-gold fill-gold' : 'text-muted'} />
              ))}
            </div>
            <span className="text-sm text-muted">{PRODUCT.rating} ({PRODUCT.reviews} reviews)</span>
            <span className="text-xs text-muted">· {PRODUCT.sold} sold</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-semibold">₦{PRODUCT.price.toLocaleString()}</span>
            <span className="text-muted line-through text-lg">₦{PRODUCT.comparePrice.toLocaleString()}</span>
            <span className="text-green-400 text-sm">You save ₦{(PRODUCT.comparePrice - PRODUCT.price).toLocaleString()}</span>
          </div>

          {/* Colors */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-widest text-muted mb-2.5">Color: <span className="text-white normal-case tracking-normal">{selectedColor}</span></p>
            <div className="flex gap-2">
              {PRODUCT.colors.map((c) => (
                <button key={c} onClick={() => setSelectedColor(c)}
                  className={`px-3.5 py-1.5 rounded-full text-sm transition-all ${selectedColor === c ? 'bg-gold/15 border-gold/40 border text-gold' : 'glass text-muted hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted mb-2.5">Size {!selectedSize && <span className="text-red-400 normal-case tracking-normal">— please select</span>}</p>
            <div className="flex flex-wrap gap-2">
              {PRODUCT.sizes.map((s) => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`w-12 h-10 rounded-xl text-sm font-medium transition-all ${selectedSize === s ? 'bg-gold text-[#0B0B0B]' : 'glass text-muted hover:text-white hover:border-white/25'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex gap-3 mb-5">
            <div className="glass rounded-xl flex items-center">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 flex items-center justify-center text-muted hover:text-white text-lg transition-colors">−</button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-11 flex items-center justify-center text-muted hover:text-white text-lg transition-colors">+</button>
            </div>
            <button onClick={handleAddToCart}
              className="btn-primary flex-1 justify-center text-base">
              <ShoppingCart size={17} /> Add to Cart
            </button>
          </div>

          <button className="btn-secondary w-full justify-center mb-6 text-sm">Buy Now — Secure Checkout</button>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="glass rounded-xl p-3 flex items-center gap-2.5 text-xs text-muted">
              <Truck size={16} className="text-gold flex-shrink-0" /> Free delivery on orders ₦20k+
            </div>
            <div className="glass rounded-xl p-3 flex items-center gap-2.5 text-xs text-muted">
              <Shield size={16} className="text-gold flex-shrink-0" /> Buyer protection guaranteed
            </div>
          </div>

          {/* Seller info */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-medium text-purple-300">
                {PRODUCT.seller.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{PRODUCT.seller}</p>
                <p className="text-xs text-muted">★ {PRODUCT.sellerRating} · {PRODUCT.sellerSales.toLocaleString()} sales</p>
              </div>
            </div>
            <Link href="#" className="btn-ghost !py-1.5 !px-3 text-xs">Visit Store</Link>
          </div>
        </div>
      </div>

      {/* AI Outfit Generator */}
      <div className="glass rounded-2xl p-6 mb-10 border border-purple-500/15"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-sm font-medium">AI Outfit Generator</span>
            </div>
            <p className="text-xs text-muted">Let AI build a complete outfit around this piece</p>
          </div>
          <button onClick={generateOutfit} disabled={aiLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-all">
            {aiLoading ? <><span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" /> Generating…</> : <><Sparkles size={13} /> Generate Outfit</>}
          </button>
        </div>
        {aiOutfit && (
          <div className="bg-white/03 rounded-xl p-4 text-sm text-white/80 leading-relaxed border border-white/07">
            {aiOutfit}
          </div>
        )}
      </div>

      {/* Tabs: Details / Reviews */}
      <div className="mb-6 flex gap-1 border-b border-white/07">
        {(['details', 'reviews'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-white'}`}>
            {tab} {tab === 'reviews' && `(${PRODUCT.reviews})`}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h3 className="text-base font-medium mb-3">Description</h3>
            <p className="text-sm text-muted leading-relaxed">{PRODUCT.description}</p>
          </div>
          <div>
            <h3 className="text-base font-medium mb-3">Features</h3>
            <ul className="space-y-2">
              {PRODUCT.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-gold text-xs">✦</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="mb-16">
          <div className="grid md:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium text-purple-300">
                      {r.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{r.name}</span>
                  </div>
                  {r.verified && <span className="text-[10px] text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">Verified</span>}
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={11} className={s <= r.rating ? 'text-gold fill-gold' : 'text-muted'} />)}
                </div>
                <p className="text-xs text-muted/80 leading-relaxed mb-1.5 italic">"{r.comment}"</p>
                <p className="text-[10px] text-muted/50">{r.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related products */}
      <div>
        <div className="section-label mb-4">Complete The Look</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RELATED.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}
              className="glass hover:border-white/20 rounded-xl overflow-hidden transition-all hover:-translate-y-1 group">
              <div className="w-full aspect-square flex items-center justify-center" style={{ background: `${p.accent}10` }}>
                <span className="font-display text-4xl font-light opacity-10" style={{ color: p.accent }}>{p.name.charAt(0)}</span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white mb-1 group-hover:text-gold transition-colors">{p.name}</p>
                <p className="text-sm font-semibold">₦{p.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
