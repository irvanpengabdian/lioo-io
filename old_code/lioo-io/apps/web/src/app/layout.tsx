import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "Lioo.io | Menu & Order",
  description: "Pesan langsung dari meja Anda. Menu digital interaktif dengan pembayaran instan.",
  keywords: "kedai, cafe, menu digital, QR code, food order",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
