import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, FoodCategory } from '../types';
import { Plus, Trash2, Edit2, Check, X, Clock, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

export const AdminMenuManager: React.FC = () => {
  const { menu, updateMenuItem, addMenuItem, deleteMenuItem } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editPrepTime, setEditPrepTime] = useState<number>(5);

  // New Dish Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('60');
  const [newCategory, setNewCategory] = useState<FoodCategory>('Snacks');
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [newPrepTime, setNewPrepTime] = useState('6');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleStartEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditPrice(item.price);
    setEditPrepTime(item.prepTimeMinutes);
  };

  const handleSaveEdit = async (id: string) => {
    await updateMenuItem(id, {
      price: Number(editPrice),
      prepTimeMinutes: Number(editPrepTime),
    });
    setEditingId(null);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await updateMenuItem(item.id, {
      isAvailable: !item.isAvailable,
    });
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    await addMenuItem({
      name: newName.trim(),
      description: newDesc.trim() || 'Freshly made canteen special prepared to order.',
      price: Number(newPrice),
      category: newCategory,
      isVeg: newIsVeg,
      isAvailable: true,
      prepTimeMinutes: Number(newPrepTime) || 5,
      imageUrl:
        newImageUrl.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      popular: false,
      recommended: false,
      calories: 320,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewDesc('');
    setNewPrice('60');
    setNewImageUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200">
        <div>
          <h2 className="text-lg font-black text-stone-900">Campus Canteen Menu Management</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Toggle item availability in real time to prevent long queues for sold-out dishes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Menu Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Diet</th>
                <th className="py-3 px-4">Price (₹)</th>
                <th className="py-3 px-4">Prep Time</th>
                <th className="py-3 px-4">Kitchen Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {menu.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Dish Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-[10px] text-stone-400 line-clamp-1 max-w-xs">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-stone-700">
                      {item.category}
                    </td>

                    {/* Diet */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.isVeg
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-stone-300 rounded text-xs font-bold"
                          min={5}
                        />
                      ) : (
                        <span className="font-black text-[#12372A] text-sm">
                          {formatINR(item.price)}
                        </span>
                      )}
                    </td>

                    {/* Prep Time */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrepTime}
                          onChange={(e) => setEditPrepTime(Number(e.target.value))}
                          className="w-16 px-2 py-1 border border-stone-300 rounded text-xs"
                          min={1}
                        />
                      ) : (
                        <span className="text-stone-600 font-medium">
                          ~{item.prepTimeMinutes} mins
                        </span>
                      )}
                    </td>

                    {/* Availability Switch */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Click to toggle in-stock / sold-out status"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-emerald-600' : 'bg-stone-400'
                          }`}
                        />
                        <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
                            title="Edit price and prep time"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.name}" from canteen menu?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Dish Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">Add New Canteen Dish</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schezwan Fried Rice"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients and serving details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FoodCategory)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Meals">Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Estimated Prep (mins)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={newPrepTime}
                    onChange={(e) => setNewPrepTime(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Diet Classification</label>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setNewIsVeg(true)}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                        newIsVeg ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIsVeg(false)}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs ${
                        !newIsVeg ? 'bg-red-700 text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
