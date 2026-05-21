import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111] border-t border-white/07 px-6 lg:px-16 py-12">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-5 gap-8 mb-10">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-light tracking-[0.25em] mb-3">
            VE<span className="text-gold">Y</span>RA
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-[240px] mb-4">
            Fashion Meets Intelligence. Nigeria's most advanced AI-powered fashion marketplace.
          </p>
          <div className="flex gap-2">
            {['Twitter', 'Instagram', 'TikTok'].map(s => (
              <a key={s} href="#" className="text-xs glass rounded-full px-3 py-1.5 text-muted hover:text-white transition-colors">{s}</a>
            ))}
          </div>
        </div>
        {[
          { title: 'Platform', links: [
            { label: 'Marketplace', href: '/marketplace' },
            { label: 'AI Stylist', href: '/ai-stylist' },
            { label: 'Trending', href: '/marketplace?sort=popular' },
            { label: 'New Arrivals', href: '/marketplace?sort=newest' },
          ]},
          { title: 'Sellers', links: [
            { label: 'Start Selling', href: '/auth/signup?seller=true' },
            { label: 'Seller Dashboard', href: '/dashboard/seller' },
            { label: 'Seller Guide', href: '/help' },
          ]},
          { title: 'Support', links: [
            { label: 'Help Center', href: '/help' },
            { label: 'Contact Us', href: '/help#contact' },
            { label: 'Refund Policy', href: '/refund-policy' },
            { label: 'Report Issue', href: '/help' },
          ]},
          { title: 'Legal', links: [
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Policy', href: '/privacy' },
          ]},
        ].map(col => (
          <div key={col.title}>
            <p className="text-[11px] uppercase tracking-widest text-muted mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/07 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/25">
        <span>© 2026 Veyra Technologies Ltd. All rights reserved. · Lagos, Nigeria</span>
        <span className="font-display text-base tracking-[0.25em] text-white/10">VEYRA</span>
      </div>
    </footer>
  );
}
