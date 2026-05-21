import Link from 'next/link';

export const metadata = { title: 'Terms & Conditions | VEYRA' };

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-[70px] max-w-3xl mx-auto px-6 py-16">
      <div className="section-label">Legal</div>
      <h1 className="font-display text-4xl font-light mb-2">Terms & Conditions</h1>
      <p className="text-muted text-sm mb-10">Last updated: January 1, 2026</p>

      {[
        { title: '1. Acceptance of Terms', content: 'By accessing or using VEYRA ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform. VEYRA is operated by Veyra Technologies Ltd, a company registered in Nigeria.' },
        { title: '2. User Accounts', content: 'You must be at least 18 years old to create an account. You are responsible for maintaining the security of your account credentials. Each person may only maintain one account. VEYRA reserves the right to suspend or terminate accounts that violate these terms.' },
        { title: '3. Buying & Selling', content: 'VEYRA is a marketplace connecting buyers and sellers. We are not responsible for the quality, safety, or legality of products listed by third-party sellers. All transactions are directly between buyers and sellers, with VEYRA acting as an intermediary payment processor.' },
        { title: '4. Prohibited Activities', content: 'Users may not: list counterfeit or stolen goods, engage in fraud or misleading conduct, harass or abuse other users, manipulate product reviews or ratings, use automated tools to scrape data, or violate any applicable laws or regulations.' },
        { title: '5. Fees & Payments', content: 'VEYRA charges sellers a 10% commission on completed sales. Buyers pay the listed price plus any applicable shipping fees. All prices are in Nigerian Naira (₦) unless otherwise stated. Payment processing fees may apply.' },
        { title: '6. Refunds & Returns', content: 'Buyers may request returns within 7 days of delivery for items that are significantly different from their description. Sellers are responsible for honoring return requests. VEYRA Buyer Protection covers eligible purchases up to ₦500,000.' },
        { title: '7. Intellectual Property', content: 'All content on VEYRA, including logos, designs, and software, is owned by Veyra Technologies Ltd. Sellers retain ownership of their product images and descriptions but grant VEYRA a license to display them on the Platform.' },
        { title: '8. Privacy', content: 'Your use of VEYRA is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your information as described in our Privacy Policy.' },
        { title: '9. Limitation of Liability', content: 'VEYRA is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability to you shall not exceed the amount you paid to VEYRA in the 12 months preceding the claim.' },
        { title: '10. Changes to Terms', content: 'VEYRA may modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of the Platform after changes constitutes acceptance of the updated Terms.' },
        { title: '11. Contact', content: 'For questions about these Terms, contact us at legal@veyra.ng or write to: Veyra Technologies Ltd, Lagos, Nigeria.' },
      ].map(section => (
        <div key={section.title} className="mb-8">
          <h2 className="text-base font-semibold mb-2 text-gold">{section.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{section.content}</p>
        </div>
      ))}

      <div className="mt-12 pt-6 border-t border-white/07 flex gap-4 text-sm">
        <Link href="/privacy" className="text-gold hover:text-gold-light transition-colors">Privacy Policy</Link>
        <Link href="/refund-policy" className="text-gold hover:text-gold-light transition-colors">Refund Policy</Link>
        <Link href="/help" className="text-gold hover:text-gold-light transition-colors">Help Center</Link>
      </div>
    </div>
  );
}
