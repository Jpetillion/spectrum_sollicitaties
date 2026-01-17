import { useState } from 'react';
import Button from '../atoms/Button.jsx';
import OtpInput from '../molecules/OtpInput.jsx';

export default function MfaLoginStep({ onVerify, onCancel, loading = false, error = '' }) {
  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.length === (isBackupCode ? 8 : 6)) {
      onVerify(code, isBackupCode);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (newCode.length === (isBackupCode ? 8 : 6) && !loading) {
      onVerify(newCode, isBackupCode);
    }
  };

  return (
    <div className="mfa-login-step">
      <div className="mfa-login-step__header">
        <h2>Tweestapsverificatie</h2>
        <p>Voer de {isBackupCode ? '8-cijferige backup code' : '6-cijferige code'} in uit uw authenticator app</p>
      </div>

      <form onSubmit={handleSubmit} className="mfa-login-step__form">
        {error && <div className="alert alert--error">{error}</div>}

        <div className="mfa-login-step__input">
          <OtpInput
            length={isBackupCode ? 8 : 6}
            value={code}
            onChange={handleCodeChange}
            disabled={loading}
          />
        </div>

        <div className="mfa-login-step__toggle">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsBackupCode(!isBackupCode);
              setCode('');
            }}
            disabled={loading}
          >
            {isBackupCode ? 'Gebruik authenticator app' : 'Gebruik backup code'}
          </button>
        </div>

        <div className="mfa-login-step__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || code.length !== (isBackupCode ? 8 : 6)}
          >
            {loading ? 'Verifiëren...' : 'Verifiëren'}
          </Button>
        </div>
      </form>

      <div className="mfa-login-step__help">
        <p className="text-muted text-small">
          Open uw Google Authenticator of Microsoft Authenticator app en voer de code in.
          Indien u uw telefoon kwijt bent, gebruik dan een backup code.
        </p>
      </div>
    </div>
  );
}
