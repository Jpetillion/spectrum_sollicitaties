import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import FormRow from '../components/molecules/FormRow.jsx';
import OtpInput from '../components/molecules/OtpInput.jsx';
import { api } from '../lib/apiClient.js';

export default function MfaSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [regenerateCode, setRegenerateCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState([]);

  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    setLoading(true);
    try {
      const data = await api.mfaGetStatus();
      setMfaEnabled(data.enabled);
      setBackupCodesRemaining(data.backupCodesRemaining);
    } catch (err) {
      setError(err.message || 'Kan MFA status niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = () => {
    navigate('/mfa-setup');
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.mfaDisable(disablePassword);
      setSuccess('Tweestapsverificatie is uitgeschakeld');
      setMfaEnabled(false);
      setShowDisableForm(false);
      setDisablePassword('');
      setBackupCodesRemaining(0);
    } catch (err) {
      setError(err.message || 'Kan tweestapsverificatie niet uitschakelen');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await api.mfaRegenerateBackupCodes(regenerateCode);
      setNewBackupCodes(data.backupCodes);
      setSuccess('Nieuwe backup codes gegenereerd');
      setRegenerateCode('');
      setBackupCodesRemaining(8);
    } catch (err) {
      setError(err.message || 'Kan backup codes niet regenereren');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `Het Spectrum - Backup Codes voor Tweestapsverificatie\n\nBewaar deze codes op een veilige plaats.\nElke code kan slechts één keer gebruikt worden.\n\n${newBackupCodes.join('\n')}\n\nAangemaakt op: ${new Date().toLocaleDateString('nl-BE')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'het-spectrum-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintBackupCodes = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Het Spectrum - Backup Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            p { margin-bottom: 20px; }
            .codes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .code { font-family: monospace; font-size: 18px; padding: 10px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>Het Spectrum - Backup Codes voor Tweestapsverificatie</h1>
          <p>Bewaar deze codes op een veilige plaats. Elke code kan slechts één keer gebruikt worden.</p>
          <div class="codes">
            ${newBackupCodes.map(code => `<div class="code">${code}</div>`).join('')}
          </div>
          <p style="margin-top: 30px;">Aangemaakt op: ${new Date().toLocaleDateString('nl-BE')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCloseBackupCodes = () => {
    setNewBackupCodes([]);
    setShowRegenerateForm(false);
  };

  if (loading && !mfaEnabled && !showDisableForm && !showRegenerateForm) {
    return (
      <div className="mfa-settings-page">
        <div className="page-content">
          <p>MFA status laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mfa-settings-page">
      <div className="page-header">
        <h1>Tweestapsverificatie Instellingen</h1>
        <p className="text-muted">
          Beveilig uw account met een extra verificatiestap bij het inloggen
        </p>
      </div>

      <div className="page-content">
        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="mfa-status-card">
          <div className="mfa-status-card__header">
            <h2>Status</h2>
            <div className={`status-badge status-badge--${mfaEnabled ? 'active' : 'inactive'}`}>
              {mfaEnabled ? 'Actief' : 'Inactief'}
            </div>
          </div>

          {mfaEnabled ? (
            <>
              <p>
                Tweestapsverificatie is momenteel <strong>ingeschakeld</strong> voor uw account.
                Bij het inloggen moet u een code invoeren uit uw authenticator app.
              </p>
              <div className="mfa-info">
                <p>
                  <strong>Backup codes resterend:</strong> {backupCodesRemaining} van 8
                </p>
                {backupCodesRemaining <= 2 && (
                  <div className="alert alert--warning">
                    U heeft nog maar {backupCodesRemaining} backup codes over. Genereer nieuwe codes.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p>
                Tweestapsverificatie is momenteel <strong>uitgeschakeld</strong> voor uw account.
              </p>
              <div className="alert alert--info">
                We raden aan om tweestapsverificatie in te schakelen voor extra beveiliging.
              </div>
            </>
          )}
        </div>

        {!mfaEnabled && (
          <div className="mfa-action-card">
            <h3>Tweestapsverificatie Inschakelen</h3>
            <p>
              Bescherm uw account door naast uw wachtwoord ook een code uit een authenticator app te vereisen.
            </p>
            <Button variant="primary" onClick={handleEnableMfa}>
              Inschakelen
            </Button>
          </div>
        )}

        {mfaEnabled && !showDisableForm && !showRegenerateForm && newBackupCodes.length === 0 && (
          <>
            <div className="mfa-action-card">
              <h3>Backup Codes Regenereren</h3>
              <p>
                Genereer nieuwe backup codes als u uw huidige codes kwijt bent of als u ze allemaal gebruikt heeft.
                Dit zal uw oude backup codes ongeldig maken.
              </p>
              <Button variant="secondary" onClick={() => setShowRegenerateForm(true)}>
                Regenereren
              </Button>
            </div>

            <div className="mfa-action-card mfa-action-card--danger">
              <h3>Tweestapsverificatie Uitschakelen</h3>
              <p>
                Door tweestapsverificatie uit te schakelen wordt uw account minder veilig.
                U heeft alleen uw wachtwoord nodig om in te loggen.
              </p>
              <Button variant="danger" onClick={() => setShowDisableForm(true)}>
                Uitschakelen
              </Button>
            </div>
          </>
        )}

        {showRegenerateForm && newBackupCodes.length === 0 && (
          <div className="mfa-form-card">
            <h3>Backup Codes Regenereren</h3>
            <p>Voer de 6-cijferige code uit uw authenticator app in om uw identiteit te bevestigen:</p>
            <form onSubmit={handleRegenerateBackupCodes}>
              <div className="otp-input-wrapper">
                <OtpInput
                  length={6}
                  value={regenerateCode}
                  onChange={setRegenerateCode}
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowRegenerateForm(false);
                    setRegenerateCode('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || regenerateCode.length !== 6}
                >
                  {loading ? 'Regenereren...' : 'Regenereren'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {newBackupCodes.length > 0 && (
          <div className="mfa-form-card">
            <h3>Nieuwe Backup Codes</h3>
            <div className="alert alert--warning">
              <strong>Belangrijk:</strong> Bewaar deze codes op een veilige plaats. Elke code kan slechts één keer gebruikt worden.
              Deze codes worden niet opnieuw getoond!
            </div>
            <div className="backup-codes-grid">
              {newBackupCodes.map((code, index) => (
                <div key={index} className="backup-code">
                  {code}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <Button variant="secondary" onClick={handleDownloadBackupCodes}>
                Download Codes
              </Button>
              <Button variant="secondary" onClick={handlePrintBackupCodes}>
                Print Codes
              </Button>
              <Button variant="primary" onClick={handleCloseBackupCodes}>
                Sluiten
              </Button>
            </div>
          </div>
        )}

        {showDisableForm && (
          <div className="mfa-form-card mfa-form-card--danger">
            <h3>Tweestapsverificatie Uitschakelen</h3>
            <p>Voer uw wachtwoord in om tweestapsverificatie uit te schakelen:</p>
            <form onSubmit={handleDisableMfa}>
              <FormRow label="Wachtwoord" htmlFor="disable-password">
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Uw wachtwoord"
                  required
                  disabled={loading}
                />
              </FormRow>
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDisableForm(false);
                    setDisablePassword('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Annuleren
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  disabled={loading || !disablePassword}
                >
                  {loading ? 'Uitschakelen...' : 'Uitschakelen'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="mfa-help-section">
          <h3>Hulp nodig?</h3>
          <ul>
            <li>Gebruik Google Authenticator of Microsoft Authenticator als authenticator app</li>
            <li>Backup codes zijn 8-cijferig en kunnen elk slechts één keer gebruikt worden</li>
            <li>Bewaar uw backup codes op een veilige plaats voor noodgevallen</li>
            <li>Neem contact op met de beheerder als u geen toegang meer heeft tot uw account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
