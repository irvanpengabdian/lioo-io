import React from 'react';
import Image from 'next/image';
import logoImg from '../assets/logo.png';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className || ''}`}>
      <div className="relative h-10 w-10 flex-shrink-0 bg-white rounded-xl shadow-sm border border-[#E2E3DE]/50 overflow-hidden">
        <Image 
          src={logoImg} 
          alt="Lioo.io Logo" 
          fill
          sizes="40px"
          className="object-cover" 
          priority
        />
      </div>
      <span className="text-xl font-black tracking-tighter text-[#2C4F1B]">
        lioo.io
      </span>
    </div>
  );
}
