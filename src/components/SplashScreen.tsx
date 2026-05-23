'use client';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'enter' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1200);
    const t2 = setTimeout(() => setPhase('enter'), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleEnter = () => {
    setPhase('exit');
    setTimeout(onComplete, 800);
  };

  // Auto-enter after 5s
  useEffect(() => {
    const t = setTimeout(handleEnter, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={handleEnter}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.8s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Cinematic background gradient animation */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 80% at 50% 60%, rgba(88,28,135,0.25) 0%, rgba(30,27,75,0.15) 40%, transparent 70%)',
        animation: 'breathe 4s ease-in-out infinite',
      }} />

      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'pulse 3s ease-in-out infinite',
      }} />

      {/* Logo */}
      <div style={{
        position: 'relative', zIndex: 2, textAlign: 'center',
        opacity: phase === 'logo' || phase === 'tagline' || phase === 'enter' ? 1 : 0,
        transform: phase === 'logo' ? 'scale(0.8)' : 'scale(1)',
        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* V Logo image */}
        <div style={{
          width: 100, height: 100,
          margin: '0 auto 24px',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(139,92,246,0.4), 0 0 120px rgba(139,92,246,0.2)',
          opacity: phase === 'logo' ? 0 : 1,
          transform: phase === 'logo' ? 'scale(0.5) translateY(20px)' : 'scale(1) translateY(0)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <img src="/icons/icon-192.png" alt="VEYRA" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Brand name */}
        <div style={{
          fontFamily: 'serif',
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 300,
          letterSpacing: '0.4em',
          color: '#fff',
          opacity: phase === 'logo' ? 0 : 1,
          transform: phase === 'logo' ? 'translateY(30px)' : 'translateY(0)',
          transition: 'all 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          textShadow: '0 0 40px rgba(255,255,255,0.2)',
        }}>
          VEYRA
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          letterSpacing: '0.25em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          marginTop: 12,
          opacity: phase === 'tagline' || phase === 'enter' ? 1 : 0,
          transform: phase === 'tagline' || phase === 'enter' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease',
        }}>
          Fashion Meets Intelligence
        </div>

        {/* Second tagline */}
        <div style={{
          fontFamily: 'sans-serif',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
          letterSpacing: '0.2em',
          color: 'rgba(200,169,107,0.7)',
          textTransform: 'uppercase',
          marginTop: 8,
          opacity: phase === 'enter' ? 1 : 0,
          transition: 'all 0.6s 0.2s ease',
        }}>
          Shop. Sell. Inspire.
        </div>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          style={{
            marginTop: 48,
            background: 'transparent',
            border: '1px solid rgba(200,169,107,0.4)',
            color: '#C8A96B',
            padding: '14px 48px',
            borderRadius: 50,
            fontFamily: 'sans-serif',
            fontSize: '0.85rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            opacity: phase === 'enter' ? 1 : 0,
            transform: phase === 'enter' ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s 0.3s ease, background 0.2s, border-color 0.2s',
            boxShadow: '0 0 30px rgba(200,169,107,0.15)',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.background = 'rgba(200,169,107,0.1)';
            (e.target as HTMLElement).style.borderColor = 'rgba(200,169,107,0.8)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.background = 'transparent';
            (e.target as HTMLElement).style.borderColor = 'rgba(200,169,107,0.4)';
          }}
        >
          Enter VEYRA
        </button>

        {/* Skip hint */}
        <div style={{
          marginTop: 24,
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.1em',
          opacity: phase === 'enter' ? 1 : 0,
          transition: 'opacity 0.6s 0.5s ease',
        }}>
          TAP ANYWHERE TO SKIP
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
