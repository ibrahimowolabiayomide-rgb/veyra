import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: { default: 'VEYRA — Fashion Meets Intelligence', template: '%s | VEYRA' },
  description: "Discover. Inspire. Shop. Nigeria's AI-powered fashion marketplace.",
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VEYRA' },
  icons: {
    icon: [{ url: '/icons/favicon.ico' }, { url: '/icons/icon-192.png', sizes: '192x192' }],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style>{`
          :root {
            --bg: #0a0a0a;
            --text: #fff;
            --card: #111;
            --border: rgba(255,255,255,0.07);
            --muted: rgba(255,255,255,0.4);
            --gold: #C8A96B;
          }
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          body { transition: background 0.3s, color 0.3s; }
          ::-webkit-scrollbar { width: 0; height: 0; }
        `}</style>
      </head>
      <body style={{ background: '#0a0a0a', margin: 0, overflowX: 'hidden' }}>
        {children}
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#C8A96B', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  );
}
