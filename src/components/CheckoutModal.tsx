import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  Banknote,
  CheckCircle,
  Loader2,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '../utils/orderCalculations';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupSlot: string;
  specialInstructions: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  pickupSlot,
  specialInstructions,
}) => {
  const {
    user,
    cart,
    cartTotal,
    cartSubtotal,
    cartTax,
    cartServiceFee,
    placeOrder,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okhdfcbank` : 'student@okaxis');
  const [studentName, setStudentName] = useState(user?.name || 'Aarav Sharma');
  const [studentRoll, setStudentRoll] = useState(user?.rollNumber || '22BCE1048');
  const [studentPhone, setStudentPhone] = useState(user?.phone || '+91 98765 43210');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentName.trim()) {
      setErrorMessage('Please enter student name.');
      return;
    }
    if (!studentRoll.trim()) {
      setErrorMessage('Please enter campus roll number.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment network latency for authentic demo feel
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const newOrder = await placeOrder({
        pickupSlot,
        specialInstructions,
        paymentMethod,
      });

      if (newOrder) {
        onClose();
      } else {
        setErrorMessage('Failed to place order. Kitchen queue may be temporarily busy.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout encountered an error';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div>
            <h2 id="checkout-modal-title" className="text-lg font-black text-stone-900">
              Campus Canteen Checkout
            </h2>
            <p className="text-xs text-stone-500">
              Review details & select digital payment method
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Student Identity Section */}
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                1. Student Information
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                Campus Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-medium">Student Name</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Roll Number</label>
                <input
                  type="text"
                  required
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-medium">Mobile Phone</label>
                <input
                  type="text"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Pickup & Instructions Preview */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
              2. Pickup Schedule & Tray Summary
            </span>

            <div className="flex items-center justify-between text-stone-700 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Selected Pickup Slot:</span>
              </span>
              <span className="font-bold text-stone-900 bg-white px-2 py-1 rounded border border-stone-200">
                {pickupSlot}
              </span>
            </div>

            {specialInstructions && (
              <div className="text-stone-600 pt-1 text-[11px]">
                <span className="font-semibold text-stone-800">Special Notes: </span>
                <span>&ldquo;{specialInstructions}&rdquo;</span>
              </div>
            )}

            <div className="pt-2 border-t border-stone-200/60">
              <div className="text-stone-600 text-[11px] flex justify-between">
                <span>{cart.length} items in tray</span>
                <span className="font-bold text-stone-800">{formatINR(cartSubtotal)}</span>
              </div>
            </div>
          </div>

          {/* 3. Payment Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                3. Choose Payment Method
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Simulated Gateway (Demo Mode)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Smartphone
                  className={`w-5 h-5 mb-2 ${
                    paymentMethod === 'upi' ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">UPI Apps</div>
                  <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              {/* QR Code */}
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'qr'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <QrCode
                  className={`w-5 h-5 mb-2 ${
                    paymentMethod === 'qr' ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">Scan QR Code</div>
                  <span className="text-[10px] text-stone-500">Instant UPI scanner</span>
                </div>
              </button>

              {/* Campus Debit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 mb-2 ${
                    paymentMethod === 'card' ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">Campus / Bank Card</div>
                  <span className="text-[10px] text-stone-500">Debit / Credit Gateway</span>
                </div>
              </button>

              {/* Cash at Pickup */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Banknote
                  className={`w-5 h-5 mb-2 ${
                    paymentMethod === 'cash' ? 'text-emerald-700' : 'text-stone-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">Cash on Pickup</div>
                  <span className="text-[10px] text-stone-500">Pay at counter</span>
                </div>
              </button>
            </div>

            {/* Sub-inputs depending on chosen payment method */}
            {paymentMethod === 'upi' && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2 animate-in fade-in">
                <label className="block text-emerald-950 font-bold">Enter UPI ID / VPA:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="student@okaxis"
                    className="flex-1 bg-white border border-emerald-300 rounded-lg p-2 text-stone-900 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                  <span className="bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-[11px] flex items-center">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Simulated payment request will be auto-approved for this hackathon demo.
                </p>
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4 text-xs animate-in fade-in">
                <div className="w-24 h-24 bg-white p-2 border border-stone-300 rounded-xl flex items-center justify-center shadow-xs">
                  <QrCode className="w-20 h-20 text-[#12372A]" />
                </div>
                <div className="space-y-1 text-stone-600 text-center sm:text-left">
                  <p className="font-bold text-stone-900">Canteen Desk BharatQR</p>
                  <p className="text-[11px]">
                    Pay <span className="font-bold text-emerald-800">{formatINR(cartTotal)}</span> using Any UPI App (Google Pay / PhonePe / Paytm).
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Clicking &quot;Confirm & Pay&quot; simulates instantaneous bank callback.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2 animate-in fade-in">
                <p className="font-bold text-stone-800">Simulated Card Gateway (Razorpay Sandbox):</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242"
                    className="bg-white border border-stone-300 rounded-lg p-2 text-stone-600"
                  />
                  <input
                    type="text"
                    disabled
                    value="Expires 12/28"
                    className="bg-white border border-stone-300 rounded-lg p-2 text-stone-600"
                  />
                </div>
                <span className="text-[10px] text-stone-500 block">
                  Test credentials preloaded. No real financial cards are billed.
                </span>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
                <p className="font-bold">Pay ₹ Cash at Canteen Counter:</p>
                <p className="text-[11px]">
                  Your pickup token will be generated immediately. Present exact change of{' '}
                  <span className="font-bold">{formatINR(cartTotal)}</span> at Counter #1 when your order status turns &quot;Ready for Pickup&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Final Total and Action */}
          <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500">Amount Payable:</div>
              <div className="text-2xl font-black text-[#12372A]">
                {formatINR(cartTotal)}
              </div>
              <div className="text-[10px] text-stone-400">
                Subtotal: {formatINR(cartSubtotal)} + GST: {formatINR(cartTax)} + Digital Fee: {formatINR(cartServiceFee)}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Confirm Order & Pay {formatINR(cartTotal)}</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-end server verification · Non-repudiable pickup token</span>
          </div>
        </form>
      </div>
    </div>
  );
};
