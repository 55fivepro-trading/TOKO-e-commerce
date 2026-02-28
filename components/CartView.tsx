'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2, ArrowRight, User, Phone, MapPin } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function CartView() {
  const { cart, updateQuantity, setView, createOrder, settings } = useApp();
  const [customer, setCustomer] = useState({ name: '', whatsapp: '', location: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalBelanja = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate Fee from settings
  const feeValue = Number(settings.feeValue || 0);
  const feeAdmin = settings.feeMode === 'PERCENT' ? (totalBelanja * feeValue / 100) : feeValue;
  const totalAkhir = totalBelanja > 0 ? totalBelanja + feeAdmin : 0;

  const handleCheckout = async (method: 'COD' | 'QRIS') => {
    if (!customer.name || !customer.whatsapp || !customer.location) {
      return alert('Lengkapi data pengiriman terlebih dahulu!');
    }
    
    setIsCheckingOut(true);
    try {
      const orderData = {
        action: 'createOrder',
        customerName: customer.name,
        whatsapp: customer.whatsapp,
        location: customer.location,
        items: cart,
        total: totalAkhir,
        paymentMethod: method
      };
      
      const res = await createOrder(orderData);
      if (method === 'QRIS') {
        setView('qris');
      } else {
        alert('Pesanan COD Berhasil! ID: ' + res.orderId);
        setView('home');
      }
    } catch (err: any) {
      alert('Gagal membuat pesanan: ' + err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Trash2 size={40} />
        </div>
        <h3 className="text-xl font-bold text-navy-900 mb-2">Keranjang Kosong</h3>
        <p className="text-gray-500 mb-6">Sepertinya Anda belum memilih produk apapun.</p>
        <button 
          onClick={() => setView('home')}
          className="px-8 py-3 bg-navy-900 text-white rounded-full font-bold hover:bg-navy-800 transition-all"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Product List */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
              <Image 
                src={item.image} 
                alt={item.name} 
                fill
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-navy-900 text-sm">{item.name}</h4>
                <button 
                  onClick={() => updateQuantity(item.id, -item.quantity)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Rp {item.price.toLocaleString('id-ID')}</p>
              <div className="mt-auto flex justify-between items-center">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="text-navy-900"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="text-navy-900"><Plus size={14} /></button>
                </div>
                <p className="font-bold text-navy-900 text-sm">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Info Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-navy-900 mb-2">Data Pengiriman</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <User size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
              className="bg-transparent text-sm w-full outline-none"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Phone size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="WhatsApp (628...)" 
              value={customer.whatsapp}
              onChange={(e) => setCustomer({...customer, whatsapp: e.target.value})}
              className="bg-transparent text-sm w-full outline-none"
            />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Alamat Lengkap" 
              value={customer.location}
              onChange={(e) => setCustomer({...customer, location: e.target.value})}
              className="bg-transparent text-sm w-full outline-none"
            />
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-navy-900 mb-2">Ringkasan Pembayaran</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Belanja</span>
          <span className="font-medium text-navy-900">Rp {totalBelanja.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fee Admin ({settings.feeMode === 'PERCENT' ? `${settings.feeValue}%` : 'Fixed'})</span>
          <span className="font-medium text-navy-900">Rp {feeAdmin.toLocaleString('id-ID')}</span>
        </div>
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-navy-900">Total Akhir</span>
          <span className="text-navy-900">Rp {totalAkhir.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleCheckout('COD')}
          disabled={isCheckingOut}
          className="flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
        >
          {isCheckingOut ? '...' : 'COD'}
        </button>
        <button 
          onClick={() => handleCheckout('QRIS')}
          disabled={isCheckingOut}
          className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isCheckingOut ? '...' : 'QRIS'}
        </button>
      </div>
    </div>
  );
}
