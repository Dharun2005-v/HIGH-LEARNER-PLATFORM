import React, { useState } from 'react';
import { Sparkles, LogIn, LogOut, Users, Bot, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DemoLoginModal from './DemoLoginModal';

export default function TopNavbar() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="px-6 py-3.5 flex items-center justify-between border-b border-rose-200/50 bg-white/40 backdrop-blur-md sticky top-0 z-30">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              HIGH LEARNER
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-300/40">
                AI ORCHESTRATOR
              </span>
            </h1>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active AI Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-rose-200/60 text-xs text-slate-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">4 Specialist Agents Online</span>
          </div>

          {/* Persona Switch / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 border border-rose-200 hover:border-rose-300 shadow-sm text-xs font-semibold transition-all"
                title="Switch persona or account"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="hidden md:inline">{user.name}</span>
                <Users className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              <button
                onClick={logout}
                className="p-1.5 rounded-full bg-white/70 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-rose-200/60 transition-all text-xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Demo Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Demo Sign-In Modal */}
      <DemoLoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
