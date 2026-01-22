import { useState, useEffect } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import Textarea from '../components/atoms/Textarea.jsx';
import Table from '../components/molecules/Table.jsx';
import { ConfirmModal, AlertModal } from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function CandidatesListPage({ user }) {
  const [allCandidates, setAllCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alert, setAlert] = useState(null);
  const [editingField, setEditingField] = useState(null); // { id, field }

  const canEdit = user?.role === 'staf' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await api.getCandidates();
      setAllCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live filter candidates based on search term
  const candidates = searchTerm
    ? allCandidates.filter(candidate => {
        const searchLower = searchTerm.toLowerCase();
        return (
          candidate.name?.toLowerCase().includes(searchLower) ||
          candidate.subjects?.toLowerCase().includes(searchLower) ||
          candidate.staff_notes?.toLowerCase().includes(searchLower)
        );
      })
    : allCandidates;

  const handleFieldUpdate = async (candidateId, field, value) => {
    if (!canEdit) return;

    const candidate = allCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    try {
      setSaving(candidateId);
      await api.updateCandidate(candidateId, {
        ...candidate,
        [field]: value
      });
      setAllCandidates(prev => prev.map(c =>
        c.id === candidateId ? { ...c, [field]: value } : c
      ));
      setEditingField(null);
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij opslaan: ' + error.message, variant: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteCandidate(id);
      setAlert({ title: 'Gelukt', message: 'Kandidaat verwijderd', variant: 'success' });
      setConfirmDelete(null);
      loadCandidates();
    } catch (error) {
      setAlert({ title: 'Fout', message: 'Fout bij verwijderen: ' + error.message, variant: 'error' });
    }
  };

  const columns = [
    {
      header: 'Naam',
      render: (candidate) => canEdit ? (
        <Input
          value={candidate.name || ''}
          onChange={(e) => setAllCandidates(prev => prev.map(c =>
            c.id === candidate.id ? { ...c, name: e.target.value } : c
          ))}
          onBlur={(e) => handleFieldUpdate(candidate.id, 'name', e.target.value)}
          disabled={saving === candidate.id}
          style={{ minWidth: '150px' }}
        />
      ) : candidate.name
    },
    {
      header: 'Vakken',
      render: (candidate) => canEdit ? (
        <Input
          value={candidate.subjects || ''}
          onChange={(e) => setAllCandidates(prev => prev.map(c =>
            c.id === candidate.id ? { ...c, subjects: e.target.value } : c
          ))}
          onBlur={(e) => handleFieldUpdate(candidate.id, 'subjects', e.target.value)}
          disabled={saving === candidate.id}
          style={{ minWidth: '200px' }}
        />
      ) : (candidate.subjects || '-')
    },
    {
      header: 'Interne notities',
      render: (candidate) => canEdit ? (
        <Textarea
          value={candidate.staff_notes || ''}
          onChange={(e) => setAllCandidates(prev => prev.map(c =>
            c.id === candidate.id ? { ...c, staff_notes: e.target.value } : c
          ))}
          onBlur={(e) => handleFieldUpdate(candidate.id, 'staff_notes', e.target.value)}
          disabled={saving === candidate.id}
          rows={2}
          style={{ minWidth: '250px' }}
        />
      ) : (candidate.staff_notes || '-')
    },
    {
      header: 'Sollicitaties',
      render: (candidate) => candidate.application_count || 0
    },
    {
      header: 'Toegevoegd',
      render: (candidate) => formatDate(candidate.created_at)
    },
    {
      header: 'Acties',
      render: (candidate) => canDelete ? (
        <Button
          size="small"
          variant="secondary"
          onClick={() => setConfirmDelete(candidate)}
        >
          <Trash size={16} />
        </Button>
      ) : null
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div className="candidates-list-page">
      <div className="page-header">
        <h1>Kandidaten</h1>
      </div>

      <div className="search-bar">
        <Input
          type="search"
          placeholder="Zoek kandidaten op naam, vakken of notities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={candidates}
        emptyMessage="Nog geen kandidaten"
      />

      {confirmDelete && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete.id)}
          title="Kandidaat verwijderen"
          message={`Weet u zeker dat u "${confirmDelete.name}" wilt verwijderen? Dit verwijdert ook alle gekoppelde sollicitaties en documenten.`}
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
