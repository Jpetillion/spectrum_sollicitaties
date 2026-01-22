import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/atoms/Badge.jsx';
import Input from '../components/atoms/Input.jsx';
import Table from '../components/molecules/Table.jsx';
import { api } from '../lib/apiClient.js';
import { formatDateTime } from '../lib/format.js';
import { MAIL_TEMPLATE_LABELS, MAIL_STATUS_LABELS } from '../../shared/constants.js';

export default function OutboxPage() {
  const navigate = useNavigate();
  const [allMails, setAllMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMails();
  }, [filter]);

  const loadMails = async () => {
    try {
      const filterStatus = filter === 'all' ? null : filter;
      const data = await api.getMailDrafts(filterStatus);
      setAllMails(data);
    } catch (error) {
      console.error('Error loading mails:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live filter mails based on search term
  const mails = searchTerm
    ? allMails.filter(mail => {
        const searchLower = searchTerm.toLowerCase();
        return (
          mail.candidate_name?.toLowerCase().includes(searchLower) ||
          mail.subject?.toLowerCase().includes(searchLower) ||
          mail.body?.toLowerCase().includes(searchLower)
        );
      })
    : allMails;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'sent': return 'success';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Kandidaat',
      render: (mail) => mail.candidate_name || '-'
    },
    {
      header: 'Type',
      render: (mail) => mail.generated_from_decision ? MAIL_TEMPLATE_LABELS[mail.generated_from_decision] : '-'
    },
    {
      header: 'Status',
      render: (mail) => (
        <Badge variant={getStatusVariant(mail.status)}>
          {MAIL_STATUS_LABELS[mail.status]}
        </Badge>
      )
    },
    {
      header: 'Aangemaakt',
      render: (mail) => formatDateTime(mail.created_at)
    },
    {
      header: 'Verzonden',
      render: (mail) => mail.sent_at ? formatDateTime(mail.sent_at) : '-'
    }
  ];

  if (loading) return <div className="loading">Laden...</div>;

  return (
    <div className="outbox-page">
      <div className="page-header">
        <h1>Mails - Outbox</h1>
      </div>

      <div className="search-bar">
        <Input
          type="search"
          placeholder="Zoek mails op kandidaat, onderwerp of inhoud..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <button
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Alles
        </button>
        <button
          className={`filter-button ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Concept
        </button>
        <button
          className={`filter-button ${filter === 'sent' ? 'active' : ''}`}
          onClick={() => setFilter('sent')}
        >
          Verzonden
        </button>
      </div>

      <Table
        columns={columns}
        data={mails}
        onRowClick={(mail) => navigate(`/mail/outbox/${mail.id}`)}
        emptyMessage="Nog geen e-mails. Wijzig de status van een sollicitatie om een e-mail te genereren."
      />
    </div>
  );
}
