import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(200,169,107,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <p style={{ fontFamily: 'serif', fontSize: 'clamp(5rem,20vw,9rem)', fontWeight: 300, color: 'rgba(255,255,255,0.06)', lineHeight: 1, margin: '0 0 -20px', letterSpacing: '-0.02em' }}>404</p>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(1.4rem,5vw,2rem)', fontWeight: 300, color: '#fff', marginBottom: 10 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        <Link href="/" style={{ display: 'block', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#C8A96B,#A8872A)', color: '#000', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
          Go Home
        </Link>
        <Link href="/search" style={{ display: 'block', padding: '13px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textDecoration: 'none' }}>
          Browse Fashion
        </Link>
      </div>

      <p style={{ marginTop: 32, fontFamily: 'serif', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.12)' }}>VEYRA</p>
    </div>
  );
}
