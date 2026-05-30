'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const GOLD = '#C8A96B';

// Custom SVG icons — unique VEYRA identity
const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    {filled ? (
      <>
        <path d="M3 9.5L12 2L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill={GOLD} />
        <path d="M9 21V15H15V21" fill={GOLD} opacity="0.7" />
      </>
    ) : (
      <>
        <path d="M3 9.5L12 2L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

const DiscoverIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.6" fill={filled ? GOLD : 'none'} opacity={filled ? 0.15 : 1} />
    <circle cx="11" cy="11" r="7.5" stroke={filled ? GOLD : 'currentColor'} strokeWidth="1.6" fill="none" />
    <line x1="17" y1="17" x2="21.5" y2="21.5" stroke={filled ? GOLD : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    {filled && <circle cx="11" cy="11" r="3" fill={GOLD} />}
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChatIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 14.5C21 15.33 20.33 16 19.5 16H7L3 20V5.5C3 4.67 3.67 4 4.5 4H19.5C20.33 4 21 4.67 21 5.5V14.5Z"
      fill={filled ? GOLD : 'none'}
      fillOpacity={filled ? 0.15 : 0}
      stroke={filled ? GOLD : 'currentColor'}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    {filled && (
      <>
        <circle cx="8.5" cy="10" r="1.2" fill={GOLD} />
        <circle cx="12" cy="10" r="1.2" fill={GOLD} />
        <circle cx="15.5" cy="10" r="1.2" fill={GOLD} />
      </>
    )}
    {!filled && (
      <>
        <circle cx="8.5" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15.5" cy="10" r="1" fill="currentColor" />
      </>
    )}
  </svg>
);

const ProfileIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="8" r="3.5"
      fill={filled ? GOLD : 'none'}
      fillOpacity={filled ? 0.2 : 0}
      stroke={filled ? GOLD : 'currentColor'}
      strokeWidth="1.6"
    />
    <path
      d="M4 19.5C4 16.46 7.58 14 12 14C16.42 14 20 16.46 20 19.5"
      stroke={filled ? GOLD : 'currentColor'}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const TABS = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/search', label: 'Discover', Icon: DiscoverIcon },
  { href: '/create', label: '', Icon: PlusIcon, isCenter: true },
  { href: '/messages', label: 'Chat', Icon: ChatIcon },
  { href: '/profile', label: 'Me', Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(3);

  // Hide on auth pages
  const hideOn = ['/auth/login', '/auth/signup', '/auth/reset-password', '/auth/callback'];
  if (hideOn.some(p => pathname.startsWith(p))) return null;

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      }}>
        {TABS.map(({ href, label, Icon, isCenter }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

          if (isCenter) return (
            <div key={href} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Link href={href} style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8A96B, #A8872A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', color: '#000',
                boxShadow: '0 4px 20px rgba(200,169,107,0.35)',
                transform: 'translateY(-6px)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                <PlusIcon />
              </Link>
            </div>
          );

          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, textDecoration: 'none', padding: '6px 0',
              color: active ? GOLD : 'rgba(255,255,255,0.38)',
              transition: 'color 0.2s',
              position: 'relative',
            }}>
              {/* Notification dot for messages */}
              {href === '/messages' && unread > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: '28%',
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ef4444', border: '2px solid #0a0a0a',
                  fontSize: '0.5rem', color: '#fff', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread}
                </span>
              )}

              <Icon filled={active} />

              <span style={{
                fontSize: '0.6rem', fontWeight: active ? 600 : 400,
                letterSpacing: '0.03em',
                opacity: active ? 1 : 0.7,
              }}>
                {label}
              </span>

              {/* Active dot */}
              {active && (
                <span style={{
                  position: 'absolute', bottom: 2,
                  width: 3, height: 3, borderRadius: '50%',
                  background: GOLD,
                }} />
              )}
            </Link>
          );
        })}
      </nav>
      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </>
  );
}
