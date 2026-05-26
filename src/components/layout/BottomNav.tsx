'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export default function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0));

  const items = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/create', icon: Plus, label: 'Post', special: true },
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 58, background: 'rgba(10,10,10,0.98)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
    }}>
      {items.map(({ href, icon: Icon, label, special }) => {
        const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, textDecoration: 'none',
            color: active ? '#C8A96B' : 'rgba(255,255,255,0.4)',
            position: 'relative', height: '100%',
          }}>
            {special ? (
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg,#C8A96B,#A8872A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} style={{ color: '#000' }} />
              </div>
            ) : (
              <>
                <Icon size={22} />
                <span style={{ fontSize: '0.58rem', letterSpacing: '0.02em' }}>{label}</span>
                {active && <div style={{ position: 'absolute', bottom: 0, width: 20, height: 2, background: '#C8A96B', borderRadius: 1 }} />}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
