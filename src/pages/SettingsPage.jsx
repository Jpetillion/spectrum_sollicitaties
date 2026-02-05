import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import FormRow from '../components/molecules/FormRow.jsx';
import { api } from '../lib/apiClient.js';

export default function SettingsPage({ user, onUserUpdated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // MFA status
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getMyProfile();
      setName(data.name || '');
      setEmail(data.email || '');
      setMfaEnabled(data.mfaEnabled || false);
    } catch (err) {
      setError(err.message || 'Kan profiel niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Naam is verplicht');
      return;
    }

    if (name.trim().length < 2) {
      setError('Naam moet minstens 2 karakters bevatten');
      return;
    }

    setLoading(true);
    try {
      const data = await api.updateMyProfile({ name: name.trim() });
      setSuccess('Profiel succesvol bijgewerkt');

      // Update parent component with new user data
      if (onUserUpdated && data.user) {
        onUserUpdated(data.user);
      }
    } catch (err) {
      setError(err.message || 'Kan profiel niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Huidig wachtwoord is verplicht');
      return;
    }

    if (!newPassword) {
      setError('Nieuw wachtwoord is verplicht');
      return;
    }

    if (newPassword.length < 8) {
      setError('Nieuw wachtwoord moet minstens 8 karakters bevatten');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setLoading(true);
    try {
      await api.updateMyProfile({ currentPassword, newPassword });
      setSuccess('Wachtwoord succesvol gewijzigd');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Kan wachtwoord niet wijzigen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Instellingen</h1>
        <p className="page-subtitle">Beheer je profiel en beveiligingsinstellingen</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Profiel</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateProfile}>
            <FormRow label="Naam" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je volledige naam"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="E-mail">
              <Input
                type="email"
                value={email}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>
                Email adres kan niet worden gewijzigd. Neem contact op met een administrator.
              </small>
            </FormRow>

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Bijwerken...' : 'Profiel bijwerken'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Wachtwoord wijzigen</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdatePassword}>
            <FormRow label="Huidig wachtwoord" required>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="Nieuw wachtwoord" required>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>
                Minimaal 8 karakters
              </small>
            </FormRow>

            <FormRow label="Bevestig nieuw wachtwoord" required>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </FormRow>

            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* 2FA Section */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Tweestapsverificatie (2FA)</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
                Status: {mfaEnabled ? (
                  <span style={{ color: '#16a34a' }}>✓ Ingeschakeld</span>
                ) : (
                  <span style={{ color: '#666' }}>Uitgeschakeld</span>
                )}
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                {mfaEnabled
                  ? 'Je account is beveiligd met tweestapsverificatie'
                  : 'Verhoog je accountbeveiliging met tweestapsverificatie'
                }
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              variant="secondary"
              onClick={() => navigate('/mfa-settings')}
            >
              {mfaEnabled ? 'Beheer 2FA' : 'Activeer 2FA'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
