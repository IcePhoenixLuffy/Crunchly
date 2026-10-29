import React from 'react';
import { MenuItem } from '../types';
import { useApp } from '../context/AppContext';
import { Clock, Plus, Minus, Star, Flame } from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

interface FoodCardProps {
  item: MenuItem;
  onOpenDetail?: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onOpenDetail }) => {
  const { cart, addToCart, updateCartQuantity } = useApp();

  const cartItem = cart.find((ci) => ci.menuItem.id === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
        !item.isAvailable ? 'opacity-75 grayscale-[20%]' : ''
      }`}
    >
      <div>
        {/* Card Image Container */}
        <div
          onClick={() => onOpenDetail && onOpenDetail(item)}
          className="relative aspect-video w-full overflow-hidden bg-stone-100 cursor-pointer group"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // fallback to clean food placeholder
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Sold out overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
              <span className="bg-stone-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-700 uppercase tracking-wider">
                Sold Out Today
              </span>
            </div>
          )}

          {/* Dietary Emblem (FSSAI green box/circle) */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm border border-stone-200 flex items-center justify-center">
            {item.isVeg ? (
              <div
                className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center rounded-sm"
                title="100% Vegetarian"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600" />
              </div>
            ) : (
              <div
                className="w-4 h-4 border-2 border-amber-800 flex items-center justify-center rounded-sm"
                title="Non-Vegetarian"
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-amber-800" />
              </div>
            )}
          </div>

          {/* Quick Badges: Popular / Recommended */}
          {(item.popular || item.recommended) && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
              {item.popular && (
                <span className="bg-[#12372A]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  ★ Popular
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onOpenDetail && onOpenDetail(item)}
              className="font-bold text-base text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer leading-snug"
            >
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {/* Clean metadata without pill capsules (zero-pill discipline) */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium mb-3">
            <span className="flex items-center gap-1 text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>~{item.prepTimeMinutes} mins</span>
            </span>

            {item.calories && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 text-stone-500">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{item.calories} kcal</span>
                </span>
              </>
            )}

            {item.rating && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Price & Add to Cart Controls */}
      <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <div className="text-lg font-extrabold text-[#12372A]">
            {formatINR(item.price)}
          </div>
          <span className="text-[10px] text-stone-400 font-medium block">
            incl. campus taxes
          </span>
        </div>

        {item.isAvailable ? (
          currentQty > 0 ? (
            <div className="flex items-center bg-emerald-50 border border-emerald-600 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => updateCartQuantity(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition-colors"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-bold text-emerald-950">
                {currentQty}
              </span>
              <button
                onClick={() => updateCartQuantity(item.id, 1)}
                className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition-colors"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item)}
              className="px-3.5 py-2 rounded-xl bg-[#12372A] hover:bg-[#16423C] active:bg-[#0f2e23] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label={`Add ${item.name} to cart for ${formatINR(item.price)}`}
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Add</span>
            </button>
          )
        ) : (
          <button
            disabled
            className="px-3.5 py-2 rounded-xl bg-stone-200 text-stone-400 text-xs font-semibold cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};
