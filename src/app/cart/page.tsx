'use client';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const discount = couponApplied ? Math.round(total() * 0.1) : 0;
  const shipping = total() >= 20000 ? 0 : 1500;
  const finalTotal = total() - discount + shipping;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'VEYRA10') {
      setCouponApplied(true);
      toast.success('Coupon applied! 10% off ✦');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  if (items.length === 0) return (
    <div className="min-h-screen pt-[70px] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6 opacity-20 font-display">◈</div>
      <h2 className="font-display text-3xl font-light mb-3">Your cart is empty</h2>
      <p className="text-muted mb-8">Discover fashion and add items to your cart</p>
      <Link href="/marketplace" className="btn-primary">Browse Marketplace <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-[70px] max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
      <div className="mb-8">
        <div className="section-label">Shopping Cart</div>
        <h1 className="font-display text-3xl font-light">{items.length} item{items.length !== 1 && 's'}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 flex gap-4 items-start">
              {/* Product thumbnail */}
              <div className="w-20 h-20 rounded-xl bg-purple-500/10 flex-shrink-0 flex items-center justify-center">
                <span className="font-display text-2xl font-light opacity-20 text-purple-400">{item.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-0.5">{item.sellerName}</p>
                <p className="text-sm font-medium text-white mb-1 truncate">{item.name}</p>
                {(item.size || item.color) && (
                  <p className="text-xs text-muted mb-2">
                    {item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Color: ${item.color}`}
                  </p>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-base font-semibold">₦{item.price.toLocaleString()}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0 glass rounded-xl">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors">
                        <Minus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-muted hover:text-white transition-colors">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button onClick={() => { removeItem(item.id); toast.success('Item removed'); }}
                      className="text-muted hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted mt-1">Subtotal: <span className="text-white">₦{(item.price * item.quantity).toLocaleString()}</span></p>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted">
              <Tag size={14} className="text-gold" /> Have a coupon code?
            </div>
            <div className="flex gap-2">
              <input
                value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Enter code (try VEYRA10)"
                disabled={couponApplied}
                className="flex-1 bg-[#0B0B0B] border border-white/10 focus:border-gold/40 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted outline-none transition-colors disabled:opacity-50"
              />
              <button onClick={applyCoupon} disabled={couponApplied || !coupon}
                className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50">
                {couponApplied ? '✓ Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-5 sticky top-24">
            <h3 className="text-base font-medium mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.length} items)</span>
                <span className="text-white">₦{total().toLocaleString()}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-green-400">
                  <span>Discount (VEYRA10)</span>
                  <span>-₦{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                  {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
                </span>
              </div>
              {total() < 20000 && (
                <p className="text-xs text-muted">Add ₦{(20000 - total()).toLocaleString()} more for free delivery</p>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-gold">₦{finalTotal.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full justify-center text-base mb-3">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/marketplace" className="btn-secondary w-full justify-center text-sm">
              Continue Shopping
            </Link>
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-muted">
              <span>🔒 Secure Checkout</span>
              <span>✦ Buyer Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
