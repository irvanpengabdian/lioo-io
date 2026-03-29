import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "../components/Provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "SSO Portal | Kedai.IO",
  description: "Central Login for Kedai.IO Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
