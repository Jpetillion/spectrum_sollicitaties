import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Card from '../components/molecules/Card.jsx';
import ApplicationForm from '../components/organisms/ApplicationForm.jsx';
import { AlertModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';

export default function ApplicationFormPage() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      const newApp = await api.createApplication(formData);
      setAlert({
        title: 'Gelukt',
        message: 'Sollicitatie aangemaakt. U kunt nu documenten uploaden.',
        variant: 'success',
        onClose: () => navigate(`/applications/${newApp.id}`)
      });
    } catch (error) {
      setAlert({
        title: 'Fout',
        message: 'Fout bij opslaan: ' + error.message,
        variant: 'error'
      });
    }
  };

  const handleAlertClose = () => {
    const onClose = alert?.onClose;
    setAlert(null);
    if (onClose) onClose();
  };

  return (
    <div className="application-form-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate('/applications')}>
          <ArrowLeft size={20} />
          Terug
        </Button>
      </div>

      <Card title="Nieuwe sollicitatie">
        <ApplicationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/applications')}
        />
      </Card>

      {alert && (
        <AlertModal
          isOpen={true}
          onClose={handleAlertClose}
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
        />
      )}
    </div>
  );
}
