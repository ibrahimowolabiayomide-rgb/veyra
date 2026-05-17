'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Star, TrendingUp, ShoppingBag, Zap } from 'lucide-react';

const TRENDING_PRODUCTS = [
  { id: '1', name: 'Oversized Tech Hoodie', price: 12500, seller: 'NaijaDrip Co.', rating: 4.9, tag: 'Trending', bg: 'from-purple-900/40 to-purple-800/20', accent: '#8B5CF6' },
  { id: '2', name: 'Cargo Street Pants', price: 8999, seller: 'UrbanThreads', rating: 4.7, tag: 'New', bg: 'from-blue-900/40 to-blue-800/20', accent: '#3B82F6' },
  { id: '3', name: 'Premium Agbada Set', price: 45000, seller: 'Lagos Luxe', rating: 5.0, tag: 'Premium', bg: 'from-amber-900/40 to-amber-800/20', accent: '#C8A96B' },
  { id: '4', name: 'Chunky Platform Sneakers', price: 18750, seller: 'KickZone NG', rating: 4.8, tag: '🔥 Hot', bg: 'from-green-900/40 to-green-800/20', accent: '#4ade80' },
];

const STATS = [
  { num: '12K+', label: 'Active Shoppers' },
  { num: '3K+', label: 'Verified Sellers' },
  { num: '98K+', label: 'Products' },
  { num: '4.9★', label: 'Platform Rating' },
  { num: '₦2B+', label: 'In Sales' },
];

