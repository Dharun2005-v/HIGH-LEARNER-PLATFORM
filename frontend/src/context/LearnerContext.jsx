import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const LearnerContext = createContext(null);

const DEFAULT_PROFILE = {
  fullName: 'Alex Johnson',
  education: 'Computer Science & Software Engineering',
  skills: ['JavaScript', 'HTML/CSS', 'Python', 'SQL', 'Git'],
  proficiency: {
    JavaScript: 3,
    'HTML/CSS': 3,
    Python: 2,
    SQL: 1,
    Git: 2,
  },
  certifications: ['AWS Certified Cloud Practitioner', 'Meta Frontend Developer'],
  projects: ['E-Commerce Web Platform', 'Student Analytics Portal'],
  careerGoal: 'Full Stack Developer',
  availability: '15 hours per week',
};

const DEFAULT_ANALYSIS = {
  career_readiness_score: 62,
  strengths: ['JavaScript', 'HTML/CSS', 'Git'],
  missing_skills: ['React', 'Node.js', 'Docker', 'REST APIs'],
  improvement_skills: ['Python', 'SQL'],
  skill_analysis: {
    strengths: ['JavaScript', 'HTML/CSS', 'Git'],
    weaknesses: ['Python', 'SQL'],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', relevance: 0.9 },
      { name: 'Meta Frontend Developer', relevance: 0.88 },
    ],
    projects: [
      { name: 'E-Commerce Web Platform', relevance: 0.85 },
      { name: 'Student Analytics Portal', relevance: 0.8 },
    ],
    overall_skill_score: 68,
    fallback: false,
  },
  career_match: {
    required_skills: [
      { skill: 'JavaScript', required_level: 3 },
      { skill: 'React', required_level: 3 },
      { skill: 'Node.js', required_level: 2 },
      { skill: 'HTML/CSS', required_level: 3 },
      { skill: 'SQL', required_level: 2 },
      { skill: 'Git', required_level: 2 },
    ],
    missing_skills: ['React', 'Node.js', 'Docker', 'REST APIs'],
    readiness_score: 62,
    insights: [
      'Strong core foundations in browser JavaScript and modern CSS.',
      'Prioritize React component architecture and Node.js REST API patterns to bridge full-stack requirements.',
    ],
    fallback: false,
  },
  roadmap: {
    modules: [
      {
        title: 'JavaScript Fundamentals & DOM Mastery',
        description: 'Deep dive into variables, closures, prototypical inheritance, arrays, and standard DOM query APIs.',
        duration_weeks: 2,
        difficulty: 'Easy',
        resources: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://www.freecodecamp.org/'],
        exercise: 'Build an interactive algorithmic task tracker manipulating the DOM directly.',
      },
      {
        title: 'React Architecture & State Management',
        description: 'Advanced components, hooks (useState, useEffect, useMemo), Context API, and modular architecture.',
        duration_weeks: 3,
        difficulty: 'Medium',
        resources: ['https://react.dev/', 'https://www.freecodecamp.org/'],
        exercise: 'Build a production-grade career portfolio tracker with search and filter state.',
      },
      {
        title: 'Node.js & Express RESTful Microservices',
        description: 'Asynchronous event loop, Express routing, middleware pipelines, JWT auth, and error handling.',
        duration_weeks: 3,
        difficulty: 'Medium',
        resources: ['https://nodejs.org/en/learn'],
        exercise: 'Implement a secure CRUD API with rate limiting, input validation, and unit tests.',
      },
      {
        title: 'Full-Stack Integration, Database & CI/CD',
        description: 'Connecting React client with Express backend, CORS, SQL schema design, and automated deployment.',
        duration_weeks: 2,
        difficulty: 'Hard',
        resources: ['https://developer.mozilla.org/en-US/docs/Learn'],
        exercise: 'Deploy an integrated full-stack app to cloud infrastructure with automated CI/CD pipeline.',
      },
    ],
    total_duration_weeks: 10,
    fallback: false,
  },
  agent_insights: [
    'Readiness calculated based on standard industry requirements for Full Stack Developer.',
    'Prioritize closing gaps in high-weight required skills first.',
  ],
  next_recommendation: 'Master React Architecture & Component Lifecycle Patterns',
  agent_execution_statuses: {
    skill_analyst_fallback: false,
    career_matcher_fallback: false,
    learning_path_fallback: false,
  },
};

