import React from 'react';
import { MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { X, Clock, Flame, Star, Plus, Minus, Check } from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose }) => {
  const { cart, addToCart, updateCartQuantity } = useApp();

  if (!item) return null;

  const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-food-title"
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative aspect-video w-full bg-stone-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/70 text-white flex items-center justify-center hover:bg-stone-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-lg text-xs font-bold text-[#12372A] shadow-sm flex items-center gap-2">
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <span>{item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-food-title" className="text-xl font-extrabold text-stone-900">
                {item.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Prep: ~{item.prepTimeMinutes} mins</span>
                </span>
                {item.calories && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{item.calories} kcal</span>
                    </span>
                  </>
                )}
                {item.rating && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating} ({item.ratingCount || 100}+ ratings)</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-2xl font-black text-[#12372A]">
              {formatINR(item.price)}
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
            {item.description}
          </p>

          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 text-xs text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">Campus Kitchen Standards:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cooked fresh to order</span>
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero single-use plastic</span>
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hot pickup guaranteed</span>
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>FSSAI Hygiene Grade A</span>
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-stone-100">
            <div>
              <span className="text-xs text-stone-400 block font-medium">Tray Quantity</span>
              <div className="flex items-center gap-2 mt-1">
                {currentQty > 0 ? (
                  <div className="flex items-center bg-emerald-50 border border-emerald-600 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="w-9 h-9 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-emerald-950">
                      {currentQty}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="w-9 h-9 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item, 1)}
                    disabled={!item.isAvailable}
                    className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Add to Tray ({formatINR(item.price)})</span>
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
