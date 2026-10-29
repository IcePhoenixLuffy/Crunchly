import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Shield, CheckCircle, Mail, Lock, GraduationCap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    loginAsDemoStudent,
    loginAsDemoAdmin,
    loginCustom,
  } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await loginCustom(email, name, role, rollNumber);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              {isRegister ? 'Student Registration' : 'Sign In to Munchly'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Access digital canteen food ordering & real-time queue tracking
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Access Buttons for Hackathon */}
        <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Instant Demo Access (No Credentials Required):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginAsDemoStudent();
                setAuthModalOpen(false);
              }}
              className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-600 text-left transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Demo Student</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Aarav (22BCE1048)</p>
            </button>

            <button
              type="button"
              onClick={() => {
                loginAsDemoAdmin();
                setAuthModalOpen(false);
              }}
              className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-amber-600 text-left transition-colors shadow-xs group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 group-hover:text-amber-800">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Canteen Admin</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Chef Raman</p>
            </button>
          </div>
        </div>

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya Sen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">College Roll Number</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23BCE0912"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">College Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="your.name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors mt-2"
          >
            <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-bold text-emerald-800 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Munchly?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-bold text-emerald-800 hover:underline"
              >
                Create Student Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
