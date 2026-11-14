import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LearnerProvider } from './context/LearnerContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SkillAnalysis from './pages/SkillAnalysis';
import Roadmap from './pages/Roadmap';
import Progress from './pages/Progress';

export default function App() {
  return (
    <AuthProvider>
      <LearnerProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              {/* Direct root to Dashboard */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/landing" element={<Landing />} />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/skill-analysis" 
                element={
                  <ProtectedRoute>
                    <SkillAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/roadmap" 
                element={
                  <ProtectedRoute>
                    <Roadmap />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </LearnerProvider>
    </AuthProvider>
  );
}