export function LearnerProvider({ children }) {
  const { user, getIdToken } = useAuth();
  const uid = user?.uid || 'guest';

  const STORAGE_KEY_PROFILE = `high_learner_profile_${uid}`;
  const STORAGE_KEY_ANALYSIS = `high_learner_analysis_${uid}`;
  const STORAGE_KEY_COMPLETED = `high_learner_completed_${uid}`;
  const STORAGE_KEY_ASSESSMENTS = `high_learner_assessments_${uid}`;

  // 1. Profile State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return user?.profile || DEFAULT_PROFILE;
  });

  // 2. Analysis State
  const [analysis, setAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ANALYSIS;
  });

  // 3. Completed Modules
  const [completedModules, setCompletedModules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['JavaScript Fundamentals & DOM Mastery'];
  });

  // 4. Assessment History State
  const [assessmentHistory, setAssessmentHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        skill_name: 'JavaScript Fundamentals',
        score: 80,
        correct_count: 4,
        total_questions: 5,
        weak_concepts: ['Basic DOM concepts'],
        adaptive_tier_label: 'Intermediate Reinforcement (60% - 80%)',
        timestamp: new Date().toLocaleDateString(),
      },
    ];
  });

  // 5. Loading & Error States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [error, setError] = useState(null);

  // When active persona switches, update profile & state
  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(`high_learner_profile_${user.uid}`);
      if (saved) {
        setProfile(JSON.parse(saved));
      } else if (user.profile) {
        setProfile(user.profile);
      }
    } catch (e) {
      if (user.profile) setProfile(user.profile);
    }
  }, [user?.uid]);

  // Wire API token getter to Auth
  useEffect(() => {
    api.setTokenGetter(getIdToken);
  }, [getIdToken]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile, STORAGE_KEY_PROFILE]);

  useEffect(() => {
    if (analysis) {
      try {
        localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysis));
      } catch {
        // ignore
      }
    }
  }, [analysis, STORAGE_KEY_ANALYSIS]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedModules));
    } catch {
      // ignore
    }
  }, [completedModules, STORAGE_KEY_COMPLETED]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(assessmentHistory));
    } catch {
      // ignore
    }
  }, [assessmentHistory, STORAGE_KEY_ASSESSMENTS]);

  // Auto-fetch live analysis on startup to ensure synchronization with backend
  useEffect(() => {
    let isMounted = true;
    const fetchLiveAnalysis = async () => {
      try {
        const live = await api.analyzeCareer(profile);
        if (isMounted && live) {
          setAnalysis(live);
        }
      } catch (err) {
        console.info('Backend live sync notice (using cached analysis):', err.message);
      }
    };

    fetchLiveAnalysis();
    return () => { isMounted = false; };
  }, []);

  /**
   * Run full career analysis via POST /api/analyze
   */
  const triggerAnalysis = async (customProfile = null) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);

    const targetProfile = customProfile || profile;

    try {
      const result = await api.analyzeCareer(targetProfile);
      setAnalysis(result);
      if (customProfile) {
        setProfile(customProfile);
      }
      return result;
    } catch (err) {
      console.error('Career Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please check backend connection.');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Update Career Goal via POST /api/update-goal
   */
  const updateGoal = async (newCareerGoal) => {
    if (!newCareerGoal || isUpdatingGoal) return;
    setIsUpdatingGoal(true);
    setError(null);

    try {
      const result = await api.updateCareerGoal(profile, newCareerGoal);

      const updatedProfile = { ...profile, careerGoal: newCareerGoal };
      setProfile(updatedProfile);

      setAnalysis((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          missing_skills: result.updated_gaps || prev.missing_skills,
          career_match: {
            ...prev.career_match,
            required_skills: result.updated_requirements || prev.career_match?.required_skills,
            missing_skills: result.updated_gaps || prev.career_match?.missing_skills,
          },
          roadmap: result.new_roadmap || prev.roadmap,
          next_recommendation: result.updated_gaps?.length 
            ? `Focus on high-priority gap: ${result.updated_gaps[0]}`
            : prev.next_recommendation,
        };
      });

      return result;
    } catch (err) {
      console.error('Goal update failed:', err);
      setError(err.message || 'Failed to update career goal.');
      throw err;
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  /**
   * Record new assessment attempt and update adaptive recommendations
   */
  const recordAssessmentAttempt = (evalResult) => {
    const attempt = {
      id: Date.now().toString(),
      skill_name: evalResult.skill_name || 'JavaScript Fundamentals',
      score: evalResult.score,
      correct_count: evalResult.correct_count,
      total_questions: evalResult.total_questions,
      weak_concepts: evalResult.weak_concepts || [],
      adaptive_tier_label: evalResult.adaptive_tier_label,
      adaptive_action: evalResult.adaptive_action,
      next_step: evalResult.next_step,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    setAssessmentHistory((prev) => [attempt, ...prev]);

    // Update global dashboard recommendation based on adaptive evaluation
    if (evalResult.next_step) {
      setAnalysis((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          next_recommendation: evalResult.next_step,
        };
      });
    }
  };

  /**
   * Toggle roadmap module completed status
   */
  const toggleModuleCompletion = (moduleTitle) => {
    setCompletedModules((prev) => 
      prev.includes(moduleTitle) 
        ? prev.filter((t) => t !== moduleTitle)
        : [...prev, moduleTitle]
    );
  };

  const updateProfile = (updater) => {
    setProfile((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return updated;
    });
  };

  // Derive latest weak concepts
  const currentWeakConcepts = assessmentHistory.length > 0 
    ? Array.from(new Set(assessmentHistory[0].weak_concepts || []))
    : [];

  // Derive best score
  const bestScore = assessmentHistory.reduce(
    (max, item) => (item.score > max ? item.score : max), 
    0
  );

  const clearError = () => setError(null);

  const value = {
    profile,
    setProfile,
    updateProfile,
    analysis,
    setAnalysis,
    completedModules,
    toggleModuleCompletion,
    assessmentHistory,
    recordAssessmentAttempt,
    currentWeakConcepts,
    bestScore,
    isAnalyzing,
    isUpdatingGoal,
    isSyncingFirestore: false,
    error,
    clearError,
    triggerAnalysis,
    updateGoal,
  };

  return (
    <LearnerContext.Provider value={value}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}
