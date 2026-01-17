import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layouts/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsListPage from './pages/JobsListPage.jsx';
import JobDetailPage from './pages/JobDetailPage.jsx';
import JobFormPage from './pages/JobFormPage.jsx';
import SelectionOverviewPage from './pages/SelectionOverviewPage.jsx';
import ApplicationsListPage from './pages/ApplicationsListPage.jsx';
import ApplicationFormPage from './pages/ApplicationFormPage.jsx';
import ApplicationDetailPage from './pages/ApplicationDetailPage.jsx';
import CandidatesListPage from './pages/CandidatesListPage.jsx';
import OutboxPage from './pages/OutboxPage.jsx';
import MailDetailPage from './pages/MailDetailPage.jsx';
import MfaSetupPage from './pages/MfaSetupPage.jsx';
import MfaSettingsPage from './pages/MfaSettingsPage.jsx';
import { api } from './lib/apiClient.js';

// Import styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return <div className="loading">Laden...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppLayout user={user}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/jobs" element={<JobsListPage user={user} />} />
        <Route path="/jobs/new" element={<JobFormPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage user={user} />} />
        <Route path="/jobs/:jobId/edit" element={<JobFormPage />} />
        <Route path="/jobs/:jobId/selection" element={<SelectionOverviewPage />} />

        <Route path="/applications" element={<ApplicationsListPage user={user} />} />
        <Route path="/applications/new" element={<ApplicationFormPage />} />
        <Route path="/applications/:applicationId" element={<ApplicationDetailPage user={user} />} />

        <Route path="/candidates" element={<CandidatesListPage user={user} />} />

        <Route path="/mail/outbox" element={<OutboxPage />} />
        <Route path="/mail/outbox/:mailId" element={<MailDetailPage user={user} />} />

        <Route path="/mfa-setup" element={<MfaSetupPage />} />
        <Route path="/mfa-settings" element={<MfaSettingsPage />} />

        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
