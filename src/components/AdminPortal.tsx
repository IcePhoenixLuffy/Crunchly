import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminKitchenQueue } from './AdminKitchenQueue';
import { AdminMenuManager } from './AdminMenuManager';
import { AdminAnalyticsView } from './AdminAnalyticsView';
import { ChefHat, Utensils, BarChart3, ShieldAlert, LogIn } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, loginAsDemoAdmin, setAuthModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'queue' | 'menu' | 'analytics'>('queue');

  // Role-based protection: if not logged in as admin, show secure access wall
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900">Canteen Staff Only</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          Access to kitchen order fulfillment, order queue state machines, and menu pricing controls is restricted to canteen operators.
        </p>

        <div className="pt-3 space-y-2">
          <button
            onClick={loginAsDemoAdmin}
            className="w-full py-3 px-4 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <ChefHat className="w-4 h-4 text-amber-300" />
            <span>Unlock Canteen Staff Demo (Chef Raman)</span>
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-stone-500" />
            <span>Sign In with Staff Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              Staff Portal
            </span>
            <h1 className="text-2xl font-black text-[#12372A] tracking-tight">
              Canteen Operations Dashboard
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Logged in as <strong className="text-stone-800">{user.name}</strong> ({user.department})
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-white text-[#12372A] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-white text-[#12372A] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menu & Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-white text-[#12372A] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Flow</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'queue' && <AdminKitchenQueue />}
      {activeTab === 'menu' && <AdminMenuManager />}
      {activeTab === 'analytics' && <AdminAnalyticsView />}
    </div>
  );
};
