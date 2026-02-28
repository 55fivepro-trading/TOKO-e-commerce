'use client';

import React from 'react';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function Header() {
  const { view, setView, cart } = useApp();
  
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {view !== 'home' && (
          <button 
            onClick={() => setView('home')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-navy-900" />
          </button>
        )}
        <h1 className="text-xl font-black text-navy-900 tracking-tighter">TOKOTOPARYA</h1>
      </div>
      
      <button 
        onClick={() => setView('cart')}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ShoppingCart size={24} className="text-navy-900" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
      </button>
    </header>
  );
}
