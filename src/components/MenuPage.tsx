import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCategory, MenuItem } from '../types';
import { FoodCard } from './FoodCard';
import { FoodDetailModal } from './FoodDetailModal';
import {
  Search,
  Filter,
  Leaf,
  Sparkles,
  ArrowUpDown,
  UtensilsCrossed,
} from 'lucide-react';

const CATEGORIES: ('All' | FoodCategory)[] = [
  'All',
  'Breakfast',
  'Meals',
  'Snacks',
  'Beverages',
  'Desserts',
];

export const MenuPage: React.FC = () => {
  const { menu, menuLoading } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'All' | FoodCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'prep-time'>('popular');
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);

  // Filter & Sort Logic
  const filteredAndSortedMenu = useMemo(() => {
    return menu
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Veg only toggle
        if (vegOnly && !item.isVeg) {
          return false;
        }
        // Search query
        if (
          searchQuery.trim() &&
          !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'prep-time') return a.prepTimeMinutes - b.prepTimeMinutes;
        // Default: popularity
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
  }, [menu, selectedCategory, vegOnly, searchQuery, sortBy]);

  // Featured recommendations
  const recommendedItems = useMemo(
    () => menu.filter((item) => item.recommended && item.isAvailable).slice(0, 3),
    [menu]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#EA580C]">
            Campus Kitchen Menu
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#12372A] tracking-tight mt-0.5">
            Order Ahead · Skip the Counter Line
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            All meals prepared freshly at the North Campus Canteen with contactless digital pickup tokens.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search dosa, thali, chai, sandwiches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
          />
        </div>
      </div>

      {/* Recommended Section (shown when no specific search is active) */}
      {!searchQuery && selectedCategory === 'All' && recommendedItems.length > 0 && (
        <div className="bg-[#12372A]/5 p-6 rounded-3xl border border-emerald-950/10 space-y-4">
          <div className="flex items-center gap-2 text-[#12372A]">
            <Sparkles className="w-4 h-4 text-[#EA580C]" />
            <h2 className="font-extrabold text-sm uppercase tracking-wide">
              Chef&apos;s Recommended Specials Today
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedItems.map((item) => (
              <FoodCard
                key={`rec-${item.id}`}
                item={item}
                onOpenDetail={setSelectedDetailItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter and Category Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
          {/* Category Tabs (Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#12372A] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right Filters: Veg Only Toggle & Sort Dropdown */}
          <div className="flex items-center gap-3">
            {/* Veg only switch */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                vegOnly
                  ? 'bg-emerald-100/70 border-emerald-600 text-emerald-900'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <Leaf
                className={`w-3.5 h-3.5 ${
                  vegOnly ? 'text-emerald-700' : 'text-stone-400'
                }`}
              />
              <span>Veg Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'prep-time'
                  )
                }
                className="bg-transparent text-stone-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="popular">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="prep-time">Fastest Prep Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-stone-500 font-medium flex items-center justify-between">
          <span>
            Showing <strong className="text-stone-800">{filteredAndSortedMenu.length}</strong>{' '}
            {filteredAndSortedMenu.length === 1 ? 'dish' : 'dishes'}
          </span>
          {vegOnly && (
            <span className="text-emerald-700 font-semibold">
              Filtered for 100% Vegetarian
            </span>
          )}
        </div>
      </div>

      {/* Food Grid */}
      {menuLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-stone-200 h-64 animate-pulse p-4 space-y-3"
            >
              <div className="w-full h-32 bg-stone-100 rounded-xl" />
              <div className="w-3/4 h-4 bg-stone-100 rounded" />
              <div className="w-1/2 h-3 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedMenu.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-16 text-center text-stone-500 space-y-3 max-w-md mx-auto">
          <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-extrabold text-stone-800">No dishes found</h3>
          <p className="text-xs text-stone-400">
            No menu items match your search &ldquo;{searchQuery}&rdquo; or filter settings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setVegOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedMenu.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onOpenDetail={setSelectedDetailItem}
            />
          ))}
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDetailItem && (
        <FoodDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}
    </div>
  );
};
