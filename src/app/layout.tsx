import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: { default: 'VEYRA — Fashion Meets Intelligence', template: '%s | VEYRA' },
  description: "Discover AI-curated fashion from top creators. Nigeria's most advanced fashion marketplace.",
  keywords: ['fashion', 'AI stylist', 'Nigeria', 'streetwear', 'luxury fashion', 'online shopping'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VEYRA',
    startupImage: '/icons/icon-512.png',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/favicon.ico',
  },
  openGraph: {
    title: 'VEYRA — Fashion Meets Intelligence',
    description: "Nigeria's AI-powered fashion marketplace",
    type: 'website',
    url: 'https://veyra-umber-sigma.vercel.app',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: 'VEYRA — Fashion Meets Intelligence',
    description: "Nigeria's AI-powered fashion marketplace",
    images: ['/icons/icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="shortcut icon" href="/icons/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VEYRA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <meta name="msapplication-TileColor" content="#0B0B0B" />
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
