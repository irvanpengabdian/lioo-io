'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

type Props = {
  menuHref: string;
  cartHref: string;
  ordersHref: string;
  profileHref: string;
};

function Icon({ name }: { name: 'menu' | 'cart' | 'history' | 'profile' }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' };
  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'cart') {
    return (
      <svg {...common}>
        <path d="M6 6h15l-1.5 9H7.5L6 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'history') {
    return (
      <svg {...common}>
        <path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BottomNav({ menuHref, cartHref, ordersHref, profileHref }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const cartOpen = useMemo(() => searchParams.get('cart') === '1', [searchParams]);

  function handleCartClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Keep UX snappy: if cart query is already set, avoid extra navigation.
    if (cartOpen) e.preventDefault();
    if (cartOpen) router.refresh();
  }

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 h-20 bg-white/70 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(67,73,62,0.06)]"
      aria-label="Bottom navigation"
    >
      <Link
        href={menuHref}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          pathname === menuHref || pathname.startsWith(menuHref) ? 'text-[#2C4F1B]' : 'text-[#73796D] opacity-80'
        } text-[11px] font-bold uppercase tracking-wider no-underline`}
      >
        <span className="text-[#2C4F1B] flex items-center justify-center">
          <Icon name="menu" />
        </span>
        <span>Menu</span>
      </Link>

      <Link
        href={cartHref}
        onClick={handleCartClick}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          cartOpen ? 'text-[#2C4F1B]' : 'text-[#73796D] opacity-80'
        } text-[11px] font-bold uppercase tracking-wider no-underline`}
      >
        <span className="flex items-center justify-center">
          <Icon name="cart" />
        </span>
        <span>Cart</span>
      </Link>

      <Link
        href={ordersHref}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          pathname === ordersHref || pathname.startsWith(ordersHref) ? 'text-[#2C4F1B]' : 'text-[#73796D] opacity-80'
        } text-[11px] font-bold uppercase tracking-wider no-underline`}
      >
        <span className="flex items-center justify-center">
          <Icon name="history" />
        </span>
        <span>Orders</span>
      </Link>

      <Link
        href={profileHref}
        className={`flex flex-col items-center justify-center gap-0.5 ${
          pathname === profileHref || pathname.startsWith(profileHref) ? 'text-[#2C4F1B]' : 'text-[#73796D] opacity-80'
        } text-[11px] font-bold uppercase tracking-wider no-underline`}
      >
        <span className="flex items-center justify-center">
          <Icon name="profile" />
        </span>
        <span>Profile</span>
      </Link>
    </nav>
  );
}

