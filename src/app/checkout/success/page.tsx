'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [count, setCount] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    const r = setTimeout(() => window.location.href = '/profile?tab=orders', 5000);
    return () => { clearInterval(t); clearTimeout(r); };
  }, []);

  return (
    <div className="min-h-screen pt-[70px] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-400" />
        </div>
        <h1 className="font-display text-3xl font-light mb-3">Order Confirmed!</h1>
        <p className="text-muted mb-2">Your payment was successful. 🎉</p>
        {orderId && <p className="text-xs text-muted mb-8">Order ID: <span className="text-white font-mono">{orderId}</span></p>}
        <div className="glass rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-gold" />
            <div>
              <p className="text-sm font-medium">What happens next?</p>
              <p className="text-xs text-muted mt-1">The seller will confirm your order within 24 hours. You'll receive SMS and email updates at every step.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/profile?tab=orders" className="btn-primary justify-center">
            Track My Order <ArrowRight size={16} />
          </Link>
          <Link href="/marketplace" className="btn-secondary justify-center">Continue Shopping</Link>
        </div>
        <p className="text-xs text-muted mt-6">Redirecting to orders in {count}s...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen pt-[70px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>}><SuccessContent /></Suspense>;
}
