import { useState, useEffect } from 'react';
import Button from '../components/atoms/Button.jsx';
import Input from '../components/atoms/Input.jsx';
import FormRow from '../components/molecules/FormRow.jsx';
import Modal from '../components/molecules/Modal.jsx';
import { api } from '../lib/apiClient.js';

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staf',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Kan gebruikers niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Alle velden zijn verplicht');
      return;
    }

    if (formData.password.length < 8) {
      setError('Wachtwoord moet minstens 8 karakters bevatten');
      return;
    }

    setLoading(true);
    try {
      await api.createUser(formData);
      setSuccess(`Gebruiker ${formData.name} succesvol aangemaakt`);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'staf', password: '' });
      loadUsers();
    } catch (err) {
      setError(err.message || 'Kan gebruiker niet aanmaken');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Naam en email zijn verplicht');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('Wachtwoord moet minstens 8 karakters bevatten');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.updateUser(selectedUser.id, updateData);
      setSuccess(`Gebruiker ${formData.name} succesvol bijgewerkt`);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', role: 'staf', password: '' });
      loadUsers();
    } catch (err) {
      setError(err.message || 'Kan gebruiker niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.deleteUser(selectedUser.id);
      setSuccess(`Gebruiker ${selectedUser.name} succesvol verwijderd`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Kan gebruiker niet verwijderen');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Don't pre-fill password
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setError('');
    setSuccess('');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'directie':
        return '#2563eb';
      case 'staf':
        return '#16a34a';
      default:
        return '#666';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'directie':
        return 'Directie';
      case 'staf':
        return 'Staf';
      default:
        return role;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gebruikersbeheer</h1>
          <p className="page-subtitle">Beheer alle gebruikers van het systeem</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({ name: '', email: '', role: 'staf', password: '' });
            setShowCreateModal(true);
            setError('');
            setSuccess('');
          }}
        >
          + Nieuwe gebruiker
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {success}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Gebruikers laden...</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>2FA</th>
                  <th>Aangemaakt</th>
                  <th style={{ textAlign: 'right' }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          backgroundColor: getRoleBadgeColor(user.role) + '20',
                          color: getRoleBadgeColor(user.role)
                        }}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      {user.mfaEnabled ? (
                        <span style={{ color: '#16a34a' }}>✓ Actief</span>
                      ) : (
                        <span style={{ color: '#666' }}>−</span>
                      )}
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('nl-BE')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          Bewerken
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>Geen gebruikers gevonden</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nieuwe gebruiker aanmaken"
      >
          <form onSubmit={handleCreateUser}>
            <FormRow label="Naam" required>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Volledige naam"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="gebruiker@onderwijs.gent.be"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="Rol" required>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={loading}
              >
                <option value="staf">Staf</option>
                <option value="directie">Directie</option>
                <option value="admin">Admin</option>
              </select>
            </FormRow>

            <FormRow label="Tijdelijk wachtwoord" required>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimaal 8 karakters"
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>
                De gebruiker kan dit later zelf wijzigen in hun instellingen
              </small>
            </FormRow>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Aanmaken...' : 'Gebruiker aanmaken'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={loading}
              >
                Annuleren
              </Button>
            </div>
          </form>
        </Modal>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setShowEditModal(false)}
          title={`Gebruiker bewerken: ${selectedUser.name}`}
        >
          <form onSubmit={handleEditUser}>
            <FormRow label="Naam" required>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Volledige naam"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="Email" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="gebruiker@onderwijs.gent.be"
                disabled={loading}
              />
            </FormRow>

            <FormRow label="Rol" required>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={loading}
              >
                <option value="staf">Staf</option>
                <option value="directie">Directie</option>
                <option value="admin">Admin</option>
              </select>
            </FormRow>

            <FormRow label="Nieuw wachtwoord (optioneel)">
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Laat leeg om niet te wijzigen"
                disabled={loading}
              />
              <small style={{ color: '#666', fontSize: '0.875rem' }}>
                Laat dit veld leeg als je het wachtwoord niet wilt wijzigen
              </small>
            </FormRow>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Opslaan...' : 'Wijzigingen opslaan'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Annuleren
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteModal(false)}
          title="Gebruiker verwijderen"
        >
          <p style={{ marginBottom: '1.5rem' }}>
            Weet je zeker dat je <strong>{selectedUser.name}</strong> ({selectedUser.email}) wilt verwijderen?
          </p>
          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Deze actie kan niet ongedaan worden gemaakt.
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? 'Verwijderen...' : 'Ja, verwijderen'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={loading}
            >
              Annuleren
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
