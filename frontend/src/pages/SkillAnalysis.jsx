import React from 'react';
import { Link } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Award, 
  FolderGit2, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Info
} from 'lucide-react';

const PROFICIENCY_MAP = {
  0: { label: 'Missing (0/3)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  1: { label: 'Beginner (1/3)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  2: { label: 'Intermediate (2/3)', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  3: { label: 'Advanced (3/3)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function SkillAnalysis() {
  const { profile, analysis, triggerAnalysis, isAnalyzing } = useLearner();

  const skillAnalysis = analysis?.skill_analysis;
  const careerMatch = analysis?.career_match;
  const agentStatuses = analysis?.agent_execution_statuses || {};
  const isFallback = agentStatuses.skill_analyst_fallback || skillAnalysis?.fallback;

  // Derive unified list of skills from required skills and user's skills
  const requiredSkillsList = careerMatch?.required_skills || [];
  const userProficiency = profile?.proficiency || {};

  // Build combined skill evaluation items
  const skillItems = requiredSkillsList.map((req) => {
    const skillName = req.skill;
    const reqLevel = req.required_level || 2;
    const curLevel = userProficiency[skillName] || 0;

    let status = 'Missing Gap';
    let statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
    if (curLevel >= reqLevel) {
      status = 'Mastered';
      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (curLevel > 0) {
      status = 'In Progress';
      statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    const importance = reqLevel === 3 ? 'Core Essential' : reqLevel === 2 ? 'High Priority' : 'Secondary';
    const importanceColor = reqLevel === 3 ? 'text-purple-700 font-bold' : reqLevel === 2 ? 'text-rose-600 font-bold' : 'text-slate-600';

    const explanation = curLevel >= reqLevel 
      ? `Meets target proficiency for ${profile.careerGoal}. Keep active through hands-on project work.`
      : curLevel > 0
      ? `Under target level (requires Level ${reqLevel}). Needs focused exercises to reach professional standard.`
      : `Critical missing competency for ${profile.careerGoal}. Recommended to prioritize in your roadmap.`;

    return {
      skillName,
      curLevel,
      reqLevel,
      status,
      statusColor,
      importance,
      importanceColor,
      explanation,
    };
  });

  return (
    <section className="max-w-6xl mx-auto py-2 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner - Crisp White Frosted Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 border border-rose-200/80">
              <BarChart2 className="w-3.5 h-3.5 text-rose-500" />
              Specialist Agent 1 &amp; 2 Evaluation
            </span>
            {isFallback && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-1 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                Deterministic Taxonomy
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comprehensive Skill Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Multi-agent competency benchmarks &amp; gap identification for <strong className="text-rose-600 font-bold">{profile.careerGoal || 'Full Stack Developer'}</strong>.
          </p>
        </div>

        <button
          onClick={() => triggerAnalysis()}
          disabled={isAnalyzing}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-rose-500/20 transition-all self-start sm:self-center shrink-0 active:scale-95"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Re-evaluating...' : 'Re-run Analysis'}
        </button>
      </div>

      {/* 2. Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Skill Score</span>
          <div className="text-3xl font-black text-rose-600 mt-1">
            {skillAnalysis?.overall_skill_score ?? 0}/100
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Diagnosed by Agent 1 Skill Analyst</p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Readiness Match</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {analysis?.career_readiness_score ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Calibrated for {profile.careerGoal}</p>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Identified Strengths</span>
          <div className="text-3xl font-black text-purple-600 mt-1">
            {skillAnalysis?.strengths?.length ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Competencies &ge; Level 2</p>
        </div>
      </div>

      {/* 3. Main Competency Table - Clean High-Contrast White Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 space-y-4 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-rose-500" />
            Skill Gap &amp; Proficiency Matrix
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {skillItems.length} Required Skills
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Skill Name</th>
                <th className="py-3 px-3">Current Level</th>
                <th className="py-3 px-3">Required</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Importance</th>
                <th className="py-3 px-3">Agent Assessment &amp; Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {skillItems.map((s, idx) => {
                const curProf = PROFICIENCY_MAP[s.curLevel] || PROFICIENCY_MAP[0];
                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {s.skillName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${curProf.bg} ${curProf.color}`}>
                        {curProf.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-800 font-bold">
                      Level {s.reqLevel}/3
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.statusColor}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className={`py-3.5 px-3 ${s.importanceColor}`}>
                      {s.importance}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 text-xs leading-relaxed max-w-sm">
                      {s.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Certifications & Projects Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Verified Certifications Relevance
          </h3>
          <div className="space-y-2">
            {profile.certifications?.length ? (
              profile.certifications.map((c, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{c}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    High Match
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No certifications listed.</p>
            )}
          </div>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-rose-500" />
            Hands-on Projects Evaluated
          </h3>
          <div className="space-y-2">
            {profile.projects?.length ? (
              profile.projects.map((p, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{p}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Verified
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No projects listed.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
