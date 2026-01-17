import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import Button from '../components/atoms/Button.jsx';
import OtpInput from '../components/molecules/OtpInput.jsx';
import { api } from '../lib/apiClient.js';

export default function MfaSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: generate, 2: verify, 3: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    generateMfaSetup();
  }, []);

  const generateMfaSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.mfaGenerateSetup();
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);

      // Generate QR code from otpauth URL
      const qrDataUrl = await QRCode.toDataURL(data.otpAuthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      setError(err.message || 'Kan MFA setup niet genereren');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (verificationCode.length !== 6) {
      setError('Voer een geldige 6-cijferige code in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.mfaVerifySetup(verificationCode);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Verificatie mislukt. Controleer uw code en probeer opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const text = `Het Spectrum - Backup Codes voor Tweestapsverificatie\n\nBewaar deze codes op een veilige plaats.\nElke code kan slechts één keer gebruikt worden.\n\n${backupCodes.join('\n')}\n\nAangemaakt op: ${new Date().toLocaleDateString('nl-BE')}`;
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
            ${backupCodes.map(code => `<div class="code">${code}</div>`).join('')}
          </div>
          <p style="margin-top: 30px;">Aangemaakt op: ${new Date().toLocaleDateString('nl-BE')}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleComplete = () => {
    navigate('/');
  };

  if (loading && step === 1) {
    return (
      <div className="mfa-setup-page">
        <div className="mfa-setup-card">
          <p>MFA setup wordt gegenereerd...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mfa-setup-page">
      <div className="mfa-setup-card">
        {step === 1 && (
          <>
            <div className="mfa-setup-card__header">
              <h1>Tweestapsverificatie Instellen</h1>
              <p>Stap 1 van 2: Scan QR-code met uw authenticator app</p>
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <div className="mfa-setup-card__content">
              <div className="qr-code-section">
                <h3>1. Scan deze QR-code</h3>
                <p className="text-muted">
                  Open Google Authenticator of Microsoft Authenticator op uw telefoon en scan deze code:
                </p>
                {qrCodeUrl && (
                  <div className="qr-code">
                    <img src={qrCodeUrl} alt="QR Code voor MFA setup" />
                  </div>
                )}
              </div>

              <div className="manual-entry-section">
                <h3>2. Of voer handmatig in</h3>
                <p className="text-muted">Als u de QR-code niet kunt scannen, voer deze code handmatig in:</p>
                <div className="secret-code">
                  <code>{secret}</code>
                </div>
              </div>

              <div className="backup-codes-section">
                <h3>3. Bewaar uw backup codes</h3>
                <p className="text-muted">
                  Deze codes kunt u gebruiken als u uw telefoon kwijt bent. Elke code kan slechts één keer gebruikt worden.
                </p>
                <div className="backup-codes-grid">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="backup-code">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="backup-codes-actions">
                  <Button variant="secondary" onClick={handleDownloadBackupCodes}>
                    Download Codes
                  </Button>
                  <Button variant="secondary" onClick={handlePrintBackupCodes}>
                    Print Codes
                  </Button>
                </div>
              </div>
            </div>

            <div className="mfa-setup-card__footer">
              <Button variant="primary" onClick={() => setStep(2)}>
                Volgende: Verifiëren
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mfa-setup-card__header">
              <h1>Tweestapsverificatie Instellen</h1>
              <p>Stap 2 van 2: Verifieer uw authenticator app</p>
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <div className="mfa-setup-card__content">
              <p className="text-center">
                Voer de 6-cijferige code in die u in uw authenticator app ziet:
              </p>
              <div className="otp-input-wrapper">
                <OtpInput
                  length={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mfa-setup-card__footer">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>
                Terug
              </Button>
              <Button
                variant="primary"
                onClick={handleVerifySetup}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifiëren...' : 'Verifiëren en Activeren'}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mfa-setup-card__header">
              <h1>Tweestapsverificatie Geactiveerd!</h1>
              <p>Uw account is nu beveiligd met tweestapsverificatie</p>
            </div>

            <div className="mfa-setup-card__content">
              <div className="success-icon">✓</div>
              <p className="text-center">
                De volgende keer dat u inlogt, zult u gevraagd worden om een code in te voeren uit uw authenticator app.
              </p>
              <div className="alert alert--info">
                <strong>Belangrijk:</strong> Zorg ervoor dat u uw backup codes hebt opgeslagen. U kunt deze gebruiken als u uw telefoon kwijt bent.
              </div>
            </div>

            <div className="mfa-setup-card__footer">
              <Button variant="primary" onClick={handleComplete}>
                Terug naar Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
