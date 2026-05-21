'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, MessageCircle, ShoppingBag, CreditCard, Store, Shield, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

const FAQS = [
  { category: 'Orders', icon: ShoppingBag, questions: [
    { q: 'How do I track my order?', a: 'Go to Profile → Orders to see all your orders and their current status. You\'ll also receive email notifications at every step.' },
    { q: 'Can I cancel my order?', a: 'You can cancel an order within 1 hour of placing it, as long as the seller hasn\'t started processing it. Go to Profile → Orders → Cancel Order.' },
    { q: 'What if I receive the wrong item?', a: 'Contact the seller directly through messaging, or open a support ticket. You\'re protected by VEYRA Buyer Protection.' },
    { q: 'How long does delivery take?', a: 'Delivery within Lagos takes 1-3 days. Other states take 3-7 days. International orders take 7-21 days.' },
  ]},
  { category: 'Payments', icon: CreditCard, questions: [
    { q: 'What payment methods are accepted?', a: 'We accept all debit/credit cards via Paystack and Flutterwave. Bank transfers are also supported.' },
    { q: 'Is my payment information secure?', a: 'Yes. We never store your card details. All payments are processed by Paystack and Flutterwave, which are PCI-DSS compliant.' },
    { q: 'How do I get a refund?', a: 'Refunds are processed within 3-5 business days back to your original payment method. Contact support to initiate a refund.' },
    { q: 'Can I pay on delivery?', a: 'Pay on delivery is available for orders within Lagos. Select this option at checkout.' },
  ]},
  { category: 'Selling', icon: Store, questions: [
    { q: 'How do I become a seller?', a: 'Sign up and select "Seller" during registration. Set up your store profile and start uploading products. All products are reviewed before going live.' },
    { q: 'How does VEYRA charge sellers?', a: 'VEYRA takes a 10% commission on each sale. There are no monthly fees or listing fees.' },
    { q: 'When do I get paid?', a: 'Payouts are processed every Monday for the previous week\'s settled orders. Minimum payout is ₦5,000.' },
    { q: 'How do I use the AI Description Generator?', a: 'In your Seller Dashboard, go to Add Product and click "Generate with AI". Enter your product name and the AI will write a premium description.' },
  ]},
  { category: 'Account & Security', icon: Shield, questions: [
    { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. A reset link will be sent to your email within 2 minutes.' },
    { q: 'How do I verify my account?', a: 'Verified badges are given to confirmed sellers and notable creators. Apply through your profile settings.' },
    { q: 'How do I report a fake product?', a: 'On any product page, scroll down and click "Report this listing". Our team reviews all reports within 24 hours.' },
    { q: 'Can I have multiple accounts?', a: 'No. Each person is allowed one account. Multiple accounts may be permanently banned.' },
  ]},
];

const CATEGORIES = [
  { icon: '📦', label: 'Orders & Delivery', href: '#orders' },
  { icon: '💳', label: 'Payments & Refunds', href: '#payments' },
  { icon: '🏪', label: 'Selling on VEYRA', href: '#selling' },
  { icon: '🔐', label: 'Account & Security', href: '#account' },
  { icon: '✦', label: 'AI Stylist Help', href: '#ai' },
  { icon: '📱', label: 'App & Technical', href: '#technical' },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [ticket, setTicket] = useState({ name: '', email: '', subject: '', category: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const filtered = FAQS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      !search || q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.message.trim()) { toast.error('Please describe your issue'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('support_tickets').insert(ticket);
    if (error) toast.error('Failed to submit. Please try again.');
    else {
      toast.success('Support ticket submitted! We\'ll respond within 24 hours. ✦');
      setTicket({ name: '', email: '', subject: '', category: 'general', message: '' });
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors";

  return (
    <div className="min-h-screen pt-[70px]">
      {/* Hero */}
      <div className="bg-[#111] border-b border-white/07 px-6 py-16 text-center">
        <div className="section-label justify-center">Support</div>
        <h1 className="font-display text-4xl font-light mb-4">How can we help?</h1>
        <p className="text-muted mb-8">Find answers, contact support, or browse our guides</p>
        <div className="relative max-w-lg mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full bg-[#0B0B0B] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-muted outline-none focus:border-gold/40 transition-colors" />
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
        {/* Categories */}
        {!search && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
            {CATEGORIES.map(cat => (
              <a key={cat.label} href={cat.href}
                className="glass rounded-xl p-4 text-center hover:border-gold/25 transition-all group">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <p className="text-xs text-muted group-hover:text-white transition-colors leading-tight">{cat.label}</p>
              </a>
            ))}
          </div>
        )}

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-light mb-8">Frequently Asked Questions</h2>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p className="text-2xl mb-2">◈</p>
              <p>No results for "{search}"</p>
              <p className="text-sm mt-1">Try different keywords or contact support below</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map(cat => (
                <div key={cat.category} id={cat.category.toLowerCase()}>
                  <div className="flex items-center gap-2 mb-4">
                    <cat.icon size={16} className="text-gold" />
                    <h3 className="text-base font-medium">{cat.category}</h3>
                  </div>
                  <div className="space-y-2">
                    {cat.questions.map(faq => (
                      <div key={faq.q} className="glass rounded-xl overflow-hidden">
                        <button onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/02 transition-colors">
                          <span className="text-sm font-medium pr-4">{faq.q}</span>
                          <ChevronDown size={16} className={`text-muted flex-shrink-0 transition-transform ${openFaq === faq.q ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaq === faq.q && (
                          <div className="px-4 pb-4 text-sm text-muted leading-relaxed border-t border-white/07 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl font-light mb-3">Still need help?</h2>
            <p className="text-muted mb-6 text-sm leading-relaxed">Our support team is available Monday–Friday, 9AM–6PM (WAT). We typically respond within 2–4 hours.</p>
            <div className="space-y-3">
              <a href="mailto:support@veyra.ng" className="glass rounded-xl p-4 flex items-center gap-3 hover:border-white/20 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold">✉</div>
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-muted">support@veyra.ng · 2-4 hour response</p>
                </div>
              </a>
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">💬</div>
                <div>
                  <p className="text-sm font-medium">WhatsApp Support</p>
                  <p className="text-xs text-muted">+234 800 VEYRA NG · Business hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support form */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-base font-medium mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-gold" /> Submit a Ticket
            </h3>
            <form onSubmit={submitTicket} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={ticket.name} onChange={e => setTicket({...ticket, name: e.target.value})} placeholder="Your name" className={inputClass} />
                <input type="email" value={ticket.email} onChange={e => setTicket({...ticket, email: e.target.value})} placeholder="Email" required className={inputClass} />
              </div>
              <select value={ticket.category} onChange={e => setTicket({...ticket, category: e.target.value})} className={inputClass + ' cursor-pointer'}>
                <option value="general">General Question</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment Problem</option>
                <option value="account">Account Help</option>
                <option value="seller">Seller Support</option>
                <option value="report">Report a Problem</option>
              </select>
              <input value={ticket.subject} onChange={e => setTicket({...ticket, subject: e.target.value})} placeholder="Subject" required className={inputClass} />
              <textarea value={ticket.message} onChange={e => setTicket({...ticket, message: e.target.value})} placeholder="Describe your issue in detail..." required className={inputClass + ' resize-none h-28'} />
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
