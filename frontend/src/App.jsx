import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import OAuthSuccess from './pages/OAuthSuccess.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';
import Reports from './pages/Reports.jsx';
import Report from './pages/Report.jsx';
import Settings from './pages/Settings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { endpoints } from './api/api.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FirstRunTutorial />
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Shows the tutorial automatically the first time a user hits the dashboard.
function FirstRunTutorial() {
  const { user, refreshUser } = useAuth();
  const [show, setShow] = useState(user && !user.has_seen_tutorial);

  const close = async () => {
    setShow(false);
    try {
      await endpoints.updateSettings({ has_seen_tutorial: true });
      await refreshUser();
    } catch {
      /* non-critical */
    }
  };

  if (!show) return null;
  return <TutorialOverlay onClose={close} />;
}
