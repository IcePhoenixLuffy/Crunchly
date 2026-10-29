import React from 'react';
import { useApp } from '../context/AppContext';
import { FoodCard } from './FoodCard';
import {
  Utensils,
  Clock,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Smartphone,
  ChevronRight,
  TrendingDown,
  CheckCircle,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

export const HomePage: React.FC = () => {
  const { menu, setCurrentView, canteenStatus, activeOrder } = useApp();

  const popularItems = menu.filter((i) => i.popular && i.isAvailable).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#12372A] to-[#1A4535] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Brand Kicker / Tagline Badge & Live Queue Status */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="bg-[#EA580C] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Munchly
              </span>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {canteenStatus.isOpen && canteenStatus.acceptingOrders
                    ? `Central Canteen Open · ${canteenStatus.currentActiveOrders} Orders in Prep · Avg Wait ~${canteenStatus.averageWaitMinutes}m`
                    : 'Canteen Paused'}
                </span>
              </div>
            </div>

            {/* Core Headline with Tagline */}
            <div>
              <p className="text-amber-300 font-extrabold text-sm uppercase tracking-widest mb-2 flex items-center justify-center lg:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Your Hunger, Handled.</span>
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Skip the Queue. <br />
                <span className="text-[#EA580C]">Enjoy Your Break.</span>
              </h1>
            </div>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Meet <strong>Munchly</strong> — your smart campus canteen platform. Order your campus favourites online and pick them up hot when they&apos;re ready. No more crowded counters, lost break time, or paper tokens.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => setCurrentView('menu')}
                className="px-7 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#c2410c] text-white font-extrabold text-sm flex items-center gap-2 shadow-lg hover:shadow-orange-900/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {activeOrder && activeOrder.orderStatus !== 'COLLECTED' ? (
                <button
                  onClick={() => setCurrentView('track')}
                  className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-md border border-white/20 transition-all"
                >
                  <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Track Token #{activeOrder.pickupToken}</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentView('menu')}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
                >
                  View Food Menu
                </button>
              )}
            </div>

            {/* Micro value tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-emerald-200/80 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant UPI & QR Scan</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Guaranteed Hot Food</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero Counter Crowding</span>
              </span>
            </div>
          </div>

          {/* Right Hero Visual: Interactive Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border border-stone-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#12372A] flex items-center justify-center text-white">
                    <Utensils className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Express Pickup Pass
                    </span>
                    <span className="text-[10px] text-stone-400">Campus Express Counter #2</span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ready in ~6m
                </span>
              </div>

              {/* Token Showcase */}
              <div className="bg-[#12372A] p-4 rounded-2xl text-center text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                  Contactless Pickup Token
                </span>
                <p className="text-4xl font-black font-mono tracking-tight text-white">
                  CB-104
                </p>
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  Masala Dosa · Special Kulhad Chai
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Student Name:</span>
                  <span className="font-bold text-stone-900">Aarav Sharma</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Slot Scheduled:</span>
                  <span className="font-bold text-stone-900">12:45 PM Lunch Break</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Payment Verified:</span>
                  <span className="font-bold text-emerald-700">₹86 via UPI</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <button
                  onClick={() => setCurrentView('menu')}
                  className="w-full py-2.5 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Order Your Tray Now</span>
                  <ChevronRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process: How Munchly Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#EA580C]">
            Simple 3-Step Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#12372A] tracking-tight">
            How Munchly Canteen Pickup Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Engineered to turn 20-minute cafeteria wait times into a smooth 30-second grab-and-go pickup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-sm relative group hover:border-emerald-600/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base mb-5 shadow-xs">
              01
            </div>
            <h3 className="text-base font-extrabold text-stone-900 mb-2">
              Browse Menu & Customize
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore freshly cooked breakfast items, wholesome thalis, rolls, and beverages with live preparation time estimates and stock status.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-sm relative group hover:border-emerald-600/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-base mb-5 shadow-xs">
              02
            </div>
            <h3 className="text-base font-extrabold text-stone-900 mb-2">
              Select Slot & Pay Digitally
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Choose your ideal recess slot (e.g. 12:45 PM lunch break) and complete payment using UPI, GPay, QR code, card, or cash fallback.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-7 rounded-3xl border border-stone-200/90 shadow-sm relative group hover:border-emerald-600/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base mb-5 shadow-xs">
              03
            </div>
            <h3 className="text-base font-extrabold text-stone-900 mb-2">
              Collect with Token at Counter
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Track live queue progress from your lecture hall. Walk straight to Counter #2 when notified, show your digital token, and enjoy.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Campus Specials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#EA580C]">
              Most Popular Dishes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#12372A] tracking-tight mt-0.5">
              Campus Student Favourites
            </h2>
          </div>

          <button
            onClick={() => setCurrentView('menu')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            <span>View Complete Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Core Innovation & Problem Solving Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#EA580C]">
              The Problem We Solve
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#12372A] tracking-tight">
              Tired of 20-minute canteen lines cutting into your 30-minute break?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              During peak lunch bells, hundreds of students converge simultaneously on single canteen cash counters. Munchly levels demand through intelligent queue allocation, pre-scheduled pickup slots, and real-time kitchen orchestration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#FBF9F5] rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">
                  ⏱ Queue-Aware Preparation
                </span>
                <p className="text-stone-500 text-[11px]">
                  Estimated wait times are dynamically calculated based on current orders in the kitchen.
                </p>
              </div>

              <div className="p-3 bg-[#FBF9F5] rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">
                  ⚡ Kitchen Throttle Protection
                </span>
                <p className="text-stone-500 text-[11px]">
                  Staff can set maximum capacity limits to guarantee orders remain hot and prepared accurately.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FBF9F5] p-6 rounded-2xl border border-stone-200/80 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#12372A] text-white flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6 text-amber-300" />
            </div>
            <h4 className="font-black text-stone-900 text-base">
              Ready to try the Express Experience?
            </h4>
            <p className="text-xs text-stone-500">
              Pick your food now, schedule for lunch break, and pick up without delay.
            </p>
            <button
              onClick={() => setCurrentView('menu')}
              className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs transition-colors shadow-sm"
            >
              Start Ordering Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
