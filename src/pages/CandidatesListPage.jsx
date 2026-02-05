import { useState, useEffect } from 'react';
import { Trash } from '@phosphor-icons/react';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import Textarea from '../components/atoms/Textarea.jsx';
import Modal from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';
import { formatDate } from '../lib/format.js';

export default function CandidatesListPage({ user }) {
  const [allCandidates, setAllCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState(null); // { id, field }

  const canEdit = user?.role === 'staf' || user?.role === 'admin' || user?.role === 'directie';
  const canDelete = user?.role === 'admin' || user?.role === 'directie';

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
      setError('Fout bij opslaan: ' + error.message);
    } finally {
      setSaving(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(candidates.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (candidateId) => {
    if (selectedIds.includes(candidateId)) {
      setSelectedIds(selectedIds.filter(id => id !== candidateId));
    } else {
      setSelectedIds([...selectedIds, candidateId]);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await Promise.all(selectedIds.map(id => api.deleteCandidate(id)));
      await loadCandidates();
      setSelectedIds([]);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message || 'Er is een fout opgetreden bij het verwijderen');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="loading">Laden...</div>;

  const allSelected = candidates.length > 0 && selectedIds.length === candidates.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < candidates.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Kandidaten</h1>
          <p className="page-subtitle" style={{ visibility: selectedIds.length > 0 ? 'visible' : 'hidden' }}>
            {selectedIds.length > 0 ? `${selectedIds.length} ${selectedIds.length === 1 ? 'kandidaat' : 'kandidaten'} geselecteerd` : 'placeholder'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', minHeight: '40px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash size={20} weight="bold" />
              Verwijder geselecteerde
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <Input
          type="search"
          placeholder="Zoek kandidaten op naam, vakken of notities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {candidates.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#666' }}>Nog geen kandidaten</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Naam</th>
                  <th>Vakken</th>
                  <th>Interne notities</th>
                  <th>Sollicitaties</th>
                  <th>Toegevoegd</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(candidate.id)}
                        onChange={() => handleSelectOne(candidate.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      {canEdit ? (
                        <Input
                          value={candidate.name || ''}
                          onChange={(e) => setAllCandidates(prev => prev.map(c =>
                            c.id === candidate.id ? { ...c, name: e.target.value } : c
                          ))}
                          onBlur={(e) => handleFieldUpdate(candidate.id, 'name', e.target.value)}
                          disabled={saving === candidate.id}
                          style={{ minWidth: '150px' }}
                        />
                      ) : (
                        candidate.name
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <Input
                          value={candidate.subjects || ''}
                          onChange={(e) => setAllCandidates(prev => prev.map(c =>
                            c.id === candidate.id ? { ...c, subjects: e.target.value } : c
                          ))}
                          onBlur={(e) => handleFieldUpdate(candidate.id, 'subjects', e.target.value)}
                          disabled={saving === candidate.id}
                          style={{ minWidth: '200px' }}
                        />
                      ) : (
                        candidate.subjects || '-'
                      )}
                    </td>
                    <td>
                      {canEdit ? (
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
                      ) : (
                        candidate.staff_notes || '-'
                      )}
                    </td>
                    <td>{candidate.application_count || 0}</td>
                    <td>{formatDate(candidate.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showDeleteModal} onClose={() => !deleting && setShowDeleteModal(false)} title="Kandidaten verwijderen">
        <p style={{ marginBottom: '1.5rem' }}>
          Weet je zeker dat je <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'kandidaat' : 'kandidaten'} wilt verwijderen?
        </p>
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Dit verwijdert ook alle gekoppelde sollicitaties en documenten. Deze actie kan niet ongedaan worden gemaakt.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="danger" onClick={handleBulkDelete} disabled={deleting}>
            {deleting ? 'Verwijderen...' : 'Ja, verwijderen'}
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Annuleren
          </Button>
        </div>
      </Modal>
    </div>
  );
}
