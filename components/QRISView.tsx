'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, Send, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';

export default function QRISView() {
  const { cart, setView, clearCart, settings } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const totalBelanja = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const feeValue = Number(settings.feeValue || 0);
  const feeAdmin = settings.feeMode === 'PERCENT' ? (totalBelanja * feeValue / 100) : feeValue;
  const totalAkhir = totalBelanja + feeAdmin;

  // Real Dynamic QRIS logic (simplified for demo, usually involves CRC calculation)
  const qrisBase = settings.qrisString || "00020101021126670016ID.CO.QRIS.WWW011893600523000000000002150000000000000000303608510400005204599953033605802ID5911TOKOTOPARYA6005KOTA 6105123456304";
  const qrisFinal = qrisBase + totalAkhir.toString(); // This is a placeholder for real dynamic QRIS logic

  const handleSend = () => {
    setIsSent(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* QR Code Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="bg-gray-50 p-4 rounded-2xl mb-4">
          <QRCodeSVG value={qrisFinal} size={200} level="H" />
        </div>
        <p className="text-sm font-medium text-gray-500">QRIS dinamis sesuai pengaturan admin</p>
      </div>

      {/* Cost Details */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Nominal Total</span>
          <span className="font-bold text-navy-900">Rp {totalBelanja.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Fee Admin</span>
          <span className="font-bold text-navy-900">Rp {feeAdmin.toLocaleString('id-ID')}</span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex flex-col items-center py-2">
          <span className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Akhir</span>
          <span className="text-3xl font-black text-navy-900">Rp {totalAkhir.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={() => setIsUploaded(true)}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isUploaded ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-white text-navy-900 border-2 border-navy-900 hover:bg-navy-50'}`}
        >
          {isUploaded ? <CheckCircle2 size={20} /> : <Upload size={20} />}
          {isUploaded ? 'Bukti Terunggah' : 'Upload Bukti Pembayaran'}
        </button>
        <button 
          onClick={handleSend}
          disabled={!isUploaded || isSent}
          className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-navy-100"
        >
          <Send size={20} />
          Kirim Bukti
        </button>
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-navy-900 font-bold"
        >
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            <span>Tunggu admin konfirmasi..</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="pt-2 space-y-3 border-t border-gray-50">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-gray-500">{item.name} (x{item.quantity})</span>
                    <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-2 border-t border-dashed border-gray-200">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">Rp {feeAdmin.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-navy-900">
                  <span>Total</span>
                  <span>Rp {totalAkhir.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSent && (
        <button 
          onClick={() => {
            clearCart();
            setView('review');
          }}
          className="mt-4 text-center text-navy-600 font-bold text-sm underline"
        >
          Lanjut Beri Rating & Review
        </button>
      )}
    </div>
  );
}
