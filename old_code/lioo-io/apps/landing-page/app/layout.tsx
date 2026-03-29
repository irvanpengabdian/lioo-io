import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "lioo.io — Platform POS & Manajemen Merchant Modern",
  description:
    "lioo.io adalah ekosistem digital organik untuk merchant modern. Kelola kasir, dapur, inventori, dan keuangan dalam satu platform. Setup dalam 10 menit, bayar per transaksi.",
  keywords:
    "pos kasir, aplikasi restoran, manajemen merchant, point of sale, lioo.io, f&b management, kasir digital",
  openGraph: {
    title: "lioo.io — Platform POS & Manajemen Merchant Modern",
    description:
      "Ekosistem digital organik untuk merchant dan F&B modern. Kasir, Dapur, Inventori, Keuangan — semua dalam satu platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9FAF5] text-[#1A1C19]">
        {children}
      </body>
    </html>
  );
}
