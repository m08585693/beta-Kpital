import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateGoal from './pages/CreateGoal';
import GoalDetail from './pages/GoalDetail';
import Partners from './pages/Partners';
import Invitations from './pages/Invitations';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c12] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#4d9eff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c12] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#4d9eff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
      <Route path="/invitations" element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
      <Route path="/goals/new" element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} />
      <Route path="/goals/:id" element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}