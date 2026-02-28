'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeView from '@/components/HomeView';
import CartView from '@/components/CartView';
import QRISView from '@/components/QRISView';
import ReviewView from '@/components/ReviewView';
import AdminView from '@/components/AdminView';
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const { view } = useApp();

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'cart': return <CartView />;
      case 'qris': return <QRISView />;
      case 'review': return <ReviewView />;
      case 'admin': return <AdminView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-white shadow-2xl shadow-navy-900/10">
      <Header />
      
      <main className="flex-grow px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
