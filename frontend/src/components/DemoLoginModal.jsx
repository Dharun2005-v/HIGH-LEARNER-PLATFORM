import React, { useState } from 'react';
import { X, Sparkles, UserCheck, ShieldCheck, ArrowRight, UserPlus, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearner } from '../context/LearnerContext';

export default function DemoLoginModal({ isOpen, onClose }) {
  const { availableDemoUsers, signInDemo } = useAuth();
  const { setProfile, triggerAnalysis } = useLearner();

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = async (demoUser) => {
    setIsSubmitting(true);
    try {
      const loggedUser = signInDemo(demoUser);
      if (demoUser.profile) {
        setProfile(demoUser.profile);
        // Trigger live analysis for the selected persona
        triggerAnalysis(demoUser.profile).catch(() => {});
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const loggedUser = signInDemo(customEmail.trim(), customName.trim());
      if (loggedUser.profile) {
        setProfile(loggedUser.profile);
        triggerAnalysis(loggedUser.profile).catch(() => {});
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-950/50 p-6 overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Demo Sign-In</h2>
              <p className="text-xs text-indigo-300">Instant access • No password required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 p-1 bg-slate-800/60 rounded-xl my-4 border border-slate-700/50">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preset Personas
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Learner
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'presets' ? (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400 mb-2">
              Select a pre-configured learner persona with skill assessments, goals, and history:
            </p>
            {availableDemoUsers.map((u) => (
              <button
                key={u.uid}
                onClick={() => handleSelectPreset(u)}
                disabled={isSubmitting}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-left group"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-400/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {u.name}
                    </p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      1-Click
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{u.title}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <p className="text-xs text-slate-400">
              Enter your own name and email to create a custom demo session:
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="jordan.lee@example.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !customEmail.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign In as Custom Learner</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Local session stored safely
          </span>
          <span>HIGH LEARNER v1.0</span>
        </div>
      </div>
    </div>
  );
}
