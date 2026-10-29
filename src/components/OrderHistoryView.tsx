import React from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import {
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

export const OrderHistoryView: React.FC = () => {
  const {
    studentOrders,
    reorderItems,
    setActiveOrderId,
    setCurrentView,
  } = useApp();

  if (studentOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">No Past Orders Yet</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Your order history and digital pickup receipts will be organized here.
        </p>
        <button
          onClick={() => setCurrentView('menu')}
          className="mt-5 px-6 py-2.5 rounded-xl bg-[#12372A] text-white text-xs font-bold hover:bg-[#16423C]"
        >
          Explore Food Menu
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'READY':
        return (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Ready for Pickup
          </span>
        );
      case 'PREPARING':
        return (
          <span className="text-[11px] font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-spin" />
            In Preparation
          </span>
        );
      case 'PLACED':
      case 'CONFIRMED':
        return (
          <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Queued
          </span>
        );
      case 'COLLECTED':
        return (
          <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Collected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[11px] font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-stone-900">Your Campus Order History</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View receipts, pickup tokens, and re-order previous meals in one click.
          </p>
        </div>
        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg">
          {studentOrders.length} {studentOrders.length === 1 ? 'Order' : 'Orders'} Total
        </span>
      </div>

      <div className="space-y-4">
        {studentOrders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 space-y-4 hover:border-stone-300 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-[#12372A] text-white px-3 py-1 rounded-xl font-mono font-extrabold text-sm shadow-xs">
                    {order.pickupToken}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Order #{order.id.slice(0, 11)}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-base font-black text-[#12372A]">
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                  {order.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          it.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span>
                        {it.quantity}x {it.name}
                      </span>
                    </span>
                  ))}
                </div>

                {order.specialInstructions && (
                  <p className="text-[11px] text-stone-500 italic">
                    Note: &ldquo;{order.specialInstructions}&rdquo;
                  </p>
                )}
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <div className="text-[11px] text-stone-400 font-medium">
                  Pickup Slot: <span className="text-stone-700 font-semibold">{order.pickupSlot}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveOrderId(order.id);
                      setCurrentView('track');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    <span>View Pass</span>
                  </button>

                  <button
                    onClick={() => reorderItems(order)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#12372A] hover:bg-[#16423C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
