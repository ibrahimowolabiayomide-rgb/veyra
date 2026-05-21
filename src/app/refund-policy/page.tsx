import Link from 'next/link';
export const metadata = { title: 'Refund Policy | VEYRA' };

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen pt-[70px] max-w-3xl mx-auto px-6 py-16">
      <div className="section-label">Legal</div>
      <h1 className="font-display text-4xl font-light mb-2">Refund & Return Policy</h1>
      <p className="text-muted text-sm mb-10">Last updated: January 1, 2026</p>
      {[
        { title: 'Our Commitment', content: 'VEYRA is committed to ensuring every purchase meets your expectations. Our buyer protection policy covers all eligible purchases made on the platform.' },
        { title: 'Return Window', content: 'You may request a return within 7 days of confirmed delivery for most items. Items must be in their original condition — unworn, unwashed, with all tags attached and original packaging intact.' },
        { title: 'Eligible Returns', content: 'Returns are accepted for: items significantly different from the description, wrong items delivered, damaged or defective items on arrival, items that never arrived (after 21 days). Buyer remorse returns are at the seller\'s discretion.' },
        { title: 'Non-Returnable Items', content: 'The following cannot be returned: underwear and swimwear (hygiene reasons), custom/personalized items, digital products, items marked "Final Sale", perishable goods.' },
        { title: 'Return Process', content: '1. Go to Profile → Orders → Select order → Click "Return Item". 2. Select return reason and upload photos. 3. Wait for seller approval (1-2 business days). 4. Ship item back with the provided return label. 5. Refund processed within 3-5 business days after seller receives item.' },
        { title: 'Refund Timeline', content: 'Paystack/card payments: 3-5 business days. Bank transfer: 5-7 business days. Wallet credit (instant): available for faster resolution. Original shipping fees are non-refundable unless the item was defective or wrong.' },
        { title: 'VEYRA Buyer Protection', content: 'If a seller refuses a valid return or you cannot reach a resolution, VEYRA will step in. Contact support@veyra.ng with your order number and evidence. We cover up to ₦500,000 per claim.' },
        { title: 'Seller Disputes', content: 'Sellers who repeatedly violate return policies face account suspension. VEYRA reserves the right to process refunds on behalf of unresponsive sellers and recover the amount from their pending payouts.' },
        { title: 'Contact', content: 'For return or refund support, contact returns@veyra.ng or open a support ticket in the Help Center. Include your order number and clear photos of the issue.' },
      ].map(s => (
        <div key={s.title} className="mb-8">
          <h2 className="text-base font-semibold mb-2 text-gold">{s.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{s.content}</p>
        </div>
      ))}
      <div className="mt-12 pt-6 border-t border-white/07 flex gap-4 text-sm">
        <Link href="/help" className="text-gold hover:text-gold-light">Help Center</Link>
        <Link href="/terms" className="text-gold hover:text-gold-light">Terms & Conditions</Link>
        <Link href="/privacy" className="text-gold hover:text-gold-light">Privacy Policy</Link>
      </div>
    </div>
  );
}
