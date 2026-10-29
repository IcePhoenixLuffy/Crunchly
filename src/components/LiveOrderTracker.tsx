import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Order } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Flame,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

const STAGES: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'PLACED', label: 'Order Placed', description: 'Received in kitchen queue' },
  { status: 'CONFIRMED', label: 'Payment Confirmed', description: 'Queued for prep' },
  { status: 'PREPARING', label: 'Preparing Food', description: 'Chef is cooking hot' },
  { status: 'READY', label: 'Ready for Pickup', description: 'Hot on Counter #2' },
  { status: 'COLLECTED', label: 'Collected', description: 'Enjoy your meal!' },
];

export const LiveOrderTracker: React.FC = () => {
  const {
    orders,
    studentOrders,
    activeOrderId,
    setActiveOrderId,
    setCurrentView,
    updateOrderStatus,
  } = useApp();

  const [copiedToken, setCopiedToken] = useState(false);

  // If no specific active order, pick the first one
  const currentOrder: Order | undefined =
    orders.find((o) => o.id === activeOrderId) || studentOrders[0] || orders[0];

  if (!currentOrder) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">No Active Orders Found</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          You haven&apos;t placed any orders today yet. Browse our campus menu and order ahead to skip queues.
        </p>
        <button
          onClick={() => setCurrentView('menu')}
          className="mt-5 px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#16423C]"
        >
          Browse Canteen Menu
        </button>
      </div>
    );
  }

  // Calculate current stage index
  const stageOrder: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COLLECTED'];
  const currentStageIndex = stageOrder.indexOf(currentOrder.orderStatus);

  const isCancelled = currentOrder.orderStatus === 'CANCELLED';
  const isReady = currentOrder.orderStatus === 'READY';
  const isCollected = currentOrder.orderStatus === 'COLLECTED';

  const copyToken = () => {
    navigator.clipboard?.writeText(currentOrder.pickupToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner & Multi-Order Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-stone-900">Live Order Tracking</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time status synced directly with the kitchen prep station.
          </p>
        </div>

        {/* Switcher if user has multiple orders */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Tracking:</span>
            <select
              value={currentOrder.id}
              onChange={(e) => setActiveOrderId(e.target.value)}
              className="font-bold text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-[#12372A] focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Token #{o.pickupToken} ({o.orderStatus})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hero Pickup Token Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all ${
          isReady
            ? 'bg-gradient-to-br from-emerald-800 to-teal-900 ring-4 ring-emerald-500/50 animate-pulse-subtle'
            : isCancelled
            ? 'bg-stone-800'
            : isCollected
            ? 'bg-stone-700'
            : 'bg-gradient-to-br from-[#12372A] to-[#1E4D3A]'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isReady
                  ? 'HOT & READY FOR PICKUP AT COUNTER #2!'
                  : isCollected
                  ? 'Order Completed · Thank you!'
                  : isCancelled
                  ? 'Order Cancelled'
                  : 'Canteen Kitchen In Progress'}
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-200/80 font-bold block">
                Your Contactless Pickup Token
              </span>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                  {currentOrder.pickupToken}
                </span>
                <button
                  onClick={copyToken}
                  className="bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copiedToken ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-emerald-100/90 font-medium pt-1">
              <span>Student: {currentOrder.studentName}</span>
              <span>·</span>
              <span>Roll: {currentOrder.studentRoll}</span>
              <span>·</span>
              <span>Slot: {currentOrder.pickupSlot}</span>
            </div>
          </div>

          {/* QR Code Pass Box for Counter Scanner */}
          <div className="bg-white p-4 rounded-2xl shadow-lg text-stone-900 flex flex-col items-center text-center w-48 flex-shrink-0">
            <div className="w-32 h-32 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center p-2 mb-2">
              {/* Dynamic SVG QR Matrix */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900">
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                {/* QR Position Finder Markers */}
                <rect x="10" y="10" width="25" height="25" fill="#12372A" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#12372A" />

                <rect x="65" y="10" width="25" height="25" fill="#12372A" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#12372A" />

                <rect x="10" y="65" width="25" height="25" fill="#12372A" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#12372A" />

                {/* Simulated Data Matrix Modules */}
                <rect x="40" y="15" width="6" height="6" fill="#12372A" />
                <rect x="50" y="20" width="6" height="6" fill="#12372A" />
                <rect x="42" y="35" width="8" height="8" fill="#12372A" />
                <rect x="60" y="45" width="6" height="6" fill="#12372A" />
                <rect x="70" y="55" width="8" height="8" fill="#12372A" />
                <rect x="45" y="65" width="6" height="6" fill="#12372A" />
                <rect x="65" y="75" width="6" height="6" fill="#12372A" />
                <rect x="80" y="80" width="8" height="8" fill="#12372A" />
                <rect x="25" y="45" width="6" height="6" fill="#12372A" />
                <rect x="15" y="52" width="6" height="6" fill="#12372A" />
                <rect x="52" y="80" width="6" height="6" fill="#12372A" />
              </svg>
            </div>
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Scan at Counter #2
            </span>
            <span className="text-xs font-black text-stone-900 font-mono mt-0.5">
              {currentOrder.id.slice(0, 11)}
            </span>
          </div>
        </div>
      </div>

      {/* Live Estimated Queue Status Bar */}
      {!isCollected && !isCancelled && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-stone-400 font-semibold uppercase">Estimated Ready By</p>
              <p className="text-base font-extrabold text-stone-900">
                {currentOrder.estimatedReadyTime}{' '}
                <span className="text-xs font-normal text-stone-500">(Estimate)</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-stone-400 font-semibold uppercase">Live Queue Position</p>
              <p className="text-base font-extrabold text-emerald-800">
                {isReady
                  ? 'Now Serving You!'
                  : currentOrder.queuePosition > 0
                  ? `#${currentOrder.queuePosition} in line`
                  : 'Preparing now'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-stone-400 font-semibold uppercase">Payment Status</p>
              <p className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
                <span>{currentOrder.paymentStatus}</span>
                <span className="text-xs font-semibold text-stone-500 uppercase">
                  ({currentOrder.paymentMethod})
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5-Step Progress Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-stone-900 mb-6 uppercase tracking-wider">
          Order Progress Flow
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <span className="font-bold">This order was cancelled.</span>
              <p className="text-[11px] mt-0.5">
                If payment was deducted via UPI, automatic refund is processed within 15 minutes.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline horizontal connector line (desktop) */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-stone-100 -z-0">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
              {STAGES.map((st, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={st.status}
                    className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                  >
                    {/* Step Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm flex-shrink-0 ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#12372A] text-amber-300 ring-4 ring-emerald-100 scale-110'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="sm:mt-2 text-left sm:text-center">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-[#12372A] font-extrabold'
                            : isPassed
                            ? 'text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {st.label}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5 hidden sm:block">
                        {st.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Ordered Items Breakdown & Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-stone-900 text-sm">Ordered Items</h3>
            <span className="text-xs text-stone-500 font-medium">
              {currentOrder.items.length} dishes
            </span>
          </div>

          <div className="divide-y divide-stone-100 space-y-2">
            {currentOrder.items.map((it, idx) => (
              <div key={idx} className="pt-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      it.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                  <span className="font-bold text-stone-800">
                    {it.quantity}x {it.name}
                  </span>
                </div>
                <span className="font-extrabold text-stone-900">
                  {formatINR(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>

          {currentOrder.specialInstructions && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 mt-3">
              <span className="font-bold">Special Note to Kitchen: </span>
              <span>{currentOrder.specialInstructions}</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-sm font-extrabold text-[#12372A]">
            <span>Total Paid</span>
            <span>{formatINR(currentOrder.totalAmount)}</span>
          </div>
        </div>

        {/* Counter Instructions & Quick Actions */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm">Pickup Instructions</h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Wait in your classroom, library, or campus quad until the status turns{' '}
                  <strong className="text-emerald-700">&quot;Ready for Pickup&quot;</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Walk over to <strong>Counter #2 (Digital Express Counter)</strong> at the Central Food Court.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Show Token <strong className="font-mono text-stone-900">#{currentOrder.pickupToken}</strong> or let the staff scan your digital pass QR code.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Simulator Buttons */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Demo Quick Action:</span>
            </div>

            {isReady && (
              <button
                onClick={() => updateOrderStatus(currentOrder.id, 'COLLECTED', 'Collected by student')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Food Pickup (Mark Collected)</span>
              </button>
            )}

            {!isReady && !isCollected && !isCancelled && (
              <button
                onClick={() => updateOrderStatus(currentOrder.id, 'READY', 'Marked ready by kitchen staff')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ChefHat className="w-4 h-4 text-amber-300" />
                <span>Fast-forward to &quot;Ready for Pickup&quot;</span>
              </button>
            )}

            {isCollected && (
              <p className="text-xs text-emerald-800 font-semibold text-center py-1">
                Food has been collected. Bon appétit!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
