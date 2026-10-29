import React, { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Key,
  Terminal,
} from 'lucide-react';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleCopySql = () => {
    fetch('/supabase/schema.sql')
      .then((r) => r.text())
      .then((sql) => {
        navigator.clipboard?.writeText(sql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      })
      .catch(() => {
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
      });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging Supabase REST endpoint...');

    if (!isConfigured) {
      setTimeout(() => {
        setTestStatus('error');
        setTestMessage(
          'Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not yet configured. The app is running smoothly in Local In-Memory Demo mode.'
        );
      }, 700);
      return;
    }

    try {
      const { data, error } = await supabase.from('menu_items').select('count').limit(1);
      if (error) {
        setTestStatus('error');
        setTestMessage(`Supabase error: ${error.message}. Did you execute supabase/schema.sql in your Supabase SQL Editor?`);
      } else {
        setTestStatus('success');
        setTestMessage('Successfully connected to Supabase PostgreSQL database!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setTestStatus('error');
      setTestMessage(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supabase-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="supabase-modal-title" className="text-lg font-black text-stone-900">
                Supabase Persistent Database Setup
              </h2>
              <p className="text-xs text-stone-500">
                PostgreSQL persistence, Row Level Security (RLS), and Realtime sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            isConfigured
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            <div>
              <span className="font-extrabold block">
                {isConfigured
                  ? 'Supabase Integration Active'
                  : 'Local Demo Fallback Active'}
              </span>
              <span className="text-[11px] opacity-90">
                {isConfigured
                  ? 'App is reading and writing directly to your Supabase PostgreSQL cloud tables.'
                  : 'Running seamlessly in offline/local state until credentials are provided.'}
              </span>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            className="px-3.5 py-1.5 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs flex-shrink-0 transition-colors"
          >
            Test Connection
          </button>
        </div>

        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testStatus === 'success'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : testStatus === 'testing'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{testMessage}</span>
          </div>
        )}

        {/* Setup Steps */}
        <div className="space-y-4 text-xs">
          <h3 className="font-extrabold text-stone-900 uppercase tracking-wider text-xs">
            How to Connect Your Supabase Project (3 Easy Steps)
          </h3>

          {/* Step 1 */}
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Create a Project at Supabase.com</span>
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>Open Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Log in to Supabase and click <strong>New project</strong>. Pick your region and set a database password.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Run the SQL Schema (`supabase/schema.sql`)</span>
              </span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-[11px] flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              In your Supabase dashboard, navigate to the <strong>SQL Editor</strong> tab on the left sidebar. Paste and run the prepared script. It creates the <code>menu_items</code>, <code>orders</code>, and <code>canteen_settings</code> tables, enables <strong>Row Level Security (RLS)</strong>, and inserts initial campus dishes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-stone-200/80 space-y-2">
            <span className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#12372A] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Provide Project URL & Anon Key</span>
            </span>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              From your Supabase project settings (<strong>Project Settings &gt; API</strong>), copy your <strong>Project URL</strong> and <strong>Project API Keys (anon public)</strong>, and add them to your environment secrets:
            </p>
            <div className="bg-stone-900 text-emerald-400 p-3 rounded-xl font-mono text-[10.5px] space-y-1 overflow-x-auto">
              <p>VITE_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;</p>
              <p>VITE_SUPABASE_ANON_KEY=&quot;eyJhbGciOi...your-anon-key&quot;</p>
            </div>
          </div>
        </div>

        {/* Security & RLS notice */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Row Level Security (RLS) policies are pre-configured to allow students to read menus & place orders while protecting administrative endpoints.
          </span>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#16423C] text-white font-bold text-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
