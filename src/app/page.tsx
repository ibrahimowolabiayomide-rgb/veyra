'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Star, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import SplashScreen from '@/components/SplashScreen';

const HERO_SLIDES = [
  {
    title: 'Discover Style\nBeyond Fashion',
    sub: 'AI-curated looks from Nigeria\'s top creators',
    bg: 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0d0020 100%)',
    accent: '#8B5CF6',
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  },
  {
    title: 'Luxury\nMeets Street',
    sub: 'Premium fashion for the bold and the beautiful',
    bg: 'linear-gradient(135deg, #0a0a00 0%, #1a1500 50%, #0d0d00 100%)',
    accent: '#C8A96B',
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  },
  {
    title: 'Native Wear\nReimagined',
    sub: 'Traditional styles with a modern edge',
    bg: 'linear-gradient(135deg, #000a15 0%, #001530 50%, #000d20 100%)',
    accent: '#3B82F6',
    img: 'https://images.unsplash.com/photo-1594938298-ab3c1d7e1a34?w=800&q=80',
  },
];

const CATEGORIES = [
  { name: 'Streetwear', slug: 'streetwear', img: 'https://images.unsplash.com/photo-1556821074-0ebcbdef405d?w=400&q=80', color: '#8B5CF6' },
  { name: 'Luxury', slug: 'luxury', img: 'https://images.unsplash.com/photo-1548036361-0ef7b26e76e3?w=400&q=80', color: '#C8A96B' },
  { name: 'Sneakers', slug: 'sneakers', img: 'https://images.unsplash.com/photo-1542291526-ae9af0b1c8ab?w=400&q=80', color: '#4ade80' },
  { name: 'Native Wear', slug: 'native-wear', img: 'https://images.unsplash.com/photo-1594938298-ab3c1d7e1a34?w=400&q=80', color: '#f97316' },
  { name: 'Women', slug: 'women', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', color: '#f472b6' },
  { name: 'Accessories', slug: 'accessories', img: 'https://images.unsplash.com/photo-1611652849001-3ef864308929?w=400&q=80', color: '#60a5fa' },
];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    // Show splash only on first visit
    const seen = sessionStorage.getItem('veyra_splash_seen');
    if (!seen) { setShowSplash(true); sessionStorage.setItem('veyra_splash_seen', '1'); }
    fetchProducts();
    const interval = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, compare_price, thumbnail, images, rating, sold_count, is_featured, categories(name,slug), stores(store_name)')
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(32);

    const all = data || [];
    setProducts(all);
    setFeatured(all.filter((p: any) => p.is_featured).slice(0, 8));
    setTrending(all.sort((a: any, b: any) => b.sold_count - a.sold_count).slice(0, 10));
  };

  const scroll = (key: string, dir: 'left' | 'right') => {
    const el = scrollRefs.current[key];
    if (el) el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const slide = HERO_SLIDES[heroSlide];

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="min-h-screen" style={{ background: '#050505' }}>

        {/* ── CINEMATIC HERO ── */}
        <section style={{
          position: 'relative', height: '100vh', overflow: 'hidden',
          transition: 'background 1s ease',
          background: slide.bg,
        }}>
          {/* Background image */}
          <div style={{
            position: 'absolute', right: 0, top: 0,
            width: '55%', height: '100%',
            opacity: 0.35,
            transition: 'opacity 0.8s ease',
          }}>
            <img src={slide.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, ${slide.bg.split(',')[0].replace('linear-gradient(135deg, ', '')} 0%, transparent 60%)`,
            }} />
          </div>

          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 60% 60% at 30% 50%, ${slide.accent}18 0%, transparent 60%)`,
            transition: 'background 1s ease',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            height: '100%', padding: '0 6rem',
            paddingTop: 70,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${slide.accent}18`, border: `1px solid ${slide.accent}40`,
              borderRadius: 50, padding: '6px 16px',
              marginBottom: 24, width: 'fit-content',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accent, animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: slide.accent }}>
                AI-Powered Fashion
              </span>
            </div>

            <h1 style={{
              fontFamily: 'serif', fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              fontWeight: 300, lineHeight: 1.05, color: '#fff',
              marginBottom: 20,
              whiteSpace: 'pre-line',
              textShadow: '0 0 80px rgba(0,0,0,0.5)',
            }}>
              {slide.title}
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', marginBottom: 40, maxWidth: 480, lineHeight: 1.6 }}>
              {slide.sub}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/marketplace" style={{
                background: `linear-gradient(135deg, #C8A96B, #A8872A)`,
                color: '#0B0B0B', border: 'none',
                padding: '14px 32px', borderRadius: 50,
                fontSize: '0.9rem', fontWeight: 600,
                letterSpacing: '0.04em', cursor: 'pointer',
                textDecoration: 'none', display: 'inline-flex',
                alignItems: 'center', gap: 8,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(200,169,107,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link href="/ai-stylist" style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '14px 32px',
                borderRadius: 50, fontSize: '0.9rem',
                letterSpacing: '0.04em', cursor: 'pointer',
                textDecoration: 'none', display: 'inline-flex',
                alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Sparkles size={16} style={{ color: '#a78bfa' }} /> AI Stylist
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 64 }}>
              {[['12K+','Shoppers'],['98K+','Products'],['3K+','Sellers']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'serif', fontSize: '1.8rem', fontWeight: 600, color: '#fff', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide indicators */}
          <div style={{ position: 'absolute', bottom: 40, left: '6rem', display: 'flex', gap: 8, zIndex: 2 }}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setHeroSlide(i)}
                style={{
                  width: i === heroSlide ? 32 : 8, height: 8,
                  borderRadius: 4, border: 'none', cursor: 'pointer',
                  background: i === heroSlide ? slide.accent : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease', padding: 0,
                }} />
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{
            position: 'absolute', bottom: 40, right: '6rem', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            animation: 'float 2s ease-in-out infinite',
          }}>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>Scroll</span>
          </div>
        </section>

        {/* ── CATEGORIES — Netflix horizontal scroll ── */}
        <section style={{ padding: '5rem 0', background: '#050505' }}>
          <div style={{ padding: '0 4rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 1, background: '#C8A96B', display: 'inline-block' }} /> Browse by Style
              </div>
              <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 300, color: '#fff' }}>Shop Categories</h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 4rem 1rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/marketplace?category=${cat.slug}`}
                style={{
                  flexShrink: 0, width: 200, height: 280, borderRadius: 16,
                  overflow: 'hidden', position: 'relative', cursor: 'pointer',
                  textDecoration: 'none', display: 'block',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(to top, ${cat.color}90 0%, transparent 60%)`,
                }} />
                <div style={{
                  position: 'absolute', bottom: 16, left: 16,
                  color: '#fff', fontWeight: 600, fontSize: '0.95rem',
                }}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FEATURED DROPS — Netflix row ── */}
        {featured.length > 0 && (
          <ProductRow
            title="Featured Drops"
            label="Editor's Pick"
            products={featured}
            rowKey="featured"
            scrollRefs={scrollRefs}
            onScroll={scroll}
          />
        )}

        {/* ── AI STYLIST BANNER ── */}
        <section style={{
          margin: '2rem 4rem', padding: '4rem',
          borderRadius: 24, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 12 }}>✦ AI-Powered</div>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
              Your personal<br /><em style={{ color: '#a78bfa' }}>AI stylist</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 28, lineHeight: 1.7 }}>
              Describe what you want in plain English. Our AI builds complete outfits from thousands of verified products in seconds.
            </p>
            <Link href="/ai-stylist" style={{
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
              color: '#fff', border: 'none', padding: '12px 28px',
              borderRadius: 50, fontSize: '0.9rem', fontWeight: 500,
              cursor: 'pointer', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'opacity 0.2s',
            }}>
              <Sparkles size={15} /> Try AI Stylist
            </Link>
          </div>
        </section>

        {/* ── TRENDING NOW ── */}
        {trending.length > 0 && (
          <ProductRow
            title="Trending Now"
            label="Most Popular"
            products={trending}
            rowKey="trending"
            scrollRefs={scrollRefs}
            onScroll={scroll}
          />
        )}

        {/* ── ALL PRODUCTS ── */}
        {products.length > 0 && (
          <ProductRow
            title="New Arrivals"
            label="Just Dropped"
            products={products.slice(0, 12)}
            rowKey="new"
            scrollRefs={scrollRefs}
            onScroll={scroll}
          />
        )}

        {/* ── SELLER CTA ── */}
        <section style={{ padding: '6rem 4rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96B', marginBottom: 16 }}>For Sellers</div>
            <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 300, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
              Sell smarter with<br /><em style={{ color: '#C8A96B' }}>AI-powered tools</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 36, lineHeight: 1.7 }}>
              Launch your brand on VEYRA. AI writes your product descriptions. Analytics track your growth. Paystack handles your payments.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup?seller=true" style={{
                background: 'linear-gradient(135deg, #C8A96B, #A8872A)',
                color: '#0B0B0B', border: 'none', padding: '14px 32px',
                borderRadius: 50, fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Start Selling Today <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard/seller" style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', padding: '14px 32px', borderRadius: 50,
                fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none',
              }}>
                View Dashboard
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 48 }}>
              {[
                { icon: '✦', title: 'AI Descriptions', desc: 'One-click premium product copy' },
                { icon: '◈', title: 'Live Analytics', desc: 'Stripe-style revenue dashboard' },
                { icon: '⬡', title: 'Instant Payouts', desc: 'Via Paystack & Flutterwave' },
              ].map(f => (
                <div key={f.title} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '1.25rem', textAlign: 'left',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '4rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ fontFamily: 'serif', fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.3em', color: '#fff', marginBottom: 12 }}>
                VE<span style={{ color: '#C8A96B' }}>Y</span>RA
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, maxWidth: 220 }}>
                Fashion Meets Intelligence. Nigeria's most advanced AI-powered fashion marketplace.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                {['Twitter','Instagram','TikTok'].map(s => (
                  <a key={s} href="#" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 50, padding: '6px 14px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Shop', links: [['Marketplace','/marketplace'],['AI Stylist','/ai-stylist'],['Trending','/marketplace?sort=popular'],['New Arrivals','/marketplace?sort=newest']] },
              { title: 'Sell', links: [['Start Selling','/auth/signup?seller=true'],['Dashboard','/dashboard/seller'],['Seller Policy','/seller-policy'],['Seller Guide','/help']] },
              { title: 'Support', links: [['Help Center','/help'],['Contact Us','/help'],['Refund Policy','/refund-policy'],['Report Issue','/help']] },
              { title: 'Legal', links: [['Terms','/terms'],['Privacy','/privacy'],['Community','/community-guidelines'],['About VEYRA','/about']] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{col.title}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>© 2026 Veyra Technologies Ltd. All rights reserved. · Lagos, Nigeria</span>
            <span style={{ fontFamily: 'serif', fontSize: '1rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.08)' }}>VEYRA</span>
          </div>
        </footer>

        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          ::-webkit-scrollbar { width: 0; height: 0; }
        `}</style>
      </div>
    </>
  );
}

function ProductRow({ title, label, products, rowKey, scrollRefs, onScroll }: any) {
  return (
    <section style={{ padding: '3rem 0', background: '#050505' }}>
      <div style={{ padding: '0 4rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A96B', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 1, background: '#C8A96B', display: 'inline-block' }} /> {label}
          </div>
          <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', fontWeight: 300, color: '#fff' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onScroll(rowKey, 'left')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onScroll(rowKey, 'right')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={el => { scrollRefs.current[rowKey] = el; }}
        style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 4rem 1rem', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {products.map((p: any) => {
          const img = p.thumbnail || p.images?.[0];
          const discount = p.compare_price && p.compare_price > p.price ? Math.round((1 - p.price / p.compare_price) * 100) : null;
          return (
            <Link key={p.id} href={`/product/${p.id}`}
              style={{ flexShrink: 0, width: 220, textDecoration: 'none', scrollSnapAlign: 'start' }}
            >
              <div style={{
                background: '#111', borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#1a1a1a', overflow: 'hidden' }}>
                  {img ? (
                    <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                      onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
                      <span style={{ fontFamily: 'serif', fontSize: '3rem', opacity: 0.1, color: '#8B5CF6' }}>{p.name?.charAt(0)}</span>
                    </div>
                  )}
                  {discount && (
                    <span style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>
                      -{discount}%
                    </span>
                  )}
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {p.stores?.store_name || 'VEYRA'}
                  </p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff', marginBottom: 8, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {p.name}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>₦{Number(p.price).toLocaleString()}</span>
                    <span style={{ fontSize: '0.7rem', color: '#C8A96B' }}>★ {p.rating || '—'}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
