import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Clock,
  DollarSign,
  ChefHat,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

export const AdminAnalyticsView: React.FC = () => {
  const { canteenStatus, updateCanteenStatus, orders } = useApp();

  const [capacity, setCapacity] = useState(canteenStatus.maxConcurrentCapacity);
  const [accepting, setAccepting] = useState(canteenStatus.acceptingOrders);

  // Sync state if external changes occur
  useEffect(() => {
    setCapacity(canteenStatus.maxConcurrentCapacity);
    setAccepting(canteenStatus.acceptingOrders);
  }, [canteenStatus]);

  const handleSaveControls = async () => {
    await updateCanteenStatus({
      maxConcurrentCapacity: Number(capacity),
      acceptingOrders: accepting,
    });
  };

  // Operational metrics calculated from orders state
  const totalSales = orders.reduce(
    (sum, o) => (o.paymentStatus === 'PAID' ? sum + o.totalAmount : sum),
    0
  );
  const completedCount = orders.filter((o) => o.orderStatus === 'COLLECTED').length;
  const inPrepCount = orders.filter((o) => o.orderStatus === 'PREPARING').length;

  // Hourly volume distribution (sample campus peak breaks)
  const hourlyData = [
    { hour: '09 AM', count: 18, label: 'Breakfast' },
    { hour: '10 AM', count: 12, label: 'Break' },
    { hour: '11 AM', count: 24, label: 'Early Lunch' },
    { hour: '12 PM', count: 58, label: 'Peak Lunch 1' },
    { hour: '01 PM', count: 72, label: 'Peak Lunch 2' },
    { hour: '02 PM', count: 30, label: 'Post Lunch' },
    { hour: '04 PM', count: 52, label: 'Evening Snacks' },
    { hour: '05 PM', count: 26, label: 'Departure' },
  ];
  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count));

  // Popular items
  const popularDishes = [
    { name: 'Special Campus Thali', count: 48, revenue: 5280 },
    { name: 'Crispy Masala Dosa', count: 42, revenue: 2520 },
    { name: 'Special Kulhad Chai', count: 65, revenue: 1300 },
    { name: 'Bombay Samosa Chaat', count: 38, revenue: 1900 },
    { name: 'Desi Rajma Chawal Bowl', count: 31, revenue: 2480 },
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Today&apos;s Total Sales
            </p>
            <p className="text-2xl font-black text-[#12372A] mt-1">
              {formatINR(totalSales)}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Digital UPI & Cards</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Orders Processed
            </p>
            <p className="text-2xl font-black text-stone-900 mt-1">
              {orders.length}
            </p>
            <span className="text-[10px] text-stone-500 font-medium mt-0.5">
              {completedCount} collected · {inPrepCount} in prep
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Active Kitchen Load
            </p>
            <p className="text-2xl font-black text-orange-600 mt-1">
              {canteenStatus.currentActiveOrders} / {canteenStatus.maxConcurrentCapacity}
            </p>
            <span className="text-[10px] text-stone-500 font-medium mt-0.5">
              Queue capacity threshold
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Avg. Turnaround Time
            </p>
            <p className="text-2xl font-black text-stone-900 mt-1">
              {canteenStatus.averageWaitMinutes} mins
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              Target: under 10 mins
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Kitchen Queue Capacity & Ordering Controls */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-stone-900 text-sm">
              Live Kitchen Flow & Order Throttling Controls
            </h3>
          </div>
          <button
            onClick={handleSaveControls}
            className="px-4 py-1.5 bg-[#12372A] hover:bg-[#16423C] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            Apply Changes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Order Reception Toggle */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Canteen Ordering Status:</span>
              <button
                type="button"
                onClick={() => setAccepting(!accepting)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  accepting
                    ? 'bg-emerald-700 text-white'
                    : 'bg-red-700 text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{accepting ? 'Accepting Orders' : 'Ordering Paused'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              When paused, students will see a friendly note that the kitchen is momentarily catching up.
            </p>
          </div>

          {/* Queue Capacity Slider */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Max Active Queue Cap:</span>
              <span className="font-black text-sm text-[#12372A] font-mono">
                {capacity} orders
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>5 (Light)</span>
              <span>25 (Standard)</span>
              <span>50 (High Festival Load)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Demand Bar Chart & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Peak Break Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Peak Demand Hours</h3>
              <p className="text-[11px] text-stone-400">
                Order concentration during college recess & lunch periods
              </p>
            </div>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
              Illustrative Sample
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-stone-100">
            {hourlyData.map((d) => {
              const heightPercent = Math.round((d.count / maxHourlyCount) * 100);
              const isPeak = d.count >= 50;

              return (
                <div key={d.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isPeak
                        ? 'bg-gradient-to-t from-orange-600 to-amber-500'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.label}: ${d.count} orders`}
                  />
                  <span className="text-[10px] font-bold text-stone-500 mt-1">
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              <span>Lunch Break Rush (12-1 PM)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-700" />
              <span>Normal Flow</span>
            </span>
          </div>
        </div>

        {/* Top 5 Dishes */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Top Dishes Today</h3>
              <p className="text-[11px] text-stone-400">
                Highest frequency campus favourites
              </p>
            </div>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>

          <div className="space-y-3 text-xs">
            {popularDishes.map((dish, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#12372A] text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-stone-900">{dish.name}</p>
                    <p className="text-[10px] text-stone-400">{dish.count} orders today</p>
                  </div>
                </div>
                <span className="font-extrabold text-[#12372A]">
                  {formatINR(dish.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
