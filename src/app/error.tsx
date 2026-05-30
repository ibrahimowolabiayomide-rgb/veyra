'use client';
import Link from 'next/link';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontFamily: 'serif', fontSize: 'clamp(5rem,20vw,9rem)', fontWeight: 300, color: 'rgba(255,255,255,0.06)', lineHeight: 1, margin: '0 0 -20px' }}>500</p>
      <h1 style={{ fontFamily: 'serif', fontSize: '1.6rem', fontWeight: 300, color: '#fff', marginBottom: 10 }}>Something went wrong</h1>
      <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 280, marginBottom: 28 }}>
        We ran into an unexpected error. Our team has been notified.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <button onClick={reset} style={{ padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', border: 'none', color: '#000', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
          Try Again
        </button>
        <Link href="/" style={{ display: 'block', padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
