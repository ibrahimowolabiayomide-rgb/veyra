'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, MapPin, CreditCard, Shield, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { createClient } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [address, setAddress] = useState({
    full_name: '', phone: '', address: '', city: '', state: 'Lagos', country: 'Nigeria',
  });

  const subtotal = total();
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 20000 ? 0 : 1500;
  const finalTotal = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'VEYRA10') { setCouponApplied(true); toast.success('10% discount applied! ✦'); }
    else toast.error('Invalid coupon code');
  };

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error('Please login to checkout'); router.push('/auth/login?redirect=/checkout'); return; }
    if (!address.full_name || !address.phone || !address.address || !address.city) {
      toast.error('Please fill in all delivery details'); return;
    }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, size: i.size, color: i.color })),
          shipping_address: address,
          coupon: couponApplied ? coupon.toUpperCase() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Demo mode
      if (data.authorization_url.includes('demo=true')) {
        clearCart();
        toast.success('Order placed successfully! ✦');
        router.push(`/checkout/success?order=${data.order_id}`);
        return;
      }

      // Redirect to Paystack
      clearCart();
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Try again.');
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors";

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-[70px] flex flex-col items-center justify-center text-center px-6">
        <ShoppingBag size={48} className="text-muted/30 mb-4" />
        <h2 className="font-display text-3xl font-light mb-3">Your cart is empty</h2>
        <button onClick={() => router.push('/marketplace')} className="btn-primary mt-4">Browse Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[70px] max-w-[1200px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-8">
        <div className="section-label">Checkout</div>
        <h1 className="font-display text-3xl font-light">Complete your order</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Delivery + Payment */}
        <div className="lg:col-span-2 space-y-5">
          {/* Delivery address */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-gold" /> Delivery Address
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input value={address.full_name} onChange={e => setAddress({...address, full_name: e.target.value})} placeholder="Full name *" className={inputClass} />
              <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="Phone number *" className={inputClass} type="tel" />
              <input value={address.address} onChange={e => setAddress({...address, address: e.target.value})} placeholder="Street address *" className={inputClass + ' md:col-span-2'} />
              <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City *" className={inputClass} />
              <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className={inputClass + ' cursor-pointer'}>
                {['Lagos','Abuja','Kano','Port Harcourt','Ibadan','Kaduna','Benin City','Enugu','Onitsha','Aba','Warri','Jos','Ilorin','Ogun','Osun','Oyo','Ondo','Edo'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Delivery info */}
          <div className="glass rounded-2xl p-4 flex items-start gap-3">
            <Truck size={16} className="text-gold mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Delivery Information</p>
              <p className="text-muted text-xs leading-relaxed">Lagos: 1-3 business days. Other states: 3-7 days. International: 7-21 days. {subtotal < 20000 ? `Add ₦${(20000 - subtotal).toLocaleString()} more for free delivery.` : '✦ You qualify for FREE delivery!'}</p>
            </div>
          </div>

          {/* Payment method */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <CreditCard size={15} className="text-gold" /> Payment Method
            </h2>
            <div className="space-y-2">
              {[
                { id: 'paystack', label: 'Pay with Paystack', desc: 'Debit card, bank transfer, USSD', badge: 'Recommended' },
                { id: 'flutterwave', label: 'Pay with Flutterwave', desc: 'Card, bank, mobile money' },
              ].map(method => (
                <label key={method.id} className="flex items-center gap-3 glass rounded-xl p-4 cursor-pointer hover:border-white/20 transition-all">
                  <input type="radio" name="payment" value={method.id} defaultChecked={method.id === 'paystack'} className="accent-gold" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-muted">{method.desc}</p>
                  </div>
                  {method.badge && <span className="text-[10px] bg-gold/15 text-gold border border-gold/25 rounded-full px-2 py-0.5">{method.badge}</span>}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="glass rounded-2xl p-5 sticky top-24">
            <h3 className="text-base font-medium mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-white/05 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                    {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="font-display opacity-30">{item.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted">{[item.size, item.color].filter(Boolean).join(' · ')} × {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon (VEYRA10)" disabled={couponApplied}
                className="flex-1 bg-[#0B0B0B] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted outline-none focus:border-gold/40 disabled:opacity-50 transition-colors" />
              <button onClick={applyCoupon} disabled={couponApplied || !coupon} className="btn-primary !py-2 !px-3 text-xs disabled:opacity-50">
                {couponApplied ? '✓' : 'Apply'}
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-sm border-t border-white/07 pt-4 mb-4">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span className="text-white">₦{subtotal.toLocaleString()}</span></div>
              {couponApplied && <div className="flex justify-between text-green-400"><span>Discount (10%)</span><span>-₦{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-muted"><span>Shipping</span><span className={shipping === 0 ? 'text-green-400' : 'text-white'}>{shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}</span></div>
              <div className="flex justify-between font-semibold text-base border-t border-white/07 pt-2.5">
                <span>Total</span><span className="text-gold">₦{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full justify-center text-sm disabled:opacity-60">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-[#0B0B0B]/50 border-t-[#0B0B0B] rounded-full animate-spin" /> Processing...</span>
                : <><Shield size={14} /> Pay ₦{finalTotal.toLocaleString()} Securely</>}
            </button>

            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted">
              <span>🔒 SSL Secured</span><span>✦ Buyer Protected</span><span>💳 All Cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
