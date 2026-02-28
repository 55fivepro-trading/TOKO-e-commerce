'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon, 
  LogOut, Plus, Edit, Trash2, Save, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Wallet, Shield
} from 'lucide-react';
import { useApp, Product, Order, Settings } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminView() {
  const { 
    isAdmin, adminLogin, adminLogout, dashboard, orders, products, settings,
    fetchDashboard, fetchOrders, updateOrderStatus, saveProduct, deleteProduct, saveSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings'>('dashboard');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Settings State
  const [localSettings, setLocalSettings] = useState<Settings>({});

  useEffect(() => {
    const init = async () => {
      if (isAdmin) {
        await fetchDashboard();
        await fetchOrders();
        setLocalSettings(settings);
      }
    };
    init();
  }, [isAdmin, fetchDashboard, fetchOrders, settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await adminLogin(username, password);
    if (!success) alert('Login gagal! Periksa username & password.');
    setIsLoggingIn(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900">Admin Login</h2>
            <p className="text-sm text-gray-500">Masukkan kredensial untuk akses dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-4 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Admin Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Stats" />
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18} />} label="Produk" />
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={18} />} label="Order" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18} />} label="Config" />
        </div>
        <button onClick={adminLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20} />
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <DashboardSection data={dashboard} />}
          {activeTab === 'products' && (
            <ProductsSection 
              products={products} 
              onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }} 
              onDelete={deleteProduct} 
              onAdd={() => { setEditingProduct({ id: Date.now() }); setIsProductModalOpen(true); }}
            />
          )}
          {activeTab === 'orders' && <OrdersSection orders={orders} onUpdateStatus={updateOrderStatus} />}
          {activeTab === 'settings' && <SettingsSection settings={localSettings} onSave={saveSettings} />}
        </motion.div>
      </AnimatePresence>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6 text-navy-900">{editingProduct?.name ? 'Edit Produk' : 'Tambah Produk'}</h3>
            <div className="space-y-4">
              <Input label="Nama Produk" value={editingProduct?.name || ''} onChange={(v) => setEditingProduct({...editingProduct, name: v})} />
              <Input label="Harga" type="number" value={editingProduct?.price || ''} onChange={(v) => setEditingProduct({...editingProduct, price: Number(v)})} />
              <Input label="Stok" type="number" value={editingProduct?.stock || ''} onChange={(v) => setEditingProduct({...editingProduct, stock: Number(v)})} />
              <Input label="Gambar URL" value={editingProduct?.image || ''} onChange={(v) => setEditingProduct({...editingProduct, image: v})} />
              <Input label="Kategori" value={editingProduct?.category || ''} onChange={(v) => setEditingProduct({...editingProduct, category: v})} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Deskripsi</label>
                <textarea 
                  value={editingProduct?.description || ''} 
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">Batal</button>
              <button 
                onClick={async () => {
                  await saveProduct(editingProduct as Product);
                  setIsProductModalOpen(false);
                }} 
                className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Shield({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20' : 'text-gray-400 hover:bg-gray-50'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-400 uppercase ml-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none transition-all"
      />
    </div>
  );
}

function DashboardSection({ data }: { data: any }) {
  if (!data) return <div className="py-12 text-center text-gray-400">Memuat data...</div>;
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard icon={<TrendingUp className="text-green-500" />} label="Pendapatan" value={`Rp ${data.pendapatan.toLocaleString()}`} />
      <StatCard icon={<TrendingDown className="text-red-500" />} label="Kerugian" value={`Rp ${data.kerugian.toLocaleString()}`} />
      <StatCard icon={<Wallet className="text-indigo-500" />} label="Laba Bersih" value={`Rp ${data.bersih.toLocaleString()}`} />
      <StatCard icon={<ShoppingBag className="text-amber-500" />} label="Total Order" value={data.totalOrders} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-2">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-2">{icon}</div>
      <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
      <span className="text-xl font-black text-navy-900">{value}</span>
    </div>
  );
}

function ProductsSection({ products, onEdit, onDelete, onAdd }: { products: Product[], onEdit: (p: Product) => void, onDelete: (id: any) => void, onAdd: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-navy-900">Daftar Produk ({products.length})</h3>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-navy-900/20">
          <Plus size={16} /> Tambah
        </button>
      </div>
      <div className="grid gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
              <Image 
                src={p.image} 
                alt={p.name} 
                fill
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow">
              <h4 className="font-bold text-sm text-navy-900">{p.name}</h4>
              <p className="text-xs text-gray-400">Rp {p.price.toLocaleString()} • Stok: {p.stock}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(p)} className="p-2 text-navy-500 hover:bg-navy-50 rounded-lg"><Edit size={16} /></button>
              <button onClick={() => onDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersSection({ orders, onUpdateStatus }: { orders: Order[], onUpdateStatus: (id: string, status: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-navy-900">Pesanan Masuk ({orders.length})</h3>
      <div className="grid gap-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-navy-900">{o.customerName}</h4>
                <p className="text-xs text-gray-400">{o.id} • {new Date(o.timestamp).toLocaleString()}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="text-sm text-gray-600">
              <p>📍 {o.location}</p>
              <p>📱 {o.whatsapp}</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
              <span className="text-lg font-black text-navy-900">Rp {Number(o.total).toLocaleString()}</span>
              <div className="flex gap-2">
                <button onClick={() => onUpdateStatus(o.id, 'DIPROSES')} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl"><Clock size={18} /></button>
                <button onClick={() => onUpdateStatus(o.id, 'SELESAI')} className="p-2 text-green-500 hover:bg-green-50 rounded-xl"><CheckCircle size={18} /></button>
                <button onClick={() => onUpdateStatus(o.id, 'DITOLAK')} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><XCircle size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    'MENUNGGU': 'bg-amber-50 text-amber-600 border-amber-100',
    'DIPROSES': 'bg-blue-50 text-blue-600 border-blue-100',
    'SELESAI': 'bg-green-50 text-green-600 border-green-100',
    'DITOLAK': 'bg-red-50 text-red-600 border-red-100'
  };
  return <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${colors[status] || 'bg-gray-50'}`}>{status}</span>;
}

function SettingsSection({ settings, onSave }: { settings: Settings, onSave: (s: Settings) => void }) {
  const [local, setLocal] = useState(settings);
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <h3 className="font-bold text-navy-900">Pengaturan Toko</h3>
      <div className="space-y-4">
        <Input label="QRIS Base String" value={local.qrisString || ''} onChange={(v) => setLocal({...local, qrisString: v})} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Fee Mode</label>
          <select 
            value={local.feeMode} 
            onChange={(e) => setLocal({...local, feeMode: e.target.value as any})}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-900 outline-none"
          >
            <option value="FIXED">FIXED (Rp)</option>
            <option value="PERCENT">PERCENT (%)</option>
          </select>
        </div>
        <Input label="Fee Value" type="number" value={local.feeValue || ''} onChange={(v) => setLocal({...local, feeValue: v})} />
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <input 
            type="checkbox" 
            checked={local.isActive === 'true'} 
            onChange={(e) => setLocal({...local, isActive: e.target.checked ? 'true' : 'false'})}
            className="w-5 h-5 accent-navy-900"
          />
          <span className="text-sm font-bold text-navy-900">Toko Aktif</span>
        </div>
      </div>
      <button 
        onClick={() => onSave(local)}
        className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-navy-900/20"
      >
        <Save size={20} /> Simpan Perubahan
      </button>
    </div>
  );
}
