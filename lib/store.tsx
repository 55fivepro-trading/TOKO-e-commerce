'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// --- TYPES ---

export type Product = {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  category: string;
  rating?: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type Review = {
  id: number;
  user: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
};

export type Order = {
  id: string;
  timestamp: string;
  customerName: string;
  whatsapp: string;
  location: string;
  products: string; // JSON string
  total: number;
  paymentMethod: string;
  status: string;
  proofImage: string;
};

export type Settings = {
  qrisString?: string;
  feeMode?: 'FIXED' | 'PERCENT';
  feeValue?: string;
  isActive?: string;
};

export type DashboardData = {
  pendapatan: number;
  kerugian: number;
  bersih: number;
  totalOrders: number;
  pendingOrders: number;
};

type AppState = {
  // User State
  products: Product[];
  cart: CartItem[];
  view: 'home' | 'cart' | 'qris' | 'review' | 'admin';
  reviews: { averageRating: string; totalReview: number; list: Review[] };
  settings: Settings;
  isLoading: boolean;
  
  // Admin State
  isAdmin: boolean;
  adminToken: string | null;
  orders: Order[];
  dashboard: DashboardData | null;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, delta: number) => void;
  setView: (view: 'home' | 'cart' | 'qris' | 'review' | 'admin') => void;
  clearCart: () => void;
  
  // API Actions
  fetchProducts: () => Promise<void>;
  fetchRatings: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  submitRating: (review: { user: string; rating: number; comment: string }) => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
  
  // Admin Actions
  adminLogin: (user: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
  fetchOrders: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

// --- CONFIG ---
const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || ""; // Set this in .env.local

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<'home' | 'cart' | 'qris' | 'review' | 'admin'>('home');
  const [reviews, setReviews] = useState<{ averageRating: string; totalReview: number; list: Review[] }>({ averageRating: "0", totalReview: 0, list: [] });
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  // --- API HELPERS ---

  const apiGet = useCallback(async (action: string, params: any = {}) => {
    if (!GAS_URL) return { success: false, message: "GAS_URL not set" };
    const query = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${GAS_URL}?${query}`);
    return await res.json();
  }, []);

  const apiPost = useCallback(async (action: string, data: any = {}) => {
    if (!GAS_URL) return { success: false, message: "GAS_URL not set" };
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action, ...data }),
    });
    return await res.json();
  }, []);

  // --- ACTIONS ---

  const fetchProducts = useCallback(async () => {
    const res = await apiGet('getProducts');
    if (res.success) setProducts(res.data);
  }, [apiGet]);

  const fetchRatings = useCallback(async () => {
    const res = await apiGet('getRatings');
    if (res.success) setReviews(res.data);
  }, [apiGet]);

  const fetchSettings = useCallback(async () => {
    const res = await apiGet('getSettings');
    if (res.success) setSettings(res.data);
  }, [apiGet]);

  const submitRating = useCallback(async (data: any) => {
    await apiPost('submitRating', data);
    await fetchRatings();
  }, [apiPost, fetchRatings]);

  const createOrder = useCallback(async (data: any) => {
    const res = await apiPost('createOrder', data);
    if (res.success) {
      await fetchProducts(); // Refresh stock
      return res.data;
    }
    throw new Error(res.message);
  }, [apiPost, fetchProducts]);

  // --- ADMIN ACTIONS ---

  const adminLogin = useCallback(async (username: string, pass: string) => {
    const res = await apiPost('adminLogin', { username, password: pass });
    if (res.success) {
      setAdminToken(res.data.token);
      setIsAdmin(true);
      localStorage.setItem('adminToken', res.data.token);
      return true;
    }
    return false;
  }, [apiPost]);

  const adminLogout = useCallback(() => {
    setAdminToken(null);
    setIsAdmin(false);
    localStorage.removeItem('adminToken');
    setView('home');
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!adminToken) return;
    const res = await apiGet('getOrders', { token: adminToken });
    if (res.success) setOrders(res.data);
  }, [adminToken, apiGet]);

  const fetchDashboard = useCallback(async () => {
    if (!adminToken) return;
    const res = await apiGet('getDashboard', { token: adminToken });
    if (res.success) setDashboard(res.data);
  }, [adminToken, apiGet]);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    await apiPost('updateOrderStatus', { id, status, token: adminToken });
    await fetchOrders();
    await fetchDashboard();
  }, [adminToken, apiPost, fetchOrders, fetchDashboard]);

  const saveProduct = useCallback(async (product: Product) => {
    await apiPost('saveProduct', { ...product, token: adminToken });
    await fetchProducts();
  }, [adminToken, apiPost, fetchProducts]);

  const deleteProduct = useCallback(async (id: string | number) => {
    await apiPost('deleteProduct', { id, token: adminToken });
    await fetchProducts();
  }, [adminToken, apiPost, fetchProducts]);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    await apiPost('saveSettings', { settings: newSettings, token: adminToken });
    await fetchSettings();
  }, [adminToken, apiPost, fetchSettings]);

  // --- CART LOGIC ---

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string | number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  // --- REAL-TIME POLLING ---

  useEffect(() => {
    const init = async () => {
      await fetchProducts();
      await fetchRatings();
      await fetchSettings();
    };
    init();
    
    const interval = setInterval(() => {
      fetchProducts();
      if (isAdmin) {
        fetchOrders();
        fetchDashboard();
      }
    }, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [isAdmin, fetchProducts, fetchRatings, fetchSettings, fetchOrders, fetchDashboard]);

  // Restore session
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Defer state updates to avoid linter warning about synchronous setState in effect
      setTimeout(() => {
        setAdminToken(token);
        setIsAdmin(true);
      }, 0);
    }
  }, []);

  return (
    <AppContext.Provider value={{ 
      products, cart, view, reviews, settings, isLoading,
      isAdmin, adminToken, orders, dashboard,
      addToCart, removeFromCart, updateQuantity, setView, clearCart,
      fetchProducts, fetchRatings, fetchSettings, submitRating, createOrder,
      adminLogin, adminLogout, fetchOrders, fetchDashboard, updateOrderStatus,
      saveProduct, deleteProduct, saveSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
