import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/Provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "lioo.io · Merchant Portal",
  description: "Portal terpusat untuk mengelola semua aplikasi bisnis lioo.io dalam satu dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}

