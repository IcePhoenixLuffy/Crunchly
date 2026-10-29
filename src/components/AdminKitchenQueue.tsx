import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChefHat,
  BellRing,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

export const AdminKitchenQueue: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.orderStatus === statusFilter;
  });

  const countByStatus = (status: OrderStatus) =>
    orders.filter((o) => o.orderStatus === status).length;

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200">
        <div>
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-700" />
            <span>Live Kitchen Order Queue</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Orders arrive here in chronological order. Update preparation stages to notify students in real time.
          </p>
        </div>

        {/* Status Filter Tabs (Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-[#12372A] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PLACED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'PLACED'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Placed ({countByStatus('PLACED')})
          </button>
          <button
            onClick={() => setStatusFilter('PREPARING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'PREPARING'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
            }`}
          >
            Preparing ({countByStatus('PREPARING')})
          </button>
          <button
            onClick={() => setStatusFilter('READY')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'READY'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Ready ({countByStatus('READY')})
          </button>
          <button
            onClick={() => setStatusFilter('COLLECTED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'COLLECTED'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Collected ({countByStatus('COLLECTED')})
          </button>
        </div>
      </div>

      {/* Queue Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <p className="font-bold text-stone-700 text-sm">No orders matching this filter</p>
          <p className="text-xs text-stone-400 mt-1">
            New orders from student devices will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const timeAgoMins = Math.max(
              0,
              Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
            );

            const isPendingAction =
              order.orderStatus === 'PLACED' || order.orderStatus === 'CONFIRMED';
            const isCooking = order.orderStatus === 'PREPARING';
            const isReadyForPickup = order.orderStatus === 'READY';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                  isReadyForPickup
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : isCooking
                    ? 'border-orange-400 ring-1 ring-orange-400/20'
                    : isPendingAction
                    ? 'border-blue-400'
                    : 'border-stone-200 opacity-90'
                }`}
              >
                {/* Header: Token, Time, Student */}
                <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-2xl font-black text-[#12372A] bg-stone-100 px-3 py-1 rounded-xl">
                        {order.pickupToken}
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-stone-900">
                          {order.studentName}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Roll: {order.studentRoll} · Slot: {order.pickupSlot}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                        isReadyForPickup
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCooking
                          ? 'bg-orange-100 text-orange-800'
                          : isPendingAction
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="block text-[11px] text-stone-400 mt-1 font-medium">
                      {timeAgoMins} mins ago
                    </span>
                  </div>
                </div>

                {/* Ordered Items Checklist */}
                <div className="space-y-2 bg-[#FBF9F5] p-3 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Kitchen Prep Items:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between font-semibold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              it.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          <span>
                            <strong className="text-stone-900 font-black">{it.quantity}x</strong>{' '}
                            {it.name}
                          </span>
                        </div>
                        <span className="text-stone-500 font-mono">
                          {formatINR(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-amber-900 bg-amber-50 p-2 rounded-lg font-medium">
                      <span className="font-bold">Student Note: </span>
                      &ldquo;{order.specialInstructions}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer and State Progression Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs">
                    <span className="text-stone-400">Total: </span>
                    <span className="font-extrabold text-[#12372A]">
                      {formatINR(order.totalAmount)}
                    </span>
                    <span className="text-stone-400 font-medium ml-1.5 uppercase text-[10px]">
                      ({order.paymentMethod} · {order.paymentStatus})
                    </span>
                  </div>

                  {/* Actions depending on stage */}
                  <div className="flex items-center gap-2">
                    {isPendingAction && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'PREPARING', 'Chef Raman accepted & started prep')
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Prep</span>
                      </button>
                    )}

                    {isCooking && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'READY', 'Order packed and placed on Counter #2')
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {isReadyForPickup && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'COLLECTED', 'Verified token and collected by student')
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Hand Over (Collected)</span>
                      </button>
                    )}

                    {order.orderStatus !== 'COLLECTED' && order.orderStatus !== 'CANCELLED' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'CANCELLED', 'Canteen staff cancelled order')
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                        title="Cancel order"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
