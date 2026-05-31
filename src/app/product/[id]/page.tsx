'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Bookmark, Share2, MessageCircle, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getProductImage, DEMO_PRODUCTS } from '@/lib/fashion-images';
import toast from 'react-hot-toast';

const GOLD = '#C8A96B';
const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'details' | 'reviews'>('details');

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);

    // Check if this is a demo product ID (starts with "demo-" or "smart-")
    if (id.startsWith('demo-') || id.startsWith('smart-')) {
      // Find in demo products array
      const demo = DEMO_PRODUCTS.find(d => d.id === id);
      if (demo) {
        const filled = {
          ...demo,
          thumbnail: getProductImage(null, demo.id, demo.category),
          images: [
            getProductImage(null, demo.id + '0', demo.category),
            getProductImage(null, demo.id + '1', demo.category),
            getProductImage(null, demo.id + '2', demo.category),
          ],
          description: `Premium ${demo.category} piece from ${demo.store}. Crafted with attention to detail and quality materials. Available for immediate purchase with fast delivery across Nigeria.`,
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Gold'],
          stores: { store_name: demo.store, store_slug: 'veyra-store' },
          seller_id: null,
        };
        setProduct(filled);
        loadRelated(demo.category);
      } else {
        // Demo ID not found — show related products instead of 404
        loadRelated('fashion');
        setNotFound(true);
      }
      setLoading(false);
      return;
    }

    // Real product — query database
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores(store_name, store_slug, logo_url, avg_rating, total_reviews),
          categories(name, slug)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Product not in DB — show graceful fallback
        setNotFound(true);
        loadRelated('fashion');
      } else {
        // Apply image fallback if DB has no image
        const withImage = {
          ...data,
          thumbnail: getProductImage(
            data.thumbnail || data.images?.[0],
            data.id,
            data.category || data.categories?.slug || ''
          ),
          stores: Array.isArray(data.stores) ? data.stores[0] : data.stores,
        };
        setProduct(withImage);
        loadRelated(data.category || data.categories?.slug || 'fashion');

        // Track view
        await supabase.from('products')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
      }
    } catch {
      setNotFound(true);
      loadRelated('fashion');
    }

    setLoading(false);
  };

  const loadRelated = async (cat: string) => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id,name,price,thumbnail,images,category')
        .ilike('category', `%${cat}%`)
        .neq('id', id)
        .eq('is_active', true)
        .limit(8);

      const items = (data || []).map((p: any) => ({
        ...p,
        thumbnail: getProductImage(p.thumbnail || p.images?.[0], p.id, p.category),
      }));

      // Pad with demo products if fewer than 4 real results
      if (items.length < 4) {
        const demo = DEMO_PRODUCTS
          .filter(d => d.id !== id)
          .slice(0, 8 - items.length)
          .map(d => ({ ...d, thumbnail: getProductImage(null, d.id, d.category) }));
        setRelated([...items, ...demo]);
      } else {
        setRelated(items);
      }
    } catch {
      setRelated(DEMO_PRODUCTS.slice(0, 6).map(d => ({ ...d, thumbnail: getProductImage(null, d.id, d.category) })));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if ((navigator as any).share) {
      await (navigator as any).share({ title: product?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const handleBuy = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(`/auth/login?redirect=/product/${id}`); return; }
    if (product?.isDemo) { toast.success('Sign up to purchase this item!'); router.push('/auth/signup'); return; }
    toast.success('Added to cart! ✦');
  };

  const handleMessage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(`/auth/login?redirect=/product/${id}`); return; }
    if (product?.seller_id) router.push(`/messages?seller=${product.seller_id}`);
    else toast.success('Contact seller via WhatsApp or Instagram');
  };

  const images = product?.images?.length > 0
    ? product.images
    : [product?.thumbnail || FALLBACK, getProductImage(null, id + '1', product?.category), getProductImage(null, id + '2', product?.category)];

  // ── Not found state ──
  if (!loading && notFound) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontFamily: 'serif', fontSize: '1rem', color: '#fff', fontWeight: 300, letterSpacing: '0.15em' }}>Product</span>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 1.5rem 1.5rem' }}>
        <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>◈</p>
        <h2 style={{ fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 300, color: '#fff', marginBottom: 8 }}>Product Unavailable</h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 24 }}>
          This product is no longer available or has been removed. Browse similar items below.
        </p>
        <Link href="/search" style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 50, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
          Browse Fashion
        </Link>
      </div>

      {/* Show related products anyway */}
      {related.length > 0 && (
        <div style={{ padding: '0 1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>You might like</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {related.slice(0, 6).map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none', background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ paddingTop: '110%', position: 'relative' }}>
                  <img src={p.thumbnail} alt={p.name} loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.src = FALLBACK; }} />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>₦{Number(p.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <style>{`*{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );

  // ── Loading skeleton ──
  if (loading) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ height: 52, background: 'rgba(10,10,10,0.97)' }} />
      <div style={{ paddingTop: '100%', background: 'linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '1rem' }}>
        {[80, 60, 40, 100, 50].map((w, i) => (
          <div key={i} style={{ height: 14, background: '#1a1a1a', borderRadius: 6, marginBottom: 10, width: `${w}%`, animation: 'shimmer 1.4s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}`}</style>
    </div>
  );

  if (!product) return null;

  const disc = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 90, height: 52, background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleShare} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
            <Share2 size={16} />
          </button>
          <button onClick={() => setSaved(!saved)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? GOLD : 'rgba(255,255,255,0.7)' }}>
            <Bookmark size={16} fill={saved ? GOLD : 'none'} />
          </button>
        </div>
      </div>

      {/* Image gallery */}
      <div style={{ position: 'relative', background: '#111' }}>
        <div style={{ paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={images[imgIndex] || FALLBACK}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
            onError={(e: any) => { e.target.src = FALLBACK; }}
          />
          {disc && (
            <span style={{ position: 'absolute', top: 14, left: 14, background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 50 }}>
              -{disc}% OFF
            </span>
          )}
          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: imgIndex === 0 ? 0.3 : 1 }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: imgIndex === images.length - 1 ? 0.3 : 1 }}>
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 6, padding: '8px 12px', overflowX: 'auto', scrollbarWidth: 'none', background: '#0a0a0a' }}>
            {images.map((img: string, i: number) => (
              <div key={i} onClick={() => setImgIndex(i)} style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: `2px solid ${imgIndex === i ? GOLD : 'transparent'}`, opacity: imgIndex === i ? 1 : 0.5, transition: 'all 0.2s' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e: any) => { e.target.src = FALLBACK; }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div style={{ padding: '1rem' }}>
        {/* Store */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Link href={`/seller/${product.stores?.store_slug || 'veyra'}`} style={{ fontSize: '0.78rem', color: GOLD, textDecoration: 'none', fontWeight: 500 }}>
            {product.stores?.store_name || 'VEYRA Store'} →
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={12} fill={GOLD} style={{ color: GOLD }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              {product.rating || product.stores?.avg_rating || '4.8'}
            </span>
          </div>
        </div>

        {/* Name */}
        <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>
          {product.name}
        </h1>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            ₦{Number(product.price).toLocaleString()}
          </span>
          {product.compare_price && (
            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>
              ₦{Number(product.compare_price).toLocaleString()}
            </span>
          )}
          {disc && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.1)', borderRadius: 50, padding: '3px 9px' }}>
              Save {disc}%
            </span>
          )}
        </div>

        {/* Like button */}
        <button onClick={() => setLiked(!liked)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: '0.82rem', padding: '0 0 16px', marginBottom: 0 }}>
          <Heart size={16} fill={liked ? '#ef4444' : 'none'} />
          {(product.like_count || 0) + (liked ? 1 : 0)} likes
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
          {[['details', 'Details'], ['reviews', 'Reviews']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k as any)} style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', color: tab === k ? '#fff' : 'rgba(255,255,255,0.35)', borderBottom: tab === k ? `2px solid ${GOLD}` : '2px solid transparent', marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div>
            {product.description && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 16 }}>
                {product.description}
              </p>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Sizes</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map((s: string) => (
                    <span key={s} style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <Star size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>No reviews yet</p>
            <p style={{ fontSize: '0.78rem' }}>Be the first to review this product</p>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ padding: '0 1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>You may also like</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {related.slice(0, 4).map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`} style={{ display: 'block', textDecoration: 'none', background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ paddingTop: '110%', position: 'relative' }}>
                  <img src={p.thumbnail} alt={p.name} loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => { e.target.src = FALLBACK; }} />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>₦{Number(p.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sticky buy bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 1rem', paddingBottom: 'calc(12px + env(safe-area-inset-bottom,0px))', display: 'flex', gap: 10 }}>
        <button onClick={handleMessage} style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
          <MessageCircle size={20} />
        </button>
        <button onClick={handleBuy} style={{ flex: 1, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ShoppingBag size={18} /> Buy Now — ₦{Number(product.price).toLocaleString()}
        </button>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
