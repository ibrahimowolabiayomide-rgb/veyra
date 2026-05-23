import Link from 'next/link';
export const metadata = { title: 'About VEYRA' };

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-[70px]" style={{ background: '#050505' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0d0020 100%)',
        padding: '6rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label justify-center">Our Story</div>
          <h1 className="font-display text-5xl font-light mb-4">About VEYRA</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            We are building the future of fashion commerce in Africa — where artificial intelligence meets luxury style.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Mission */}
        <div className="glass rounded-2xl p-8">
          <h2 className="font-display text-3xl font-light mb-4 text-gold">Our Mission</h2>
          <p className="text-muted leading-relaxed text-base">
            VEYRA was founded with a simple but powerful belief — that every Nigerian deserves access to world-class fashion, and every talented fashion creator deserves a world-class platform to sell their work.
          </p>
          <p className="text-muted leading-relaxed text-base mt-4">
            We combine cutting-edge artificial intelligence with a deep understanding of African fashion culture to create a marketplace that is not just functional, but truly inspiring. From traditional Ankara prints to modern streetwear, from luxury Agbada sets to minimalist accessories — VEYRA is where all of fashion lives.
          </p>
        </div>

        {/* Values */}
        <div>
          <h2 className="font-display text-3xl font-light mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '✦', title: 'Intelligence', desc: 'We use AI not as a gimmick, but as a genuine tool to help shoppers find what they love and sellers grow their businesses.' },
              { icon: '◈', title: 'Authenticity', desc: 'Every seller on VEYRA is verified. Every product is reviewed. We protect buyers and reward honest sellers.' },
              { icon: '⬡', title: 'Empowerment', desc: 'We believe in empowering African creators. Our platform gives independent fashion designers the tools of enterprise.' },
            ].map(v => (
              <div key={v.title} className="glass rounded-2xl p-6">
                <div className="text-2xl text-gold mb-3">{v.icon}</div>
                <h3 className="text-base font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="glass rounded-2xl p-8">
          <h2 className="font-display text-3xl font-light mb-8 text-center">VEYRA by Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['12K+','Active Shoppers'],['3K+','Verified Sellers'],['98K+','Products'],['₦2B+','In Sales']].map(([num, label]) => (
              <div key={label}>
                <div className="font-display text-3xl font-light text-gold">{num}</div>
                <div className="text-xs text-muted uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="font-display text-3xl font-light mb-4">Built in Lagos</h2>
          <p className="text-muted leading-relaxed">
            VEYRA is proudly built in Lagos, Nigeria — Africa's fashion capital. Our team of designers, engineers, and fashion enthusiasts are passionate about creating a platform that truly represents the richness of African fashion culture while meeting global standards of technology and design.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="font-display text-3xl font-light mb-4">Join the Movement</h2>
          <p className="text-muted mb-8">Be part of Africa's most advanced fashion marketplace.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/auth/signup" className="btn-primary">Create Account</Link>
            <Link href="/auth/signup?seller=true" className="btn-secondary">Become a Seller</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
