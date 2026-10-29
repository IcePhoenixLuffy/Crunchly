import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

interface CartDrawerProps {
  onProceedToCheckout: (slot: string, notes: string) => void;
}

export const PICKUP_SLOTS = [
  'Immediate (Next 10-15 mins)',
  '12:45 PM - 01:00 PM (Lunch Break 1)',
  '01:00 PM - 01:15 PM (Lunch Break 2)',
  '01:15 PM - 01:30 PM (Lunch Break 3)',
  '03:45 PM - 04:00 PM (Tea & Snacks)',
  '05:00 PM - 05:15 PM (Evening Pickup)',
];

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartTax,
    cartServiceFee,
    cartTotal,
    isCartDrawerOpen,
    setCartDrawerOpen,
    setCurrentView,
  } = useApp();

  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isCartDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FBF9F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#12372A] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-stone-900">Your Food Tray</h2>
                <p className="text-xs text-stone-500">
                  {cart.length === 0
                    ? 'Tray is empty'
                    : `${cart.length} unique ${cart.length === 1 ? 'item' : 'items'}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-stone-200/70 text-stone-500 flex items-center justify-center transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-base">Your tray is empty</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    Browse today&apos;s campus specials and add fresh snacks or lunch meals to your tray.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setCurrentView('menu');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#16423C] transition-colors"
                >
                  Explore Food Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                  <span className="font-semibold text-stone-700">Tray Items</span>
                  <button
                    onClick={clearCart}
                    className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Tray</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((ci) => (
                    <div
                      key={ci.menuItem.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-100 bg-[#FBF9F5]/70 hover:bg-[#FBF9F5] transition-colors"
                    >
                      <img
                        src={ci.menuItem.imageUrl}
                        alt={ci.menuItem.name}
                        className="w-14 h-14 rounded-lg object-cover bg-stone-200 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ci.menuItem.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          <h4 className="font-bold text-xs text-stone-900 truncate">
                            {ci.menuItem.name}
                          </h4>
                        </div>
                        <p className="text-xs font-extrabold text-[#12372A] mt-0.5">
                          {formatINR(ci.menuItem.price * ci.quantity)}
                        </p>
                        <span className="text-[10px] text-stone-400">
                          {formatINR(ci.menuItem.price)} each
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white border border-stone-300 rounded-lg overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(ci.menuItem.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                          aria-label={`Decrease ${ci.menuItem.name}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-800">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(ci.menuItem.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                          aria-label={`Increase ${ci.menuItem.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(ci.menuItem.id)}
                        className="text-stone-300 hover:text-red-500 p-1"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pickup Slot Selection */}
                <div className="pt-2">
                  <label
                    htmlFor="pickup-slot-select"
                    className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Choose Pickup Time Slot:</span>
                  </label>
                  <select
                    id="pickup-slot-select"
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {PICKUP_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Special Instructions */}
                <div>
                  <label
                    htmlFor="special-instructions"
                    className="block text-xs font-bold text-stone-800 mb-1"
                  >
                    Special Cooking / Allergy Notes:
                  </label>
                  <textarea
                    id="special-instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Less spicy, extra paper napkins, no onions..."
                    rows={2}
                    maxLength={150}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-stone-800"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer & Price Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-100 bg-[#FBF9F5] space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Campus GST (5%)</span>
                  <span className="font-semibold text-stone-900">{formatINR(cartTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Token & Queue Maintenance</span>
                  <span className="font-semibold text-stone-900">{formatINR(cartServiceFee)}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-extrabold text-[#12372A]">
                  <span>Total Amount</span>
                  <span>{formatINR(cartTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero wait pickup · QR token verified at counter</span>
              </div>

              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  onProceedToCheckout(pickupSlot, specialInstructions);
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
