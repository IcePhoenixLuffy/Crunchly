import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoSwitcherBar } from './components/DemoSwitcherBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { MenuPage } from './components/MenuPage';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { OrderHistoryView } from './components/OrderHistoryView';
import { AdminPortal } from './components/AdminPortal';
import { CartDrawer, PICKUP_SLOTS } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { CustomCursor } from './components/CustomCursor';
import { X, Sparkles, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentView,
    notification,
    clearNotification,
    setCurrentView,
    isSupabaseGuideOpen,
    setSupabaseGuideOpen,
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSlot, setCheckoutSlot] = useState(PICKUP_SLOTS[0]);
  const [checkoutNotes, setCheckoutNotes] = useState('');

  const handleProceedToCheckout = (slot: string, notes: string) => {
    setCheckoutSlot(slot);
    setCheckoutNotes(notes);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900">
      {/* 0. Interactive Custom Cursor */}
      <CustomCursor />

      {/* 1. Demo Mode Judge Switcher Bar */}
      <DemoSwitcherBar />

      {/* 2. Main Navigation Bar */}
      <Navbar />

      {/* 3. In-App Real-Time Notification Banner */}
      {notification && (
        <div
          className={`sticky top-18 z-40 px-4 py-3 border-b text-xs flex items-center justify-between transition-all animate-in slide-in-from-top-2 ${
            notification.type === 'ready'
              ? 'bg-emerald-700 text-white border-emerald-800'
              : notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-stone-900 text-white border-stone-800'
          }`}
          role="alert"
        >
          <div className="max-w-7xl mx-auto flex-1 flex items-center gap-2.5">
            {notification.type === 'ready' ? (
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin flex-shrink-0" />
            ) : notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <div>
              <span className="font-extrabold mr-1.5">{notification.title}:</span>
              <span>{notification.message}</span>
            </div>
            {notification.type === 'ready' && (
              <button
                onClick={() => {
                  clearNotification();
                  setCurrentView('track');
                }}
                className="ml-auto underline font-bold text-amber-300 hover:text-white text-xs mr-3"
              >
                View Pass
              </button>
            )}
          </div>
          <button
            onClick={clearNotification}
            className="text-stone-400 hover:text-white p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Active View Content */}
      <main className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'menu' && <MenuPage />}
        {currentView === 'cart' && <MenuPage />}
        {currentView === 'track' && <LiveOrderTracker />}
        {currentView === 'history' && <OrderHistoryView />}
        {currentView === 'admin' && <AdminPortal />}
      </main>

      {/* 5. Cart Slide Drawer */}
      <CartDrawer onProceedToCheckout={handleProceedToCheckout} />

      {/* 6. Checkout Flow Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pickupSlot={checkoutSlot}
        specialInstructions={checkoutNotes}
      />

      {/* 7. Student / Staff Authentication Modal */}
      <AuthModal />

      {/* 8. Supabase Connection Setup & Test Modal */}
      <SupabaseGuideModal
        isOpen={isSupabaseGuideOpen}
        onClose={() => setSupabaseGuideOpen(false)}
      />

      {/* 8. Collegiate Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
