import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import ConnectCalendar from './pages/ConnectCalendar';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"                element={<Navigate to="/splash" replace />} />
          <Route path="/splash"          element={<Splash />} />
          <Route path="/onboarding"      element={<Onboarding />} />
          <Route path="/login"           element={<Login />} />

          {}
          <Route path="/auth/callback"   element={<AuthCallback />} />

          <Route path="/connect-calendar" element={
            <ProtectedRoute>
              <ConnectCalendar />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
