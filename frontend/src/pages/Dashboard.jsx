import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { 
  Globe, 
  ChevronRight, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Layers,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';

const TRACK_CARDS = [
  {
    id: 'fullstack',
    tld: '.com',
    career: 'Full Stack Developer',
    description: 'Master frontend, backend APIs, state architectures & full cloud deployment.',
    readiness: 68,
    benchmark: '85%',
    duration: '10 Weeks',
    gradient: 'from-[#ff6b8b] to-[#ff477e]',
    shadow: 'shadow-[0_15px_35px_rgba(255,71,126,0.4)]',
    tagColor: 'bg-rose-900/30 text-rose-100',
  },
  {
    id: 'aiml',
    tld: '.info',
    career: 'AI & Machine Learning',
    description: 'Deep neural networks, LLM agents, TensorFlow & predictive data pipelines.',
    readiness: 78,
    benchmark: '95%',
    duration: '12 Weeks',
    gradient: 'from-[#a855f7] to-[#7c3aed]',
    shadow: 'shadow-[0_20px_45px_rgba(124,58,237,0.5)]',
    tagColor: 'bg-purple-900/30 text-purple-100',
    isElevated: true,
  },
  {
    id: 'devops',
    tld: '.blog',
    career: 'DevOps Engineer',
    description: 'Kubernetes orchestration, Docker containers, multi-cloud CI/CD & Linux infra.',
    readiness: 82,
    benchmark: '90%',
    duration: '8 Weeks',
    gradient: 'from-[#00b4d8] to-[#0077b6]',
    shadow: 'shadow-[0_15px_35px_rgba(0,180,216,0.4)]',
    tagColor: 'bg-cyan-900/30 text-cyan-100',
  },
];

const AGENTS = [
  {
    name: 'Skill Analyst',
    role: 'Deconstructs learner profile & diagnostics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    arrow: '→',
    color: 'text-emerald-500 bg-emerald-50',
  },
  {
    name: 'Career Matcher',
    role: 'Benchmarks against real market vacancies',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    arrow: '←',
    color: 'text-slate-500 bg-slate-100',
  },
  {
    name: 'Learning Coach',
    role: 'Sequences step-by-step curriculum & resources',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    arrow: '→',
    color: 'text-emerald-500 bg-emerald-50',
  },
];

export default function Dashboard() {
  const { 
    profile, 
    analysis, 
    triggerAnalysis, 
    updateGoal, 
    isAnalyzing, 
    isUpdatingGoal 
  } = useLearner();

  // Active track defaults to profile goal or AI/ML
  const [activeTrackIndex, setActiveTrackIndex] = useState(1);
  const [activeTrack, setActiveTrack] = useState('AI & Machine Learning');

  const handleSelectTrack = async (track, index) => {
    setActiveTrackIndex(index);
    setActiveTrack(track.career);
    if (track.career !== profile?.careerGoal) {
      try {
        await updateGoal(track.career);
      } catch (e) {
        console.warn('Track update:', e);
      }
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (activeTrackIndex + 1) % TRACK_CARDS.length;
    handleSelectTrack(TRACK_CARDS[nextIdx], nextIdx);
  };

  const readinessScore = analysis?.career_readiness_score ?? TRACK_CARDS[activeTrackIndex].readiness;
  const strengths = analysis?.strengths || ['JavaScript', 'HTML/CSS', 'Git'];
  const missingSkills = analysis?.missing_skills || ['React', 'Node.js', 'Docker'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO TITLE & SUBTITLE (Matching reference model) */}
      <div className="space-y-1.5 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
          Choose yours
        </h1>
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
          Select a specialized career track to align your AI learning path, skill assessments, and progress mentor towards industry benchmarks.
        </p>
      </div>

      {/* 2. THE 3 VIBRANT VERTICAL CARDS (Exact design of reference model) */}
      <div className="relative pt-3 pb-4">
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-4 px-1 no-scrollbar">
          {TRACK_CARDS.map((track, idx) => {
            const isSelected = activeTrackIndex === idx;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track, idx)}
                className={`relative w-44 sm:w-52 h-72 sm:h-80 rounded-[2rem] bg-gradient-to-b ${track.gradient} ${track.shadow} p-5 flex flex-col justify-between text-white cursor-pointer select-none transition-all duration-300 transform ${
                  isSelected
                    ? '-translate-y-3 sm:-translate-y-4 scale-105 ring-4 ring-white/60 z-10'
                    : 'opacity-90 hover:opacity-100 hover:-translate-y-1'
                }`}
              >
                {/* Top Section: Globe Icon in translucent circle */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/25 border border-white/40 tracking-wider uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Center Section: Big Domain/Career Title + Stats */}
                <div className="space-y-2 text-center my-auto">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
                    {track.tld}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-white/90 font-medium">
                    <span className="line-through text-white/60">{track.benchmark}</span>
                    <span className="text-sm font-extrabold bg-white/20 px-2 py-0.5 rounded-full">
                      {track.readiness}%
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-white/90 line-clamp-1">
                    {track.career}
                  </p>
                </div>

                {/* Bottom Section: Modern Toggle Switch */}
                <div className="flex items-center justify-center pt-2">
                  <div 
                    className={`w-14 h-7 rounded-full p-1 transition-colors flex items-center ${
                      isSelected ? 'bg-white/40 justify-end' : 'bg-white/20 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Right Circular Next Arrow Button (from reference model) */}
          <button
            onClick={handleNextTrack}
            className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Next Track"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM ROW: COMPETENCY LEVEL CAPSULE + AGENT TEAM AVATARS (Matching model) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
        {/* Competency Level Capsule Card */}
        <div className="relative bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-white/70 flex items-center gap-5">
          {/* Tooltip bubble on top */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1b1c20] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {readinessScore}.0%
          </div>

          <div className="text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Competency Levels
            </p>
            <p className="text-xs font-extrabold text-slate-800">
              {activeTrack}
            </p>
          </div>

          {/* Vertical Colored Meter Bars */}
          <div className="flex items-end gap-2.5 h-10 px-1">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-10 bg-slate-100 rounded-full flex items-end overflow-hidden p-0.5">
                <div className="w-full h-[85%] bg-emerald-500 rounded-full" />
              </div>
              <span className="text-[8px] font-bold text-slate-500">JS</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-10 bg-slate-100 rounded-full flex items-end overflow-hidden p-0.5">
                <div className="w-full h-[65%] bg-rose-400 rounded-full" />
              </div>
              <span className="text-[8px] font-bold text-slate-500">PY</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-10 bg-slate-100 rounded-full flex items-end overflow-hidden p-0.5">
                <div className="w-full h-[75%] bg-purple-500 rounded-full" />
              </div>
              <span className="text-[8px] font-bold text-slate-500">ML</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-10 bg-slate-100 rounded-full flex items-end overflow-hidden p-0.5">
                <div className="w-full h-[55%] bg-cyan-500 rounded-full" />
              </div>
              <span className="text-[8px] font-bold text-slate-500">SQL</span>
            </div>
          </div>
        </div>

        {/* AI Specialist Agent Team Avatars (from reference model) */}
        <div className="flex items-center gap-4">
          {AGENTS.map((agent, i) => (
            <div key={i} className="flex flex-col items-center gap-1 group">
              <div className="relative">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className={`w-5 h-5 rounded-full ${agent.color} shadow-sm flex items-center justify-center text-[10px] font-bold`}>
                {agent.arrow}
              </div>
              <span className="text-[9px] font-semibold text-white/90 text-center max-w-[65px] truncate">
                {agent.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. EXPANDABLE DETAILS & LIVE ANALYSIS ACTIONS */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg space-y-6 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-200">
                AI Diagnostic Engine
              </span>
              <span className="text-xs text-slate-500">Active Benchmark: {activeTrack}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mt-1">
              Readiness Score: <span className="text-rose-600">{readinessScore}%</span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerAnalysis()}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Skills...' : 'Analyze Career Readiness'}</span>
            </button>
            <Link
              to="/roadmap"
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all"
            >
              View Roadmap
            </Link>
          </div>
        </div>

        {/* Skill Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Confirmed Strengths */}
          <div className="p-4 rounded-2xl bg-white/80 border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Confirmed Strengths</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {strengths.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-4 rounded-2xl bg-white/80 border border-rose-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-600">
              <span>Gaps to Close</span>
              <Zap className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/60">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Next Recommendation */}
          <div className="p-4 rounded-2xl bg-white/80 border border-purple-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-600">
              <span>AI Next Milestone</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed pt-1">
              {analysis?.next_recommendation || 'Complete JavaScript Fundamentals & DOM Mastery assessment.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
