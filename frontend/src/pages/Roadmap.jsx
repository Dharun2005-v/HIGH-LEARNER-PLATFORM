import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Code, 
  Sparkles, 
  AlertTriangle,
  RotateCw,
  Trophy
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-purple-50 text-purple-700 border-purple-200',
};

const COMMON_CAREERS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'DevOps Engineer',
];

export default function Roadmap() {
  const { 
    profile, 
    analysis, 
    completedModules, 
    toggleModuleCompletion,
    updateGoal,
    isUpdatingGoal,
    triggerAnalysis,
    isAnalyzing
  } = useLearner();

  const [careerSelect, setCareerSelect] = useState(profile?.careerGoal || 'Full Stack Developer');

  const roadmap = analysis?.roadmap;
  const modules = roadmap?.modules || [];
  const totalWeeks = roadmap?.total_duration_weeks || modules.reduce((acc, m) => acc + (m.duration_weeks || 0), 0);
  const isFallback = analysis?.agent_execution_statuses?.learning_path_fallback || roadmap?.fallback;

  const completedCount = modules.filter((m) => completedModules.includes(m.title)).length;
  const completionPct = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  const handleCareerChange = async (e) => {
    const newCareer = e.target.value;
    setCareerSelect(newCareer);
    if (newCareer && newCareer !== profile.careerGoal) {
      await updateGoal(newCareer);
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-2 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner - Crisp White Frosted Glass */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 border border-rose-200/80">
              <Map className="w-3.5 h-3.5 text-rose-500" />
              Specialist Agent 3 Roadmap
            </span>
            {isFallback && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Deterministic Fallback
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personalized Learning Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Organized in prerequisite sequence with verified resources and practical exercises for <strong className="text-rose-600 font-bold">{profile.careerGoal}</strong>.
          </p>
        </div>

        {/* Change Career Goal Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 mb-1">Target Career</span>
            <select
              value={careerSelect}
              onChange={handleCareerChange}
              disabled={isUpdatingGoal || isAnalyzing}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 shadow-sm transition"
            >
              {COMMON_CAREERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => triggerAnalysis()}
            disabled={isAnalyzing}
            className="mt-auto px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Progress & Duration Bar */}
      <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900">
              Roadmap Progress: {completedCount} of {modules.length} Modules Completed
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Estimated Total Duration: <strong className="text-slate-800 font-bold">{totalWeeks} weeks</strong>
            </div>
          </div>
        </div>

        {/* Progress Percentage Gauge */}
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Overall Completion</span>
            <span className="text-rose-600 font-extrabold">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
            <div
              className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Modules List - High Contrast Frosted Cards */}
      <div className="space-y-4">
        {modules.map((m, idx) => {
          const isDone = completedModules.includes(m.title);
          const diffColor = DIFFICULTY_COLORS[m.difficulty] || DIFFICULTY_COLORS.Medium;

          return (
            <div
              key={idx}
              className={`rounded-3xl border transition-all duration-300 p-6 ${
                isDone 
                  ? 'bg-white/70 border-emerald-300/60 shadow-sm' 
                  : 'bg-white/90 backdrop-blur-xl border-white/80 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Module Header & Checkbox */}
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleModuleCompletion(m.title)}
                    className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-500 transition-transform active:scale-90"
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-7 h-7 text-slate-300 hover:text-rose-500" />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Module {idx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffColor}`}>
                        {m.difficulty || 'Medium'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.duration_weeks || 2} weeks
                      </span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {m.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => toggleModuleCompletion(m.title)}
                  className={`text-xs px-4 py-2 rounded-xl font-bold border transition self-start sm:self-auto shrink-0 shadow-sm ${
                    isDone 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {isDone ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>

              {/* Practical Exercise Box */}
              {m.exercise && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <Code className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-amber-950">
                    <strong className="text-amber-800 font-bold">Practical Exercise:</strong>{' '}
                    <span>{m.exercise}</span>
                  </div>
                </div>
              )}

              {/* Verified Learning Resources */}
              {m.resources && m.resources.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5">
                    <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                    Verified Learning Resources:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.resources.map((url, rIdx) => {
                      let label = url;
                      try {
                        const parsed = new URL(url);
                        label = parsed.hostname.replace('www.', '') + parsed.pathname;
                      } catch {
                        // ignore
                      }

                      return (
                        <a
                          key={rIdx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-medium shadow-sm transition"
                        >
                          <span className="truncate max-w-xs">{label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
