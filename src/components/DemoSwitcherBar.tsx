import React from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Shield, RotateCcw, Sparkles, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const DemoSwitcherBar: React.FC = () => {
  const {
    user,
    loginAsDemoStudent,
    loginAsDemoAdmin,
    resetDemoData,
    canteenStatus,
    currentView,
    setCurrentView,
    setSupabaseGuideOpen,
  } = useApp();

  const isConnectedToSupabase = isSupabaseConfigured();

  return (
    <div className="bg-[#12372A] text-white border-b border-emerald-950/40 text-xs py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project identity & Live queue pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Munchly · Your Hunger, Handled.</span>
          </div>
          <span className="text-emerald-500/70 hidden sm:inline">|</span>
          <div className="flex items-center gap-2 text-emerald-100/90 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                canteenStatus.isOpen && canteenStatus.acceptingOrders
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-red-400'
              }`}
            />
            <span>
              {canteenStatus.isOpen && canteenStatus.acceptingOrders
                ? `Canteen Open · Kitchen Queue: ${canteenStatus.currentActiveOrders} orders (Avg wait ~${canteenStatus.averageWaitMinutes}m)`
                : 'Canteen Paused'}
            </span>
          </div>
        </div>

        {/* Right: Quick Persona Switcher for Judges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-emerald-300/80 text-[11px] font-medium hidden md:inline">
            Switch Persona:
          </span>

          <button
            onClick={loginAsDemoStudent}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              user?.role === 'student'
                ? 'bg-white text-[#12372A] font-semibold shadow-sm'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
            aria-label="Switch to Student Persona"
          >
            <Utensils className="w-3 h-3 text-orange-500" />
            <span>Student (Aarav)</span>
          </button>

          <button
            onClick={loginAsDemoAdmin}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              user?.role === 'admin'
                ? 'bg-amber-400 text-stone-900 font-bold shadow-sm'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800'
            }`}
            aria-label="Switch to Canteen Staff Persona"
          >
            <Shield className="w-3 h-3 text-amber-300" />
            <span>Canteen Staff (Chef Raman)</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-2 py-1 rounded text-xs font-medium ${
                currentView === 'admin'
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-200 hover:bg-emerald-900/40'
              }`}
            >
              Kitchen Board
            </button>
          )}

          <button
            onClick={() => setSupabaseGuideOpen(true)}
            title="Configure or test Supabase database connection"
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isConnectedToSupabase
                ? 'bg-emerald-800 text-emerald-100 border-emerald-600 hover:bg-emerald-700'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900'
            }`}
          >
            <Database className="w-3 h-3 text-amber-400" />
            <span>
              {isConnectedToSupabase ? 'Supabase: Connected' : 'Supabase: Configure'}
            </span>
          </button>

          <button
            onClick={resetDemoData}
            title="Reset menu items and demo queue state"
            className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 hover:text-white transition-colors flex items-center gap-1 ml-1 border border-emerald-800/40"
            aria-label="Reset demo state"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
