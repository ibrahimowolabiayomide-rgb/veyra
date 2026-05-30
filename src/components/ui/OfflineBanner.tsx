'use client';
import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBack, setShowBack] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      setVisible(true);
      setTimeout(() => { setShowBack(false); setTimeout(() => setVisible(false), 400); }, 3000);
    };

    const goOffline = () => {
      setIsOnline(false);
      setShowBack(false);
      setVisible(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: showBack ? '#4ade80' : '#ef4444',
      color: '#fff', fontSize: '0.78rem', fontWeight: 600,
      textAlign: 'center', padding: '8px 16px',
      paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'background 0.3s',
      animation: 'slideDown 0.3s ease',
    }}>
      <span style={{ fontSize: '0.9rem' }}>{showBack ? '✓' : '✕'}</span>
      {showBack ? 'Back online' : 'No internet connection'}
      {!isOnline && (
        <button onClick={() => window.location.reload()}
          style={{ marginLeft: 8, background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: 50, padding: '2px 10px', fontSize: '0.72rem', cursor: 'pointer' }}>
          Retry
        </button>
      )}
      <style>{`@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
