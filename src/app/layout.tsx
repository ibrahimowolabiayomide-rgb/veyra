import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: { default: 'VEYRA — Fashion Meets Intelligence', template: '%s | VEYRA' },
  description: 'Discover AI-curated fashion from top creators. Nigeria\'s most advanced fashion marketplace.',
  keywords: ['fashion', 'AI stylist', 'Nigeria', 'streetwear', 'luxury fashion', 'online shopping'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VEYRA' },
  openGraph: {
    title: 'VEYRA — Fashion Meets Intelligence',
    description: 'AI-powered fashion marketplace',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export const viewport: Viewport = {
  themeColor: '#C8A96B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161616',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#C8A96B', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  );
}
