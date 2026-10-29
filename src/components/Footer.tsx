import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, MapPin, Phone, Heart } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-[#12372A] text-stone-300 text-xs border-t border-emerald-950/60 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <Logo variant="dark" size="md" showTagline={true} />
            <p className="text-emerald-100/70 text-xs leading-relaxed">
              Munchly is the smart digital college canteen platform built to eliminate long student lunch queues, streamline kitchen fulfillment, and enable contactless token pickups.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('menu')}
                  className="hover:text-white transition-colors"
                >
                  Daily Food Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('track')}
                  className="hover:text-white transition-colors"
                >
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('history')}
                  className="hover:text-white transition-colors"
                >
                  My Order Receipts
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  Staff Kitchen Board
                </button>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Canteen Hours</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/80">
              <li>Monday – Friday: 08:30 AM – 06:30 PM</li>
              <li>Saturday: 09:00 AM – 04:00 PM</li>
              <li>Sunday & Holidays: Closed</li>
              <li className="pt-1 text-[11px] text-amber-300/90 font-medium">
                ★ Peak Breakfast: 9:00 AM – 10:30 AM
              </li>
              <li className="text-[11px] text-amber-300/90 font-medium">
                ★ Peak Lunch: 12:15 PM – 01:45 PM
              </li>
            </ul>
          </div>

          {/* Location & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Location</span>
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Central Student Activity Centre (Level 1), North Campus, Block Canteen Desk #1 & Express Counter #2.
            </p>
            <div className="pt-1 text-xs flex items-center gap-1.5 text-emerald-200">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Ext: 4402 / helpdesk@munchly.internal</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-300/60">
          <div>
            Munchly © 2026. Your Hunger, Handled. Built with React 19, TypeScript, Express, Server-Sent Events & Tailwind CSS.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted for college students & cafeteria staff</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
