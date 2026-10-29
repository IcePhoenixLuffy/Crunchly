import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const {
    user,
    logout,
    currentView,
    setCurrentView,
    cartItemCount,
    cartTotal,
    setCartDrawerOpen,
    activeOrder,
    setAuthModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const hasActiveOrder =
    activeOrder &&
    activeOrder.orderStatus !== 'COLLECTED' &&
    activeOrder.orderStatus !== 'CANCELLED';

  const navLinks: {
    label: string;
    view: 'home' | 'menu' | 'cart' | 'track' | 'history' | 'admin';
    highlight?: boolean;
  }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Menu', view: 'menu' },
    { label: 'Live Tracking', view: 'track', highlight: Boolean(hasActiveOrder) },
    { label: 'Order History', view: 'history' },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: 'Canteen Dashboard', view: 'admin' });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg p-1"
            aria-label="Munchly Home - Your Hunger, Handled."
          >
            <Logo size="md" showTagline={true} />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => setCurrentView(link.view)}
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#12372A] bg-emerald-100/50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Active order quick badge if student placed an order */}
          {hasActiveOrder && (
            <button
              onClick={() => setCurrentView('track')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold hover:bg-orange-100 transition-colors"
              aria-label="View Active Order"
            >
              <Clock className="w-3.5 h-3.5 text-orange-600 animate-spin" />
              <span>
                Token #{activeOrder?.pickupToken} ·{' '}
                <span className="capitalize">
                  {activeOrder?.orderStatus.toLowerCase().replace('_', ' ')}
                </span>
              </span>
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#12372A] text-white hover:bg-[#16423C] transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            aria-label={`Open shopping cart with ${cartItemCount} items`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#EA580C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-tight">
                {cartItemCount > 0 ? formatINR(cartTotal) : 'Your Tray'}
              </div>
              <div className="text-[10px] text-emerald-200/80 leading-none">
                {cartItemCount === 1 ? '1 item' : `${cartItemCount} items`}
              </div>
            </div>
          </button>

          {/* User Account Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-xs font-medium text-stone-700"
                aria-expanded={userDropdownOpen}
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="font-semibold text-stone-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    {user.rollNumber && (
                      <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        Roll: {user.rollNumber}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('history');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>My Past Orders</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setCurrentView('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>Admin Kitchen Portal</span>
                    </button>
                  )}

                  <div className="border-t border-stone-100 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FBF9F5] px-4 pt-3 pb-6 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => {
                setCurrentView(link.view);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between ${
                currentView === link.view
                  ? 'bg-emerald-100/60 text-[#12372A]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>{link.label}</span>
              {link.highlight && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">
                  Active
                </span>
              )}
            </button>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Sign Out ({user.name})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
