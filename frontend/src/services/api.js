/**
 * HIGH LEARNER API Service Layer
 * Prompt 5 - Assessment and Adaptive Learning
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 25000;

class ApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = (baseUrl || 'http://localhost:8000').replace(/\/+$/, '');
    this.tokenGetter = null;
  }

  setTokenGetter(getter) {
    this.tokenGetter = getter;
  }

  async request(endpoint, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.tokenGetter && typeof this.tokenGetter === 'function') {
      try {
        const token = await this.tokenGetter();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn('Failed to attach auth token:', err);
      }
    }

    const config = {
      headers,
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `Request failed (${response.status})`;
        let errorBody = null;
        try {
          errorBody = await response.json();
          if (errorBody.detail) {
            errorDetail = typeof errorBody.detail === 'string' 
              ? errorBody.detail 
              : JSON.stringify(errorBody.detail);
          } else if (errorBody.message) {
            errorDetail = errorBody.message;
          }
        } catch {
          // not json
        }
        throw new ApiError(errorDetail, response.status, errorBody);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        'Unable to connect to the HIGH LEARNER AI backend. Please verify server is running on port 8000.',
        0,
        error
      );
    }
  }

  async getHealth() {
    return this.request('/api/health', { method: 'GET' }, 8000);
  }

  async analyzeCareer(profile) {
    if (!profile) throw new ApiError('Learner profile is required for career analysis.');

    const payload = {
      fullName: profile.fullName || 'Anonymous Learner',
      education: profile.education || 'Self-taught',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      proficiency: profile.proficiency || {},
      certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
      projects: Array.isArray(profile.projects) ? profile.projects : [],
      careerGoal: profile.careerGoal || 'Full Stack Developer',
      availability: profile.availability || '10 hours per week',
    };

    return this.request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCareerGoal(profile, newCareerGoal) {
    if (!profile) throw new ApiError('Profile is required to update career goal.');
    if (!newCareerGoal) throw new ApiError('New career goal cannot be empty.');

    const payload = {
      profile: {
        fullName: profile.fullName || 'Learner',
        education: profile.education || '',
        skills: profile.skills || [],
        proficiency: profile.proficiency || {},
        certifications: profile.certifications || [],
        projects: profile.projects || [],
        careerGoal: profile.careerGoal || 'Full Stack Developer',
        availability: profile.availability || '10 hours per week',
      },
      new_career_goal: newCareerGoal,
    };

    return this.request('/api/update-goal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch assessment questions (answers withheld on server)
   * GET /api/assessment/questions
   */
  async getAssessmentQuestions(skill = 'JavaScript Fundamentals') {
    const encoded = encodeURIComponent(skill);
    return this.request(`/api/assessment/questions?skill=${encoded}`);
  }

  /**
   * Submit assessment answers for server-side evaluation & grading
   * POST /api/assessment/submit
   */
  async submitAssessmentAnswers(profile, skillName, answers) {
    const payload = {
      profile: {
        fullName: profile?.fullName || 'Learner',
        education: profile?.education || '',
        skills: profile?.skills || [],
        proficiency: profile?.proficiency || {},
        certifications: profile?.certifications || [],
        projects: profile?.projects || [],
        careerGoal: profile?.careerGoal || 'Full Stack Developer',
        availability: profile?.availability || '10 hours per week',
      },
      skill_name: skillName || 'JavaScript Fundamentals',
      answers: answers || {},
    };

    return this.request('/api/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * AI Progress Mentor Chat with rich context
   * POST /api/mentor
   */
  async sendMentorMessage(userMessage, profile, context = {}) {
    if (!userMessage || !userMessage.trim()) {
      throw new ApiError('Message cannot be empty.');
    }

    const payload = {
      profile: {
        fullName: profile?.fullName || 'Learner',
        education: profile?.education || '',
        skills: profile?.skills || [],
        proficiency: profile?.proficiency || {},
        certifications: profile?.certifications || [],
        projects: profile?.projects || [],
        careerGoal: profile?.careerGoal || 'Full Stack Developer',
        availability: profile?.availability || '10 hours per week',
      },
      user_message: userMessage.trim(),
      assessment_info: context.assessment_info || {},
      completed_modules: context.completed_modules || [],
      assessment_history: context.assessment_history || [],
      current_weak_concepts: context.current_weak_concepts || [],
    };

    return this.request('/api/mentor', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Legacy manual score submission
   * POST /api/assessment
   */
  async submitAssessment(profile, skillName, score, weakConcepts = []) {
    const payload = {
      profile: {
        fullName: profile?.fullName || 'Learner',
        education: profile?.education || '',
        skills: profile?.skills || [],
        proficiency: profile?.proficiency || {},
        certifications: profile?.certifications || [],
        projects: profile?.projects || [],
        careerGoal: profile?.careerGoal || 'Full Stack Developer',
        availability: profile?.availability || '10 hours per week',
      },
      skill_name: skillName,
      score: Math.max(0, Math.min(100, parseInt(score, 10) || 0)),
      weak_concepts: Array.isArray(weakConcepts) ? weakConcepts : [],
    };

    return this.request('/api/assessment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
