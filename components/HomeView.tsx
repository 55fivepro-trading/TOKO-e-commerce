'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, MessageCircle, Plus, Minus, Star, Info, HelpCircle, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Product } from '@/lib/store';

export default function HomeView() {
  const { products, cart, addToCart, removeFromCart, setView } = useApp();
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [chatCode, setChatCode] = useState('');

  const getCartQty = (id: string | number) => cart.find(item => item.id === id)?.quantity || 0;

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Promo Banner */}
      <section className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-navy-900 to-navy-700 text-white flex items-center px-8">
        <div className="z-10">
          <h2 className="text-3xl font-bold mb-2">NEW ARRIVALS</h2>
          <p className="text-xl opacity-90">20% OFF ALL ITEMS</p>
          <div className="flex gap-3 mt-4">
            <button className="px-6 py-2 bg-white text-navy-900 rounded-full font-semibold text-sm hover:bg-opacity-90 transition-all">
              Shop Now
            </button>
            <button 
              onClick={() => setView('admin')}
              className="px-6 py-2 bg-navy-800/50 backdrop-blur text-white rounded-full font-semibold text-sm hover:bg-navy-800 transition-all flex items-center gap-2"
            >
              <Shield size={14} />
              Admin
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-white/10 skew-x-12 translate-x-12" />
      </section>

      {/* Product Grid */}
      <section>
        <h3 className="text-xl font-bold text-navy-900 mb-4">Our Products</h3>
        {products.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p>Memuat produk...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                qty={getCartQty(product.id)}
                onAdd={() => addToCart(product)}
                onRemove={() => removeFromCart(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Q&A Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-navy-900">
          <HelpCircle size={20} />
          <h3 className="font-bold">Q&A</h3>
        </div>
        <div className="space-y-3 text-sm">
          <details className="group">
            <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
              Berapa lama pengiriman?
              <Plus size={14} className="group-open:rotate-45 transition-transform" />
            </summary>
            <p className="mt-2 text-gray-600">Pengiriman biasanya memakan waktu 2-3 hari kerja tergantung lokasi Anda.</p>
          </details>
          <div className="h-px bg-gray-100" />
          <details className="group">
            <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
              Apakah ada garansi?
              <Plus size={14} className="group-open:rotate-45 transition-transform" />
            </summary>
            <p className="mt-2 text-gray-600">Semua produk elektronik memiliki garansi resmi 1 tahun.</p>
          </details>
        </div>
      </section>

      {/* Store Info */}
      <section className="bg-navy-50 p-6 rounded-2xl border border-navy-100">
        <div className="flex items-center gap-2 mb-4 text-navy-900">
          <Info size={20} />
          <h3 className="font-bold">Info Toko</h3>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          TOKOTOPARYA adalah destinasi utama Anda untuk gadget dan aksesoris berkualitas. Kami berkomitmen memberikan pelayanan terbaik dan produk original.
        </p>
      </section>

      {/* Draggable Chat Admin */}
      <motion.div 
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="fixed bottom-6 right-6 z-50"
      >
        <button 
          onClick={() => setShowChatPopup(true)}
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing"
        >
          <MessageCircle size={28} />
        </button>

        <AnimatePresence>
          {showChatPopup && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-navy-900 text-sm">Chat Admin</h4>
                <button onClick={() => setShowChatPopup(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">Masukkan kode total produk untuk chat admin</p>
              <input 
                type="text" 
                value={chatCode}
                onChange={(e) => setChatCode(e.target.value)}
                placeholder="Kode Produk..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
              <button 
                className="w-full py-2 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800"
                onClick={() => {
                  alert('Menghubungkan ke admin...');
                  setShowChatPopup(false);
                }}
              >
                Kirim
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ProductCard({ product, qty, onAdd, onRemove }: { product: Product, qty: number, onAdd: () => void, onRemove: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
          referrerPolicy="no-referrer"
        />
        {qty > 0 && (
          <div className="absolute top-2 right-2 bg-navy-900 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {qty} in Cart
          </div>
        )}
      </div>
      <h4 className="font-semibold text-sm text-navy-900 mb-1 line-clamp-1">{product.name}</h4>
      <div className="flex items-center gap-1 mb-2">
        <Star size={12} className="fill-yellow-400 text-yellow-400" />
        <span className="text-[10px] font-medium text-gray-500">{product.rating}</span>
      </div>
      <p className="text-navy-900 font-bold text-sm mb-3">Rp {product.price.toLocaleString('id-ID')}</p>
      
      <div className="mt-auto flex items-center justify-between gap-2">
        <button 
          onClick={onRemove}
          disabled={qty === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-bold text-navy-900">{qty}</span>
        <button 
          onClick={onAdd}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
