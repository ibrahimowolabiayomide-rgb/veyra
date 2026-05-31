'use client';
import { useState, useEffect } from 'react';

const FASHION_SLIDES = [
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=90',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=90',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=90',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=90',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=90',
];

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'black' | 'reveal' | 'full' | 'exit'>('black');
  const [slide, setSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // Phase sequence
    const t1 = setTimeout(() => setPhase('reveal'), 400);
    const t2 = setTimeout(() => setPhase('full'), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Image slideshow
  useEffect(() => {
    if (phase !== 'full') return;
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % FASHION_SLIDES.length);
        setNextSlide(s => (s + 1) % FASHION_SLIDES.length);
        setTransitioning(false);
      }, 800);
    }, 3500);
    return () => clearInterval(interval);
  }, [phase]);

  const handleEnter = () => {
    setPhase('exit');
    setTimeout(() => onComplete(), 700);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      overflow: 'hidden',
      opacity: phase === 'exit' ? 0 : 1,
      transition: phase === 'exit' ? 'opacity 0.7s ease' : 'none',
    }}>

      {/* Background image slideshow */}
      {FASHION_SLIDES.map((src, i) => (
        <div key={src} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: i === slide ? (transitioning ? 0 : 1) : 0,
          transition: 'opacity 0.8s ease',
          transform: i === slide ? 'scale(1.04)' : 'scale(1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '5s, 5s',
          transitionTimingFunction: 'ease, ease',
        }} />
      ))}

      {/* Dark overlay — cinematic */}
      <div style={{
        position: 'absolute', inset: 0,
        background: phase === 'black'
          ? '#0a0a0a'
          : 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.92) 100%)',
        transition: 'background 1.2s ease',
      }} />

      {/* Gold radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(200,169,107,0.08) 0%, transparent 70%)',
        opacity: phase === 'full' ? 1 : 0,
        transition: 'opacity 1.5s ease',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        opacity: phase === 'black' ? 0 : 1,
        transform: phase === 'black' ? 'translateY(16px)' : 'translateY(0)',
        transition: 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Small top label */}
        <p style={{
          fontSize: 'clamp(0.55rem, 2vw, 0.68rem)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 16,
          opacity: phase === 'full' ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}>
          Welcome to
        </p>

        {/* VEYRA Logo */}
        <h1 style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(3rem, 14vw, 6rem)',
          fontWeight: 300,
          letterSpacing: '0.4em',
          paddingRight: '0.4em',
          color: '#fff',
          margin: 0,
          lineHeight: 1,
          textShadow: '0 0 80px rgba(200,169,107,0.3), 0 2px 20px rgba(0,0,0,0.5)',
        }}>
          VE<span style={{
            color: '#C8A96B',
            textShadow: '0 0 40px rgba(200,169,107,0.6)',
          }}>Y</span>RA
        </h1>

        {/* Thin gold line */}
        <div style={{
          width: phase === 'full' ? '120px' : '0px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #C8A96B, transparent)',
          margin: '20px 0',
          transition: 'width 1s ease 0.4s',
        }} />

        {/* Tagline 1 */}
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(0.95rem, 4vw, 1.3rem)',
          fontWeight: 300,
          color: '#fff',
          letterSpacing: '0.06em',
          textAlign: 'center',
          margin: '0 0 8px',
          opacity: phase === 'full' ? 1 : 0,
          transform: phase === 'full' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s',
        }}>
          Discover Style Beyond Fashion
        </p>

        {/* Tagline 2 */}
        <p style={{
          fontSize: 'clamp(0.72rem, 3vw, 0.88rem)',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 48px',
          opacity: phase === 'full' ? 1 : 0,
          transform: phase === 'full' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.8s ease 0.85s, transform 0.8s ease 0.85s',
        }}>
          Shop · Sell · Inspire
        </p>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          style={{
            padding: '14px 48px',
            borderRadius: 50,
            background: 'transparent',
            border: '1.5px solid rgba(200,169,107,0.7)',
            color: '#C8A96B',
            fontSize: '0.88rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            opacity: phase === 'full' ? 1 : 0,
            transform: phase === 'full' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease 1.1s, transform 0.8s ease 1.1s, background 0.25s, color 0.25s, box-shadow 0.25s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = '#C8A96B';
            (e.target as HTMLButtonElement).style.color = '#000';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(200,169,107,0.4)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#C8A96B';
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Enter VEYRA
        </button>
      </div>

      {/* Slide indicator dots */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6,
        opacity: phase === 'full' ? 0.6 : 0,
        transition: 'opacity 0.5s ease 1.5s',
      }}>
        {FASHION_SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 20 : 5,
            height: 5, borderRadius: 50,
            background: i === slide ? '#C8A96B' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.4s ease',
          }} />
        ))}
      </div>

      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
