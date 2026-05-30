import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import BottomNav from '@/components/layout/BottomNav';
import OfflineBanner from '@/components/ui/OfflineBanner';

export const metadata: Metadata = {
  title: { default: 'VEYRA — Fashion Meets Intelligence', template: '%s | VEYRA' },
  description: "Discover. Inspire. Shop. Nigeria's AI-powered fashion marketplace.",
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VEYRA' },
  icons: { icon: '/favicon.ico', apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        {/* Prevent white flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('veyra-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.background = t === 'light' ? '#f8f8f6' : '#0a0a0a';
            } catch(e) {}
          })();
        ` }} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body>
        <ThemeProvider>
          <OfflineBanner />
          {children}
          <BottomNav />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                maxWidth: '340px',
              },
              success: { iconTheme: { primary: '#C8A96B', secondary: '#000' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
