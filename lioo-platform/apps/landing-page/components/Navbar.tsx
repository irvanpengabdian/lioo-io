"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@repo/ui/components/logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav shadow-[0_12px_40px_rgba(67,73,62,0.06)] bg-white/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center px-6 lg:px-10 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {[
            { label: "Beranda", href: "/" },
            { label: "Fitur", href: "/features" },
            { label: "Solusi", href: "/solutions" },
            { label: "Harga", href: "/pricing" },
            { label: "Hardware", href: "/hardware" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#43493E] hover:text-[#2C4F1B] transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#436831] rounded-full transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}
            className="text-[#2C4F1B] font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#BBEDA6]/40 transition-all duration-200"
          >
            Masuk
          </a>
          <a
            href={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}
            id="navbar-cta-global"
            className="sage-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all duration-200"
          >
            Mulai Bertumbuh
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-[#EDEEE9] transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[#2C4F1B]">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F9FAF5]/95 backdrop-blur-xl border-t border-[#C3C9BA]/20 px-6 py-6 flex flex-col gap-4">
          {[
            { label: "Beranda", href: "/" },
            { label: "Fitur", href: "/features" },
            { label: "Solusi", href: "/solutions" },
            { label: "Harga", href: "/pricing" },
            { label: "Hardware", href: "/hardware" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[#43493E] font-semibold text-sm py-2 border-b border-[#C3C9BA]/20"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={process.env.NEXT_PUBLIC_SSO_URL || "http://localhost:3001"}
            className="sage-gradient text-white px-6 py-3 rounded-full font-bold text-center text-sm mt-2"
          >
            Mulai Bertumbuh
          </a>
        </div>
      )}
    </nav>
  );
}