const CATEGORIES = [
  { name: 'Streetwear', icon: '🧢', slug: 'streetwear' },
  { name: 'Luxury', icon: '✦', slug: 'luxury' },
  { name: 'Sneakers', icon: '👟', slug: 'sneakers' },
  { name: 'Native Wear', icon: '👘', slug: 'native-wear' },
  { name: 'Hoodies', icon: '🧥', slug: 'hoodies' },
  { name: 'Women', icon: '👗', slug: 'women' },
  { name: 'Accessories', icon: '💍', slug: 'accessories' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach((el) => {
      (el as HTMLElement).style.opacity = '0';
      (el as HTMLElement).style.transform = 'translateY(24px)';
      (el as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-6 lg:px-16 pt-[70px] overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(59,130,246,0.06) 0%, transparent 50%)' }} />
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center py-20">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 text-xs text-purple-300 uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              AI-Powered Fashion Platform
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05] mb-6">
              Fashion Meets<br />
              <span className="italic" style={{ color: 'transparent', WebkitTextStroke: '1px #C8A96B' }}>
                Intelligence.
              </span>
            </h1>

            <p className="text-muted text-lg font-light max-w-md mb-10 leading-relaxed">
              Discover AI-curated fashion from top creators across Nigeria. Your personal stylist, powered by intelligence.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/marketplace" className="btn-primary text-base">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link href="/auth/signup?seller=true" className="btn-secondary text-base">
                <Sparkles size={16} className="text-gold" /> Become a Seller
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-6 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Star size={14} className="text-gold" /> 4.9 rated</span>
              <span className="flex items-center gap-1.5"><ShoppingBag size={14} className="text-gold" /> 98K+ products</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-gold" /> AI-powered</span>
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="hidden lg:flex flex-col gap-4 items-end">
            {[
              { label: 'Trending Now', value: 'Oversized Streetwear', sub: '↑ 42% this week', style: { animation: 'float 4s ease-in-out infinite' } },
              { label: 'AI Match', value: '98.4% Style Score', sub: '✦ Powered by AI', badge: true, style: { animation: 'float 4s 1.3s ease-in-out infinite' } },
              { label: 'New Arrivals', value: '240+ Items Today', sub: 'From 180 verified sellers', style: { animation: 'float 4s 2.6s ease-in-out infinite' } },
            ].map((card, i) => (
              <div key={i} className="glass rounded-2xl p-4 w-[240px]" style={card.style}>
                <p className="text-[11px] uppercase tracking-widest text-muted mb-1">{card.label}</p>
                <p className="font-medium text-white">{card.value}</p>
                {card.badge ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-500/15 border border-purple-500/25 rounded-full px-2.5 py-0.5">
                    {card.sub}
                  </span>
                ) : (
                  <p className="text-[12px] text-gold mt-0.5">{card.sub}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-[#111] border-y border-white/07 py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-wrap justify-around gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-semibold text-white">{s.num}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI STYLIST PROMO ── */}
      <section className="px-6 lg:px-16 py-24 max-w-[1400px] mx-auto" data-animate>
        <div className="relative rounded-3xl overflow-hidden border border-white/08 p-8 md:p-14"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)' }}>
          <div className="max-w-xl">
            <div className="section-label">AI Intelligence</div>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4">
              Your personal<br /><span className="italic text-purple-400">AI stylist</span>
            </h2>
            <p className="text-muted mb-6 leading-relaxed">
              Describe what you want in plain English. Our AI curates complete outfits tailored to your taste, body, and budget in seconds.
            </p>
            <Link href="/ai-stylist" className="btn-primary">
              Try AI Stylist <Sparkles size={15} />
            </Link>
          </div>
          <div className="absolute right-8 bottom-8 hidden md:block opacity-60 text-8xl font-display font-light text-purple-500/20 select-none">
            ✦ AI
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="px-6 lg:px-16 pb-12 max-w-[1400px] mx-auto">
        <div className="section-label" data-animate>Shop by Category</div>
        <div className="flex flex-wrap gap-3 mt-2">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/marketplace?category=${cat.slug}`}
              className="glass hover:border-gold/30 hover:text-gold transition-all rounded-full px-4 py-2 text-sm text-muted flex items-center gap-2">
              <span>{cat.icon}</span> {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ── */}
      <section className="px-6 lg:px-16 py-12 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-8" data-animate>
          <div>
            <div className="section-label">Marketplace</div>
            <h2 className="font-display text-3xl md:text-4xl font-light">Trending now</h2>
          </div>
          <Link href="/marketplace" className="btn-secondary !py-2 !px-4 text-sm hidden md:flex">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-animate>
          {TRENDING_PRODUCTS.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}
              className="group bg-[#111] border border-white/07 hover:border-white/15 rounded-2xl overflow-hidden transition-all hover:-translate-y-1.5"
              style={{ boxShadow: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5)`)  }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
              {/* Product visual */}
              <div className={`relative w-full aspect-[3/4] bg-gradient-to-br ${p.bg} flex items-center justify-center overflow-hidden`}>
                <span className="font-display text-5xl font-light opacity-10" style={{ color: p.accent }}>
                  {p.name.split(' ')[0].charAt(0)}
                </span>
                <span className="absolute top-2.5 left-2.5 bg-[#0B0B0B]/80 border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] backdrop-blur-sm" style={{ color: p.accent }}>
                  {p.tag}
                </span>
                <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 bg-[#0B0B0B]/80 border border-white/10 rounded-full flex items-center justify-center text-xs backdrop-blur-sm hover:bg-white/10">
                    ♡
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-[11px] text-muted uppercase tracking-wider mb-0.5">{p.seller}</p>
                <p className="text-sm font-medium text-white leading-snug mb-2">{p.name}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">₦{p.price.toLocaleString()}</span>
                  <span className="text-[11px] text-gold">★ {p.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 md:hidden">
          <Link href="/marketplace" className="btn-secondary text-sm">View all products</Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#111] border-y border-white/07 px-6 lg:px-16 py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16" data-animate>
            <div className="section-label justify-center">How It Works</div>
            <h2 className="font-display text-3xl md:text-5xl font-light">Fashion intelligence<br />in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', icon: '◈', title: 'Tell the AI your style', desc: 'Describe your vibe, occasion, or budget in plain language. The AI understands context like a real stylist.' },
              { num: '02', icon: '✦', title: 'AI curates your look', desc: 'Our model scans thousands of verified products and builds a complete, cohesive outfit in seconds.' },
              { num: '03', icon: '⬡', title: 'Shop with confidence', desc: 'Add to cart, pay securely via Paystack or Flutterwave, and receive your look at the door.' },
            ].map((step) => (
              <div key={step.num} className="glass rounded-2xl p-6 hover:border-white/15 transition-all group" data-animate>
                <div className="font-display text-5xl font-light text-white/05 mb-4 group-hover:text-white/08 transition-colors">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center text-lg mb-4">
                  {step.icon}
                </div>
                <h3 className="text-base font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section className="px-6 lg:px-16 py-24 max-w-[1400px] mx-auto text-center" data-animate>
        <div className="section-label justify-center">For Sellers</div>
        <h2 className="font-display text-4xl md:text-5xl font-light mb-4">
          Sell smarter with<br />
          <span className="italic" style={{ color: '#C8A96B' }}>AI-powered tools</span>
        </h2>
        <p className="text-muted max-w-md mx-auto mb-10 leading-relaxed">
          Launch your brand on Veyra and reach thousands of style-conscious shoppers. AI writes your product descriptions. Analytics track your growth.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link href="/auth/signup?seller=true" className="btn-primary">
            Start Selling Today <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard/seller" className="btn-secondary">
            See Seller Dashboard
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '✦', title: 'AI Descriptions', desc: 'One-click premium product copy' },
            { icon: '◈', title: 'Live Analytics', desc: 'Stripe-style revenue dashboard' },
            { icon: '⬡', title: 'Instant Payouts', desc: 'Paystack & Flutterwave' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-xl p-4 text-left">
              <div className="text-xl mb-2">{f.icon}</div>
              <div className="text-sm font-medium mb-0.5">{f.title}</div>
              <div className="text-xs text-muted">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 lg:px-16 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,169,107,0.07) 0%, transparent 70%)' }} />
        <div className="relative max-w-xl mx-auto">
          <div className="section-label justify-center">The Future of Fashion</div>
          <h2 className="font-display text-4xl md:text-6xl font-light mb-4">
            Ready to wear<br />
            <span className="italic" style={{ color: '#C8A96B' }}>intelligence?</span>
          </h2>
          <p className="text-muted mb-8 leading-relaxed">
            Join thousands of style-forward Nigerians discovering fashion the smart way.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link href="/auth/signup" className="btn-primary text-base">
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base">
              Explore Marketplace
            </Link>
          </div>
          <p className="text-xs text-muted/50">No credit card required · Free to join · AI tools included</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] border-t border-white/07 px-6 lg:px-16 py-12">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="font-display text-2xl font-light tracking-[0.25em] mb-3">
              VE<span className="text-gold">Y</span>RA
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-[220px]">
              Fashion Meets Intelligence. Nigeria's most advanced AI-powered fashion marketplace.
            </p>
            <div className="flex gap-2 mt-4">
              {['Twitter', 'Instagram', 'TikTok'].map((s) => (
                <a key={s} href="#" className="text-xs glass rounded-full px-3 py-1.5 text-muted hover:text-white transition-colors">{s}</a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: ['Marketplace', 'AI Stylist', 'Trending', 'New Arrivals'] },
            { title: 'Sellers', links: ['Start Selling', 'Seller Dashboard', 'Pricing', 'Seller Stories'] },
            { title: 'Company', links: ['About Veyra', 'Careers', 'Privacy Policy', 'Terms'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[11px] uppercase tracking-widest text-muted mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/07 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/25">
          <span>© 2026 Veyra Technologies Ltd. All rights reserved.</span>
          <span className="font-display text-base tracking-[0.25em] text-white/10">VEYRA</span>
        </div>
      </footer>
    </div>
  );
}
