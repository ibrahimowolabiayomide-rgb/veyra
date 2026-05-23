import Link from 'next/link';
export const metadata = { title: 'Community Guidelines | VEYRA' };

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen pt-[70px]" style={{ background: '#050505' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="section-label">Legal</div>
        <h1 className="font-display text-4xl font-light mb-2">Community Guidelines</h1>
        <p className="text-muted text-sm mb-10">Last updated: January 1, 2026</p>

        <div className="glass rounded-2xl p-6 mb-8 border border-gold/15">
          <p className="text-sm text-gold/80 leading-relaxed">
            VEYRA is a fashion community built on creativity, respect, and authenticity. These guidelines exist to make VEYRA a safe, inspiring, and fair place for everyone — buyers, sellers, and creators alike.
          </p>
        </div>

        {[
          { title: '1. Be Authentic', content: 'Only sell products you genuinely own or have the right to sell. Do not impersonate other sellers, brands, or public figures. Use real product photos that accurately represent your items. Misleading listings will result in immediate removal and account suspension.' },
          { title: '2. Respect Everyone', content: 'VEYRA is a diverse community. Harassment, hate speech, discrimination based on race, gender, religion, or any other characteristic will not be tolerated. Treat every user — buyer, seller, or creator — with respect and professionalism.' },
          { title: '3. No Counterfeit Products', content: 'Listing fake, counterfeit, or replica luxury goods is strictly forbidden and illegal. Sellers found listing counterfeit items will be permanently banned and may face legal consequences. Our AI moderation system actively scans for fake products.' },
          { title: '4. Honest Listings', content: 'Product descriptions must accurately represent the item. Size, condition, material, and price must be truthful. Hidden fees or bait-and-switch tactics will result in account termination. Photos must be real images of the actual product being sold.' },
          { title: '5. Safe Transactions', content: 'All payments must go through VEYRA\'s official checkout system. Off-platform transactions are not protected by Buyer Protection. Never share your banking details directly with other users. Report any suspicious payment requests immediately.' },
          { title: '6. Privacy & Safety', content: 'Do not share other users\' personal information without consent. Do not use VEYRA to solicit or collect personal information from minors. Respect others\' privacy in reviews and comments.' },
          { title: '7. Content Standards', content: 'Product images must be appropriate for all ages. Explicit, offensive, or inappropriate content is not allowed. Fashion products should be displayed tastefully and professionally.' },
          { title: '8. No Spam', content: 'Do not send unsolicited messages, post duplicate listings, or engage in any activity that degrades the quality of the VEYRA experience for other users.' },
          { title: '9. Reporting Violations', content: 'If you see content that violates these guidelines, report it immediately using the "Report" button on any listing or profile. Our moderation team reviews all reports within 24 hours. False reporting is also a violation.' },
          { title: '10. Consequences', content: 'Violations may result in: content removal, temporary suspension, permanent ban, and in serious cases, legal action. We reserve the right to remove any content and suspend any account that violates these guidelines at our sole discretion.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-base font-semibold mb-2 text-gold">{s.title}</h2>
            <p className="text-sm text-muted leading-relaxed">{s.content}</p>
          </div>
        ))}

        <div className="mt-12 pt-6 border-t border-white/07 flex gap-4 text-sm flex-wrap">
          <Link href="/terms" className="text-gold hover:text-gold-light">Terms & Conditions</Link>
          <Link href="/privacy" className="text-gold hover:text-gold-light">Privacy Policy</Link>
          <Link href="/seller-policy" className="text-gold hover:text-gold-light">Seller Policy</Link>
          <Link href="/help" className="text-gold hover:text-gold-light">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
