import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Compass, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <section className="max-w-4xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white/80 shadow-sm text-xs font-bold text-rose-600">
        <Sparkles className="w-4 h-4 text-rose-500" />
        <span>Next-Generation Multi-Agent AI Career Orchestrator</span>
      </div>

      {/* Hero Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Your Skills. Your Career.<br />
          <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
            Your Personalized AI Roadmap.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          HIGH LEARNER uses 4 specialized AI agents to analyze your real competencies, diagnose market skill gaps, generate adaptive roadmaps, and provide a 24/7 AI progress mentor.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Open Career Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/progress"
          className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/90 hover:bg-white text-slate-800 font-bold text-sm border border-white/80 shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
        >
          <span>Take JavaScript Assessment</span>
        </Link>
      </div>

      {/* 4 AI Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Skill Analyst</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Diagnoses profile strengths, projects, and certifications into structured proficiencies.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Career Matcher</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Benchmarks learner against real vacancies to compute true readiness scores.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Learning Path Coach</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Synthesizes weekly modules with verified documentation and hands-on exercises.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/80 p-5 rounded-3xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            04
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">Progress Mentor</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Adaptive testing engine and 24/7 AI chat answering queries with live context.
          </p>
        </div>
      </div>
    </section>
  );
}
