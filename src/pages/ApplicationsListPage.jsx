import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Badge from '../components/atoms/Badge.jsx';
import Input from '../components/atoms/Input.jsx';
import Table from '../components/molecules/Table.jsx';
import { ConfirmModal, AlertModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';
import { APPLICATION_STATUS, APPLICATION_STATUS_LABELS, STATUS_VARIANTS } from '../../shared/constants.js';

export default function ApplicationsListPage({ user }) {
  const [allApplications, setAllApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getApplications();
      setAllApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live filter applications based on search term
  const applications = searchTerm
    ? allApplications.filter(app => {
        const searchLower = searchTerm.toLowerCase();
        return (
          app.candidate_name?.toLowerCase().includes(searchLower) ||
          app.candidate_subjects?.toLowerCase().includes(searchLower) ||
          app.staff_notes?.toLowerCase().includes(searchLower) ||
          app.jobs?.some(job => job.title?.toLowerCase().includes(searchLower))
        );
      })
    : allApplications;

  const handleDelete = async (id) => {
    try {
      await api.deleteApplication(id);
      setAlert({ title: 'Gelukt', message: 'Sollicitatie verwijderd', variant: 'success' });
      setConfirmDelete(null);
      loadApplications();
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij verwijderen: ' + error.message, variant: 'error' });
    }
  };

  const canEdit = user?.role === 'staf' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  const columns = [
    {
      header: 'Kandidaat',
      render: (app) => app.candidate_name || '-'
    },
    {
      header: 'Vakken',
      render: (app) => app.candidate_subjects || '-'
    },
    {
      header: 'Vacatures',
      render: (app) => app.jobs?.length > 0
        ? app.jobs.map(j => j.title).join(', ')
        : 'Spontaan'
    },
    {
      header: 'Status',
      render: (app) => (
        <Badge variant={STATUS_VARIANTS[app.status || APPLICATION_STATUS.IN_BEHANDELING]}>
          {APPLICATION_STATUS_LABELS[app.status || APPLICATION_STATUS.IN_BEHANDELING]}
        </Badge>
      )
    },
    {
      header: 'Volgende stap',
      render: (app) => app.next_step || '-'
    },
    {
      header: 'Datum',
      render: (app) => formatDate(app.created_at)
    },
    {
      header: 'Acties',
      render: (app) => (
        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => navigate(`/applications/${app.id}`)}
            >
              <PencilSimple size={16} />
              Wijzigen
            </Button>
          )}
          {canDelete && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => setConfirmDelete(app)}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div className="applications-list-page">
      <div className="page-header">
        <h1>Sollicitaties</h1>
        {canEdit && (
          <Link to="/applications/new">
            <Button variant="primary">
              <Plus size={20} weight="bold" />
              Nieuwe sollicitatie
            </Button>
          </Link>
        )}
      </div>

      <div className="search-bar">
        <Input
          type="search"
          placeholder="Zoek sollicitaties op kandidaat, vakken of vacature..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={applications}
        onRowClick={(app) => navigate(`/applications/${app.id}`)}
        emptyMessage="Nog geen sollicitaties"
      />

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
          title="Sollicitatie verwijderen"
          message={`Weet u zeker dat u de sollicitatie van "${confirmDelete.candidate_name}" wilt verwijderen?`}
          confirmText="Verwijderen"
          confirmVariant="primary"
        />
      )}

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
