'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'hidden' | 'in' | 'hold' | 'out'>('hidden');

  useEffect(() => {
    // Stagger: hidden → in → hold → out → done
    const t0 = setTimeout(() => setPhase('in'), 50);
    const t1 = setTimeout(() => setPhase('hold'), 700);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onComplete(), 2900);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'out' ? 0 : 1,
      transition: phase === 'out' ? 'opacity 0.7s ease' : 'none',
      pointerEvents: phase === 'out' ? 'none' : 'all',
    }}>
      {/* Ambient glow — only on hold */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 50% 35% at 50% 50%, rgba(200,169,107,0.07) 0%, transparent 70%)',
        opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
        transition: 'opacity 1s ease',
      }} />

      {/* Logo container */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        opacity: phase === 'hidden' ? 0 : 1,
        transform: phase === 'hidden' ? 'translateY(12px) scale(0.96)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo — 20% of screen height max */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(2rem, 10vw, 3.2rem)',
            fontWeight: 300,
            letterSpacing: '0.45em',
            color: '#fff',
            margin: 0,
            paddingRight: '0.45em',
            lineHeight: 1,
          }}>
            VE<span style={{ color: '#C8A96B' }}>Y</span>RA
          </p>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
          margin: 0,
          paddingRight: '0.28em',
          opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}>
          Fashion Meets Intelligence
        </p>
      </div>

      {/* Spinner */}
      <div style={{
        position: 'absolute', bottom: '12vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        opacity: phase === 'hold' || phase === 'out' ? 1 : 0,
        transition: 'opacity 0.5s ease 0.3s',
      }}>
        <div style={{
          width: 20, height: 20,
          border: '1.5px solid rgba(200,169,107,0.25)',
          borderTopColor: '#C8A96B',
          borderRadius: '50%',
          animation: 'splash-spin 0.9s linear infinite',
        }} />
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', margin: 0 }}>
          Loading…
        </p>
      </div>

      {/* Bottom progress line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1.5, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #C8A96B 50%, transparent)',
          width: phase === 'hold' || phase === 'out' ? '100%' : '0%',
          transition: 'width 1.6s ease',
        }} />
      </div>

      <style>{`
        @keyframes splash-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
