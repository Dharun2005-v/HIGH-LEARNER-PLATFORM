import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS } from '../data/demoAccounts';

const AuthContext = createContext(null);
const STORAGE_KEY_AUTH = 'high_learner_auth_user';

export function AuthProvider({ children }) {
  // Initialize with saved user or default demo account (Alex Johnson)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading auth from localStorage:', e);
    }
    // Default logged in as Alex Johnson for seamless demo experience
    return DEMO_USERS[0];
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch (e) {
      console.warn('Error saving auth to localStorage:', e);
    }
  }, [user]);

  /**
   * Log in with a selected demo user or custom credentials
   */
  const signInDemo = (targetUserOrEmail, customName = '') => {
    setLoading(true);

    let selectedUser = null;

    if (typeof targetUserOrEmail === 'object' && targetUserOrEmail?.uid) {
      selectedUser = targetUserOrEmail;
    } else if (typeof targetUserOrEmail === 'string') {
      // Find matching preset
      const found = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === targetUserOrEmail.toLowerCase()
      );
      if (found) {
        selectedUser = found;
      } else {
        // Create custom demo session
        const name = customName || targetUserOrEmail.split('@')[0] || 'Demo Learner';
        selectedUser = {
          uid: 'demo_user_' + Date.now(),
          name,
          email: targetUserOrEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          title: 'High Learner Student',
          profile: {
            fullName: name,
            education: 'Computer Science',
            skills: ['JavaScript', 'HTML/CSS', 'Python'],
            proficiency: { JavaScript: 2, 'HTML/CSS': 2, Python: 1 },
            certifications: [],
            projects: [],
            careerGoal: 'Full Stack Developer',
            availability: '10 hours per week',
          },
        };
      }
    }

    if (!selectedUser) {
      selectedUser = DEMO_USERS[0];
    }

    setUser(selectedUser);
    setLoading(false);
    return selectedUser;
  };

  /**
   * Log out active user
   */
  const logout = () => {
    setUser(null);
  };

  /**
   * Return token for backend Bearer authorization
   */
  const getIdToken = async () => {
    return user ? `demo-token-${user.uid}` : 'demo-token-guest';
  };

  const isDemoMode = true; // Fully powered demo mode
  const isFirebaseConfigured = false;

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    isDemoMode,
    isFirebaseConfigured,
    availableDemoUsers: DEMO_USERS,
    signInDemo,
    logout,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
