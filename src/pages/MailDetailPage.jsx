import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Card from '../components/molecules/Card.jsx';
import MailPreview from '../components/organisms/MailPreview.jsx';
import { AlertModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';

export default function MailDetailPage({ user }) {
  const { mailId } = useParams();
  const navigate = useNavigate();
  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadMail();
  }, [mailId]);

  const loadMail = async () => {
    try {
      const data = await api.getMailDraft(mailId);
      setMail(data);
    } catch (error) {
      console.error('Error loading mail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      console.log('[MailDetailPage] handleUpdate called:', { id, data });
      await api.updateMailDraft(id, data.subject, data.body);
      console.log('[MailDetailPage] Update successful');
      setAlert({ title: 'Gelukt', message: 'Mail bijgewerkt', variant: 'success' });
      loadMail();
    } catch (error) {
      console.error('[MailDetailPage] Update error:', error);
      setAlert({ title: 'Fout', message: 'Fout bij bijwerken: ' + error.message, variant: 'error' });
    }
  };

  const handleApprove = async (id) => {
    try {
      console.log('[MailDetailPage] handleApprove called:', id);
      await api.approveMail(id);
      console.log('[MailDetailPage] Approve successful');
      setAlert({ title: 'Gelukt', message: 'Mail goedgekeurd', variant: 'success' });
      loadMail();
    } catch (error) {
      console.error('[MailDetailPage] Approve error:', error);
      setAlert({ title: 'Fout', message: 'Fout bij goedkeuren: ' + error.message, variant: 'error' });
    }
  };

  const handleSend = async (id) => {
    try {
      console.log('[MailDetailPage] handleSend called:', id);
      await api.sendMail(id);
      console.log('[MailDetailPage] Send successful');
      setAlert({ title: 'Gelukt', message: 'Mail gemarkeerd als verzonden', variant: 'success' });
      loadMail();
    } catch (error) {
      console.error('[MailDetailPage] Send error:', error);
      setAlert({ title: 'Fout', message: 'Fout bij verzenden: ' + error.message, variant: 'error' });
    }
  };

  const handleCopyEmail = () => {
    if (!mail) return;

    const emailText = `${mail.subject}\n\n${mail.body}`;
    navigator.clipboard.writeText(emailText).then(() => {
      setAlert({ title: 'Gekopieerd', message: 'E-mail tekst gekopieerd naar klembord', variant: 'success' });
    }).catch((error) => {
      setAlert({ title: 'Fout', message: 'Fout bij kopiëren: ' + error.message, variant: 'error' });
    });
  };

  const canEdit = user?.role === 'admin' || user?.role === 'staf';
  const canApprove = user?.role === 'directie' || user?.role === 'admin';
  const canSend = user?.role === 'directie' || user?.role === 'admin';

  if (loading) return <div className="loading">Laden...</div>;
  if (!mail) return <div>Mail niet gevonden</div>;

  return (
    <div className="mail-detail-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate('/mail/outbox')}>
          <ArrowLeft size={20} />
          Terug
        </Button>
        <Button variant="primary" onClick={handleCopyEmail}>
          <Copy size={20} />
          Kopieer E-mail
        </Button>
      </div>

      <Card title="Mail preview">
        <MailPreview
          mail={mail}
          onUpdate={handleUpdate}
          onApprove={handleApprove}
          onSend={handleSend}
          canEdit={canEdit}
          canApprove={canApprove}
          canSend={canSend}
        />
      </Card>

      {alert && (
        <AlertModal
          isOpen={true}
          onClose={() => setAlert(null)}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
        />
      )}
    </div>
  );
}
