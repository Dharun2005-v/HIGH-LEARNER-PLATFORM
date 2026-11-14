import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for demo access
 */
export default function ProtectedRoute({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading demo session...</p>
        </div>
      </div>
    );
  }

  return children;
}
