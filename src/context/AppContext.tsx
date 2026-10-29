import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  CartItem,
  Order,
  User,
  CanteenStatus,
  OrderStatus,
} from '../types';
import { DEMO_STUDENT, DEMO_ADMIN, INITIAL_CANTEEN_STATUS } from '../data/initialData';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Current user & authentication
  user: User | null;
  adminToken: string | null;
  loginAsDemoStudent: () => void;
  loginAsDemoAdmin: () => void;
  loginCustom: (email: string, name?: string, role?: 'student' | 'admin', rollNumber?: string) => Promise<void>;
  logout: () => void;

  // View state
  currentView: 'home' | 'menu' | 'cart' | 'track' | 'history' | 'admin';
  setCurrentView: (view: 'home' | 'menu' | 'cart' | 'track' | 'history' | 'admin') => void;

  // Menu items
  menu: MenuItem[];
  menuLoading: boolean;
  refreshMenu: () => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<boolean>;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'rating' | 'ratingCount'>) => Promise<boolean>;
  deleteMenuItem: (id: string) => Promise<boolean>;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartServiceFee: number;
  cartTotal: number;
  cartItemCount: number;

  // Orders & Tracking
  orders: Order[];
  studentOrders: Order[];
  activeOrder: Order | null;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  refreshOrders: () => Promise<void>;
  placeOrder: (details: {
    pickupSlot: string;
    specialInstructions: string;
    paymentMethod: 'upi' | 'qr' | 'card' | 'cash';
  }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<boolean>;
  reorderItems: (order: Order) => void;

  // Canteen Status
  canteenStatus: CanteenStatus;
  refreshCanteenStatus: () => Promise<void>;
  updateCanteenStatus: (updates: Partial<CanteenStatus>) => Promise<boolean>;

  // Notifications
  notification: { title: string; message: string; type: 'info' | 'success' | 'ready' } | null;
  clearNotification: () => void;
  resetDemoData: () => Promise<void>;

  // Quick modals
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  isSupabaseGuideOpen: boolean;
  setSupabaseGuideOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_STUDENT);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'cart' | 'track' | 'history' | 'admin'>('home');

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>('ord-101');
  const [canteenStatus, setCanteenStatus] = useState<CanteenStatus>(INITIAL_CANTEEN_STATUS);

  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'ready';
  } | null>(null);

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isSupabaseGuideOpen, setSupabaseGuideOpen] = useState(false);

  // Fetch Menu from Supabase or Fallback API
  const refreshMenu = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const sbMenu = await SupabaseService.getMenu();
        if (sbMenu && sbMenu.length > 0) {
          setMenu(sbMenu);
          setMenuLoading(false);
          return;
        }
      }

      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenu(data.menu || []);
      }
    } catch (e) {
      console.error('Failed to fetch menu:', e);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  // Fetch Orders from Supabase or Fallback API
  const refreshOrders = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const sbOrders = await SupabaseService.getOrders();
        if (sbOrders && sbOrders.length > 0) {
          setOrders(sbOrders);
          return;
        }
      }

      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  }, []);

  // Fetch Canteen Status from Supabase or Fallback API
  const refreshCanteenStatus = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const sbStatus = await SupabaseService.getCanteenStatus();
        if (sbStatus) {
          setCanteenStatus(sbStatus);
          return;
        }
      }

      const res = await fetch('/api/canteen/status');
      if (res.ok) {
        const data = await res.json();
        if (data.canteenStatus) {
          setCanteenStatus(data.canteenStatus);
        }
      }
    } catch (e) {
      console.error('Failed to fetch canteen status:', e);
    }
  }, []);

  // Connect to SSE stream for real-time updates across student & admin devices
  useEffect(() => {
    refreshMenu();
    refreshOrders();
    refreshCanteenStatus();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('order_created', (e) => {
        try {
          const data = JSON.parse(e.data);
          setOrders((prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)]);
          refreshCanteenStatus();
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('order_updated', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.action === 'reset') {
            refreshOrders();
            refreshMenu();
            return;
          }
          if (data.order) {
            setOrders((prev) =>
              prev.map((o) => (o.id === data.order.id ? data.order : o))
            );

            // If this is the active order for the current user and status turned READY
            if (data.order.orderStatus === 'READY') {
              try {
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
              } catch {
                // ignore
              }
              setNotification({
                title: `Order Ready for Pickup! 🎉`,
                message: `Token #${data.order.pickupToken} is ready at the canteen counter. Show your QR code to collect!`,
                type: 'ready',
              });
            }
          }
          refreshCanteenStatus();
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.addEventListener('menu_updated', () => {
        refreshMenu();
      });

      eventSource.addEventListener('canteen_updated', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.canteenStatus) {
            setCanteenStatus(data.canteenStatus);
          }
        } catch (err) {
          console.error(err);
        }
      });

      eventSource.onerror = () => {
        // SSE error or reconnection, keep silent
      };
    } catch (err) {
      console.error('SSE initialization error:', err);
    }

    // Polling fallback every 8 seconds
    const interval = setInterval(() => {
      refreshOrders();
      refreshCanteenStatus();
    }, 8000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
    };
  }, [refreshMenu, refreshOrders, refreshCanteenStatus]);

  // Auth functions
  const loginAsDemoStudent = () => {
    setUser(DEMO_STUDENT);
    setAdminToken(null);
    setCurrentView('menu');
    setNotification({
      title: 'Switched to Student Mode',
      message: `Signed in as ${DEMO_STUDENT.name} (${DEMO_STUDENT.rollNumber}).`,
      type: 'info',
    });
  };

  const loginAsDemoAdmin = () => {
    setUser(DEMO_ADMIN);
    setAdminToken('canteen-admin-secret-2026');
    setCurrentView('admin');
    setNotification({
      title: 'Switched to Canteen Admin',
      message: `Welcome Chef Raman! Kitchen Queue & Menu Controls unlocked.`,
      type: 'info',
    });
  };

  const loginCustom = async (
    email: string,
    name?: string,
    role: 'student' | 'admin' = 'student',
    rollNumber?: string
  ) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role, rollNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === 'admin') {
          setAdminToken(data.token || 'canteen-admin-secret-2026');
          setCurrentView('admin');
        } else {
          setAdminToken(null);
          setCurrentView('menu');
        }
        setAuthModalOpen(false);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setAdminToken(null);
    setCurrentView('home');
    setCart([]);
  };

  // Cart operations
  const addToCart = (item: MenuItem, qty: number = 1) => {
    if (!item.isAvailable) {
      setNotification({
        title: 'Item Unavailable',
        message: `${item.name} is currently sold out in the canteen.`,
        type: 'info',
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id
            ? { ...ci, quantity: Math.min(ci.quantity + qty, 20) }
            : ci
        );
      }
      return [...prev, { menuItem: item, quantity: qty }];
    });

    setNotification({
      title: 'Added to Cart',
      message: `${qty}x ${item.name} added to your tray.`,
      type: 'success',
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return { ...ci, quantity: newQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart pricing calculations
  const cartSubtotal = cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const cartServiceFee = cart.length > 0 ? 2 : 0;
  const cartTotal = cartSubtotal + cartTax + cartServiceFee;
  const cartItemCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  // Filter orders for student
  const studentOrders = orders.filter((o) => (user ? o.studentId === user.id : true));
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0] || null;

  // Place order flow
  const placeOrder = async ({
    pickupSlot,
    specialInstructions,
    paymentMethod,
  }: {
    pickupSlot: string;
    specialInstructions: string;
    paymentMethod: 'upi' | 'qr' | 'card' | 'cash';
  }): Promise<Order | null> => {
    if (cart.length === 0) return null;

    try {
      const payload = {
        items: cart.map((ci) => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
        })),
        studentId: user?.id || DEMO_STUDENT.id,
        studentName: user?.name || DEMO_STUDENT.name,
        studentEmail: user?.email || DEMO_STUDENT.email,
        studentRoll: user?.rollNumber || DEMO_STUDENT.rollNumber,
        pickupSlot,
        specialInstructions,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data = await res.json();
      const newOrder = data.order as Order;

      // Sync with Supabase persistent cloud database if configured
      if (isSupabaseConfigured()) {
        try {
          await SupabaseService.createOrder(newOrder);
        } catch (sbErr) {
          console.warn('Supabase order sync warning:', sbErr);
        }
      }

      // Clear cart
      setCart([]);
      setActiveOrderId(newOrder.id);
      setCurrentView('track');

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      return newOrder;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error placing order';
      setNotification({
        title: 'Order Failed',
        message: msg,
        type: 'info',
      });
      return null;
    }
  };

  // Update order status (Admin action)
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || 'canteen-admin-secret-2026',
        },
        body: JSON.stringify({ status, note }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedOrder = data.order;
        if (isSupabaseConfigured()) {
          try {
            await SupabaseService.updateOrderStatus(orderId, status, updatedOrder.history);
          } catch (sbErr) {
            console.warn('Supabase status sync warning:', sbErr);
          }
        }
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update status failed:', err);
      return false;
    }
  };

  // Reorder items from previous order
  const reorderItems = (order: Order) => {
    const newItems: CartItem[] = [];
    for (const oi of order.items) {
      const menuItem = menu.find((m) => m.id === oi.menuItemId);
      if (menuItem && menuItem.isAvailable) {
        newItems.push({ menuItem, quantity: oi.quantity });
      }
    }

    if (newItems.length === 0) {
      setNotification({
        title: 'Items Unavailable',
        message: 'The items in this order are currently out of stock.',
        type: 'info',
      });
      return;
    }

    setCart(newItems);
    setCurrentView('cart');
    setNotification({
      title: 'Cart Restored',
      message: `${newItems.length} items loaded into your cart from Token #${order.pickupToken}.`,
      type: 'success',
    });
  };

  // Menu Admin Operations
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || 'canteen-admin-secret-2026',
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (isSupabaseConfigured()) {
          try {
            await SupabaseService.updateMenuItem(id, updates);
          } catch (sbErr) {
            console.warn('Supabase updateMenuItem warning:', sbErr);
          }
        }
        setMenu((prev) => prev.map((m) => (m.id === id ? data.item : m)));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update menu item:', err);
      return false;
    }
  };

  const addMenuItem = async (
    item: Omit<MenuItem, 'id' | 'rating' | 'ratingCount'>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || 'canteen-admin-secret-2026',
        },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const data = await res.json();
        if (isSupabaseConfigured()) {
          try {
            await SupabaseService.addMenuItem(item);
          } catch (sbErr) {
            console.warn('Supabase addMenuItem warning:', sbErr);
          }
        }
        setMenu((prev) => [data.item, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to add menu item:', err);
      return false;
    }
  };

  const deleteMenuItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken || 'canteen-admin-secret-2026',
        },
      });

      if (res.ok) {
        if (isSupabaseConfigured()) {
          try {
            await SupabaseService.deleteMenuItem(id);
          } catch (sbErr) {
            console.warn('Supabase deleteMenuItem warning:', sbErr);
          }
        }
        setMenu((prev) => prev.filter((m) => m.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      return false;
    }
  };

  // Canteen settings
  const updateCanteenStatus = async (updates: Partial<CanteenStatus>): Promise<boolean> => {
    try {
      const res = await fetch('/api/canteen/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken || 'canteen-admin-secret-2026',
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (isSupabaseConfigured()) {
          try {
            await SupabaseService.updateCanteenStatus(updates);
          } catch (sbErr) {
            console.warn('Supabase updateCanteenStatus warning:', sbErr);
          }
        }
        setCanteenStatus(data.canteenStatus);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update canteen status:', err);
      return false;
    }
  };

  // Reset Demo Data
  const resetDemoData = async () => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        await refreshMenu();
        await refreshOrders();
        await refreshCanteenStatus();
        setNotification({
          title: 'Demo Data Reset',
          message: 'Menu, kitchen queue, and initial orders have been reset.',
          type: 'info',
        });
      }
    } catch (err) {
      console.error('Reset demo error:', err);
    }
  };

  const clearNotification = () => setNotification(null);

  return (
    <AppContext.Provider
      value={{
        user,
        adminToken,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        loginCustom,
        logout,
        currentView,
        setCurrentView,
        menu,
        menuLoading,
        refreshMenu,
        updateMenuItem,
        addMenuItem,
        deleteMenuItem,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTax,
        cartServiceFee,
        cartTotal,
        cartItemCount,
        orders,
        studentOrders,
        activeOrder,
        activeOrderId,
        setActiveOrderId,
        refreshOrders,
        placeOrder,
        updateOrderStatus,
        reorderItems,
        canteenStatus,
        refreshCanteenStatus,
        updateCanteenStatus,
        notification,
        clearNotification,
        resetDemoData,
        isAuthModalOpen,
        setAuthModalOpen,
        isCartDrawerOpen,
        setCartDrawerOpen,
        isSupabaseGuideOpen,
        setSupabaseGuideOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
