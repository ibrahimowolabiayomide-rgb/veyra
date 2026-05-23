import Link from 'next/link';
export const metadata = { title: 'Seller Policy | VEYRA' };

export default function SellerPolicyPage() {
  return (
    <div className="min-h-screen pt-[70px]" style={{ background: '#050505' }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="section-label">Legal</div>
        <h1 className="font-display text-4xl font-light mb-2">Seller Policy</h1>
        <p className="text-muted text-sm mb-10">Last updated: January 1, 2026</p>

        {[
          { title: 'Eligibility', content: 'To sell on VEYRA, you must be at least 18 years old, have a valid Nigerian bank account, provide accurate business or personal information, and agree to these Seller Terms and our general Terms & Conditions.' },
          { title: 'Seller Fees', content: 'VEYRA charges a 10% commission on each completed sale. There are no monthly fees, listing fees, or setup costs. The commission is automatically deducted before your payout. This covers payment processing, buyer protection, platform maintenance, and customer support.' },
          { title: 'Product Listings', content: 'All products must be accurately described with real photos. Prohibited items include: counterfeit goods, stolen merchandise, illegal items, adult content, and products that violate any applicable law. VEYRA reserves the right to remove any listing at any time.' },
          { title: 'Pricing', content: 'Sellers set their own prices. Prices must be in Nigerian Naira (₦). You may not artificially inflate prices. Price changes after a buyer has placed an order are not permitted. VEYRA may run platform-wide promotions and you may be invited to participate.' },
          { title: 'Order Fulfillment', content: 'You must fulfill orders within 3 business days of confirmation. Provide accurate tracking information when available. Communicate proactively with buyers about any delays. Repeated fulfillment failures will result in account suspension.' },
          { title: 'Returns & Refunds', content: 'You must honor VEYRA\'s standard 7-day return policy for items significantly different from their description. For refund disputes, VEYRA\'s decision is final. Repeated return complaints will affect your seller rating.' },
          { title: 'Payouts', content: 'Payouts are processed every Monday for settled orders from the previous week. Minimum payout threshold is ₦5,000. Payouts are made via bank transfer to your registered Nigerian bank account. Processing takes 1-3 business days after release.' },
          { title: 'Seller Ratings', content: 'Your seller rating is calculated from buyer reviews, fulfillment speed, response time, and dispute rate. Sellers with ratings below 3.5 stars after 30 reviews will be reviewed. Consistent poor performance may result in account suspension.' },
          { title: 'AI Tools', content: 'VEYRA provides AI tools to help you write product descriptions, analyze trends, and optimize your listings. These tools are provided as-is and you remain responsible for the accuracy of all content you publish.' },
          { title: 'Account Suspension', content: 'VEYRA may suspend or terminate your seller account for: policy violations, high dispute rates, fraudulent activity, or any behavior that damages the VEYRA community. Pending payouts will be held for 90 days to cover any outstanding claims.' },
          { title: 'Contact', content: 'For seller support, contact sellers@veyra.ng or open a ticket in the Help Center. Our seller support team is available Monday-Friday, 9AM-6PM WAT.' },
        ].map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-base font-semibold mb-2 text-gold">{s.title}</h2>
            <p className="text-sm text-muted leading-relaxed">{s.content}</p>
          </div>
        ))}

        <div className="mt-12 pt-6 border-t border-white/07 flex gap-4 text-sm flex-wrap">
          <Link href="/terms" className="text-gold hover:text-gold-light">Terms & Conditions</Link>
          <Link href="/community-guidelines" className="text-gold hover:text-gold-light">Community Guidelines</Link>
          <Link href="/help" className="text-gold hover:text-gold-light">Help Center</Link>
        </div>
      </div>
    </div>
  );
}
