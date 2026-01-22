import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PencilSimple, Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Card from '../components/molecules/Card.jsx';
import Table from '../components/molecules/Table.jsx';
import { AlertModal, ConfirmModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function JobDetailPage({ user }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      const jobData = await api.getJob(jobId);
      setJob(jobData);

      const applicationsData = await api.getApplications();
      setApplications(applicationsData.filter(app =>
        app.jobs?.some(j => j.id === parseInt(jobId))
      ));
    } catch (error) {
      console.error('Error loading job:', error);
      setAlert({ title: 'Fout', message: 'Fout bij laden vacature', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteJob(jobId);
      setAlert({
        title: 'Gelukt',
        message: 'Vacature verwijderd',
        variant: 'success',
        onClose: () => navigate('/jobs')
      });
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij verwijderen: ' + error.message, variant: 'error' });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'staf' || user?.role === 'directie';
  const canDelete = user?.role === 'admin';

  const applicationColumns = [
    {
      header: 'Kandidaat',
      render: (app) => app.candidate_name || '-'
    },
    {
      header: 'Vakken',
      render: (app) => app.candidate_subjects || '-'
    },
    {
      header: 'Datum',
      render: (app) => formatDate(app.created_at)
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;
  if (!job) return <div>Vacature niet gevonden</div>;

  const handleAlertClose = () => {
    const onClose = alert?.onClose;
    setAlert(null);
    if (onClose) onClose();
  };

  return (
    <div className="job-detail-page">
      <div className="page-header">
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={20} />
          Terug
        </Button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {canManage && (
            <Button onClick={() => navigate(`/jobs/${jobId}/edit`)}>
              <PencilSimple size={20} />
              Bewerken
            </Button>
          )}
          {canDelete && (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)}>
              <Trash size={20} />
              Verwijderen
            </Button>
          )}
        </div>
      </div>

      <Card title={job.title}>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Vak</label>
            <p>{job.vak || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Uren</label>
            <p>{job.hours || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Klassen</label>
            <p>{job.classes || '-'}</p>
          </div>
          <div className="detail-item">
            <label>Aangemaakt</label>
            <p>{formatDate(job.created_at)}</p>
          </div>
        </div>

        {job.notes && (
          <div className="detail-item" style={{ marginTop: '1rem' }}>
            <label>Opmerkingen</label>
            <p className="whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}
      </Card>

      <Card title="Sollicitaties">
        <Table
          columns={applicationColumns}
          data={applications}
          onRowClick={(app) => navigate(`/applications/${app.id}`)}
          emptyMessage="Nog geen sollicitaties voor deze vacature"
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

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Vacature verwijderen"
          message={`Weet u zeker dat u "${job.title}" wilt verwijderen? Alle gekoppelde sollicitaties blijven behouden.`}
          confirmText="Verwijderen"
          confirmVariant="primary"
          loading={deleting}
        />
      )}
    </div>
  );
}
