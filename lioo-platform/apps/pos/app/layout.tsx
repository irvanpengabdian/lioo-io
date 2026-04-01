import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'lioo POS',
  description: 'Terminal kasir lioo.io',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'lioo POS',
  },
};

export const viewport: Viewport = {
  themeColor: '#2C4F1B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <body className="font-jakarta bg-[#F9FAF5] text-[#1A1C19] antialiased">
        {children}
      </body>
    </html>
  );
}
