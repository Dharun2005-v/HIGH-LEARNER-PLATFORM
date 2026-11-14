import React, { useState, useEffect } from 'react';
import { useLearner } from '../context/LearnerContext';
import { api } from '../services/api';
import { 
  Activity, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Trophy,
  Bot,
  RotateCcw,
  Zap,
  Target,
  ArrowRight,
  Check,
  ShieldCheck,
  Code
} from 'lucide-react';

export default function Progress() {
  const { 
    profile, 
    analysis, 
    completedModules, 
    toggleModuleCompletion,
    assessmentHistory,
    recordAssessmentAttempt,
    bestScore
  } = useLearner();

  // Mode: 'quiz' | 'tracking'
  const [activeTab, setActiveTab] = useState('quiz');

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { q1: 1, q2: 2 }
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Load questions from backend (WITHOUT answer key)
  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const data = await api.getAssessmentQuestions('JavaScript Fundamentals');
        if (isMounted && data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.warn('Questions fetch notice (using verified fallback bank):', err.message);
        if (isMounted) {
          setQuestions([
            {
              id: 'q1',
              topic: 'JavaScript variables',
              question: "What is the primary scoping difference between 'let' and 'var' in modern JavaScript?",
              options: [
                "var is block-scoped while let is function-scoped.",
                "let is block-scoped, while var is function-scoped and hoisted with an initial value of undefined.",
                "let declarations cannot be reassigned under any circumstances, but var can.",
                "var is strictly prohibited in browser environments.",
              ],
            },
            {
              id: 'q2',
              topic: 'Data types',
              question: "What is the return value of typeof null in JavaScript, and why?",
              options: [
                "\"null\", because null is an independent primitive type.",
                "\"undefined\", because null denotes an unassigned value.",
                "\"object\", due to an intentional legacy quirk dating back to JavaScript's first implementation.",
                "\"boolean\", because null coerces to false in conditional checks.",
              ],
            },
            {
              id: 'q3',
              topic: 'Functions',
              question: "How do arrow functions handle the 'this' keyword compared to regular function declarations?",
              options: [
                "Arrow functions automatically rebind 'this' to the global window/globalThis object.",
                "Arrow functions do not have their own 'this'; they inherit 'this' lexically from their enclosing execution context.",
                "Arrow functions require explicit .bind(this) syntax before they can be invoked.",
                "Arrow functions bind 'this' to the DOM element that triggered the call.",
              ],
            },
            {
              id: 'q4',
              topic: 'Arrays',
              question: "Which array method transforms every element in an array and returns a new array without mutating the original?",
              options: [
                "forEach()",
                "splice()",
                "map()",
                "sort()",
              ],
            },
            {
              id: 'q5',
              topic: 'Basic DOM concepts',
              question: "Which DOM method is the modern standard to select the first element matching a CSS selector?",
              options: [
                "document.getElementsByClassName()",
                "document.querySelector()",
                "document.selectElement()",
                "document.getElementByIdAll()",
              ],
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
    return () => { isMounted = false; };
  }, []);

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    setIsSubmittingQuiz(true);
    setSubmissionError(null);

    try {
      const result = await api.submitAssessmentAnswers(
        profile,
        'JavaScript Fundamentals',
        selectedAnswers
      );

      setQuizResult(result);
      recordAssessmentAttempt(result);
    } catch (err) {
      console.error('Quiz submission failed:', err);
      setSubmissionError(err.message || 'Failed to submit assessment to server.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setSubmissionError(null);
  };

  const currentQ = questions[currentIndex];
  const allAnswered = questions.length > 0 && questions.every((q) => selectedAnswers[q.id] !== undefined);

  // Overall modules tracking
  const allRoadmapModules = analysis?.roadmap?.modules || [];
  const totalModuleCount = allRoadmapModules.length || 1;
  const completedCount = completedModules.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalModuleCount) * 100));

  return (
    <section className="max-w-5xl mx-auto py-2 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner - Crisp White Frosted Glass */}
      <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 border border-rose-200/80">
                <Activity className="w-3.5 h-3.5 text-rose-500" />
                Adaptive Assessment &amp; Skill Progression
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Backend Server Grading
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Assessments &amp; Adaptive Learning
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Verify competencies via multiple-choice testing. Our adaptive engine dynamically assigns learning tiers based on your real performance.
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex p-1 bg-slate-100 border border-slate-200/80 rounded-2xl self-start sm:self-center">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Take Assessment
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tracking'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Progress &amp; History ({assessmentHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Roadmap Completed</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {completedCount} / {totalModuleCount}
          </div>
          <span className="text-xs text-rose-600 font-semibold">{progressPercent}% Completion</span>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Best Test Score</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {bestScore}%
          </div>
          <span className="text-xs text-slate-500 font-medium">JavaScript Fundamentals</span>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {assessmentHistory.length}
          </div>
          <span className="text-xs text-slate-500 font-medium">Recorded tests</span>
        </div>

        <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Role</span>
          <div className="text-sm font-bold text-slate-800 mt-1 truncate">
            {profile.careerGoal}
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-calibrated</span>
        </div>
      </div>

      {/* 3. TAB 1: QUIZ / ASSESSMENT */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {!quizResult ? (
            /* Active Assessment Card */
            <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              {/* Quiz Header & Step Bar */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      Topic: {currentQ?.topic || 'Core JavaScript'}
                    </span>
                    <span className="text-slate-500 font-medium">JavaScript Fundamentals Test</span>
                  </div>

                  <span className="text-slate-800 font-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              {isLoadingQuestions ? (
                <div className="py-16 text-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading assessment questions...
                </div>
              ) : currentQ ? (
                <div className="space-y-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* 4 Answer Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[currentQ.id] === optIdx;
                      const letters = ['A', 'B', 'C', 'D'];

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 group ${
                            isSelected
                              ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-sm ring-2 ring-rose-400/30'
                              : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                              isSelected
                                ? 'bg-rose-500 text-white shadow'
                                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                            }`}
                          >
                            {letters[optIdx]}
                          </div>
                          <span className="text-sm font-medium leading-relaxed flex-1">
                            {option}
                          </span>
                          {isSelected && (
                            <Check className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Error Notification */}
                  {submissionError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                      <span>{submissionError}</span>
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentIndex < questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={selectedAnswers[currentQ.id] === undefined}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-rose-500/20 active:scale-95"
                        >
                          Next Question <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitAssessment}
                          disabled={!allAnswered || isSubmittingQuiz}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                        >
                          {isSubmittingQuiz ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Server Validating Answers...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Assessment</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            /* Results Screen */
            <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in">
              {/* Result Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50/50 to-white border border-rose-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
                      Assessment Verified
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      quizResult.score >= 80 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : quizResult.score >= 60 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {quizResult.adaptive_tier_label}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {quizResult.score >= 80 
                      ? '🎉 Outstanding Mastery!' 
                      : quizResult.score >= 60 
                      ? '⚡ Solid Foundation!' 
                      : '📚 Beginner Revision Recommended'}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    {quizResult.performance_analysis}
                  </p>
                </div>

                {/* Score Big Display */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-rose-200 shadow-md min-w-[130px] self-start sm:self-center">
                  <span className="text-4xl sm:text-5xl font-black text-rose-600 tracking-tight">
                    {quizResult.score}%
                  </span>
                  <span className="text-xs text-slate-500 font-semibold mt-1">
                    {quizResult.correct_count} of {quizResult.total_questions} Correct
                  </span>
                </div>
              </div>

              {/* Adaptive Rule Enforcement Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <strong className="text-slate-800 font-bold">
                    Deterministic Adaptive Decision:
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    {quizResult.next_step}
                  </p>
                </div>
              </div>

              {/* Weak Concepts & Recommended Exercises */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Weak concepts */}
                <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Identified Weak Concepts ({quizResult.weak_concepts?.length || 0})
                  </h4>
                  {quizResult.weak_concepts?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {quizResult.weak_concepts.map((c, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero weak concepts identified. Perfect score!
                    </p>
                  )}
                </div>

                {/* Recommended Exercises */}
                <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-amber-500" />
                    Targeted Adaptive Exercises
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {quizResult.recommended_exercises?.map((ex, idx) => (
                      <li key={idx} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 font-medium">
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleRetake}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
                </button>

                <button
                  onClick={() => setActiveTab('tracking')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-rose-500/20"
                >
                  View Overall Progress &amp; History <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: PROGRESS & ASSESSMENT HISTORY */}
      {activeTab === 'tracking' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Module Completion Section */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Roadmap Milestone Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Mark modules completed to dynamically adapt roadmap progress and unlock next milestones.
                </p>
              </div>
              <span className="text-xs font-extrabold text-rose-600">
                {completedCount} of {totalModuleCount} Finished
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {allRoadmapModules.map((m, idx) => {
                const isDone = completedModules.includes(m.title);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleModuleCompletion(m.title)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-transparent'
                      }`}>
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {m.title}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {m.duration_weeks || 2} weeks &bull; {m.difficulty || 'Medium'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}>
                      {isDone ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment Attempts History Table */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  Assessment Attempts Log
                </h3>
                <p className="text-xs text-slate-500">
                  Preserved history of test scores and adaptive evaluations.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('quiz');
                  handleRetake();
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                Take New Assessment
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Skill Tested</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Adaptive Tier</th>
                    <th className="py-3 px-3">Weak Concepts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {assessmentHistory.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {attempt.skill_name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {attempt.timestamp}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          attempt.score >= 80
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : attempt.score >= 60
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}>
                          {attempt.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {attempt.adaptive_tier_label}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {attempt.weak_concepts?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {attempt.weak_concepts.map((c, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] border border-rose-200">
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-600 text-xs font-bold">None (Mastered)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
