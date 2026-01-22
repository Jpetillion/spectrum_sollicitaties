import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Card from '../components/molecules/Card.jsx';
import JobForm from '../components/organisms/JobForm.jsx';
import { AlertModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';

export default function JobFormPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(!!jobId);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const data = await api.getJob(jobId);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      setAlert({ title: 'Fout', message: 'Fout bij laden vacature', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (jobId) {
        await api.updateJob(jobId, formData);
        setAlert({
          title: 'Gelukt',
          message: 'Vacature bijgewerkt',
          variant: 'success',
          onClose: () => navigate(`/jobs/${jobId}`)
        });
      } else {
        const newJob = await api.createJob(formData);
        setAlert({
          title: 'Gelukt',
          message: 'Vacature aangemaakt',
          variant: 'success',
          onClose: () => navigate(`/jobs/${newJob.id}`)
        });
      }
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij opslaan: ' + error.message, variant: 'error' });
    }
  };

  if (loading) return <div className="loading">Laden...</div>;

  const handleAlertClose = () => {
    const onClose = alert?.onClose;
    setAlert(null);
    if (onClose) onClose();
  };

  return (
    <div className="job-form-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={20} />
          Terug
        </Button>
      </div>

      <Card title={jobId ? 'Vacature bewerken' : 'Nieuwe vacature'}>
        <JobForm
          initialData={job || {}}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/jobs')}
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
