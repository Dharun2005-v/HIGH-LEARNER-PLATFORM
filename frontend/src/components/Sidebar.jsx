import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  User, 
  Folder, 
  Star, 
  List, 
  Trash2, 
  Layers, 
  Compass, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Activity,
  Bot
} from 'lucide-react';
import { useLearner } from '../context/LearnerContext';
import { useAuth } from '../context/AuthContext';
import DemoLoginModal from './DemoLoginModal';

export default function Sidebar() {
  const { profile, analysis } = useLearner();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const readinessScore = analysis?.career_readiness_score ?? 68;
  const missingCount = analysis?.missing_skills?.length ?? 3;

  // Quick menu icon dock items
  const menuItems = [
    { id: 'profile', icon: User, path: '/onboarding', title: 'Learner Profile' },
    { id: 'career', icon: GraduationCap, path: '/dashboard', title: 'Career Tracks', isCenter: true },
    { id: 'roadmap-folder', icon: Folder, path: '/roadmap', title: 'Roadmap Modules' },
    { id: 'skills-star', icon: Star, path: '/skill-analysis', title: 'Skill Analysis' },
    { id: 'progress-list', icon: List, path: '/progress', title: 'Assessment & Tests' },
    { id: 'agents-bot', icon: Bot, path: '/dashboard', title: 'AI Specialist Agents' },
  ];

  return (
    <>
      <aside className="w-full md:w-80 bg-white/85 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-rose-200/60 p-5 sm:p-6 flex flex-col justify-between shadow-lg shadow-rose-950/5 z-20 shrink-0 md:min-h-screen">
        <div className="space-y-6">
          {/* Top Row: Search Pill + User Avatar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search skills, modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 transition-all"
              />
            </div>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="relative shrink-0 rounded-full p-0.5 border-2 border-rose-400/60 hover:border-rose-500 shadow-sm transition-transform active:scale-95"
              title={`${user?.name || 'Alex Johnson'} - Click to switch persona`}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={user?.name || 'User Avatar'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </button>
          </div>

          {/* Metric Stats Rows (matching income/expenses style) */}
          <div className="space-y-2.5 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="text-emerald-500 font-bold text-sm">→</span>
                <span>Readiness</span>
              </span>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                + {readinessScore}.0%
              </span>
            </div>

            <div className="w-full h-px bg-slate-200/70" />

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="text-slate-400 font-bold text-sm">←</span>
                <span>Gaps to Close</span>
              </span>
              <span className="font-extrabold text-sm text-slate-700 tracking-tight">
                - {missingCount} Skills
              </span>
            </div>
          </div>

          {/* Quick Menu Label */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick menu
              </span>
              <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                Interactive Dock
              </span>
            </div>

            {/* Neumorphic 3x3 Dock (exactly like model image) */}
            <div className="bg-slate-100/60 p-3 rounded-2xl border border-slate-200/60 shadow-inner grid grid-cols-3 gap-2.5 place-items-center">
              {/* Item 1: Profile */}
              <button
                onClick={() => navigate('/onboarding')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  location.pathname === '/onboarding'
                    ? 'bg-white shadow-md text-rose-500 scale-105 border border-rose-200'
                    : 'bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Learner Profile"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Center Item: Prominent Persona / Career figure card */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`col-span-1 row-span-1 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  location.pathname === '/' || location.pathname === '/dashboard'
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30 scale-110'
                    : 'bg-white text-slate-700 shadow-md hover:scale-105'
                }`}
                title="Career Command Center (Dashboard)"
              >
                <GraduationCap className="w-7 h-7" />
              </button>

              {/* Item 3: Roadmap Folder */}
              <button
                onClick={() => navigate('/roadmap')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  location.pathname === '/roadmap'
                    ? 'bg-white shadow-md text-rose-500 scale-105 border border-rose-200'
                    : 'bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Learning Roadmap"
              >
                <Folder className="w-5 h-5" />
              </button>

              {/* Item 4: Skill Analysis Star */}
              <button
                onClick={() => navigate('/skill-analysis')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  location.pathname === '/skill-analysis'
                    ? 'bg-white shadow-md text-rose-500 scale-105 border border-rose-200'
                    : 'bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Skill Gap Analysis"
              >
                <Star className="w-5 h-5" />
              </button>

              {/* Item 5: Progress List */}
              <button
                onClick={() => navigate('/progress')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  location.pathname === '/progress'
                    ? 'bg-white shadow-md text-rose-500 scale-105 border border-rose-200'
                    : 'bg-white/60 hover:bg-white text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Assessment & Adaptive Progress"
              >
                <List className="w-5 h-5" />
              </button>

              {/* Item 6: Activity / Pulse */}
              <button
                onClick={() => navigate('/progress')}
                className="w-12 h-12 rounded-xl bg-white/60 hover:bg-white text-slate-500 hover:text-rose-500 shadow-sm flex items-center justify-center transition-all"
                title="Weekly Activity"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Persona & Switcher Strip */}
        <div className="pt-4 border-t border-slate-200/70 mt-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800 leading-tight">{user?.name || 'Alex Johnson'}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{profile?.careerGoal || 'Full Stack Developer'}</p>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-[11px] border border-rose-200 transition-colors"
            >
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* Persona Switcher Modal */}
      <DemoLoginModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
