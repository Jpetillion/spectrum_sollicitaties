import { useState } from 'react';
import Button from '../atoms/Button.jsx';
import FormRow from '../molecules/FormRow.jsx';
import Input from '../atoms/Input.jsx';
import Textarea from '../atoms/Textarea.jsx';
import Badge from '../atoms/Badge.jsx';
import { MAIL_STATUS_LABELS } from '../../../shared/constants.js';

export default function MailPreview({ mail, onUpdate, onApprove, onSend, canEdit = false, canApprove = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(mail.subject);
  const [body, setBody] = useState(mail.body);

  console.log('[MailPreview] Rendering with:', {
    mailId: mail.id,
    status: mail.status,
    canEdit,
    canApprove,
    showSendButton: canApprove && mail.status === 'draft'
  });

  const handleSave = async () => {
    console.log('[MailPreview] handleSave called:', { mailId: mail.id, subject, body });
    await onUpdate(mail.id, { subject, body });
    console.log('[MailPreview] Save completed');
    setIsEditing(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'approved': return 'info';
      case 'sent': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="mail-preview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <Badge variant={getStatusVariant(mail.status)}>
          {MAIL_STATUS_LABELS[mail.status]}
        </Badge>
        {canEdit && mail.status === 'draft' && !isEditing && (
          <Button size="small" onClick={() => setIsEditing(true)}>
            Bewerken
          </Button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FormRow label="Onderwerp">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </FormRow>
          <FormRow label="Bericht">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
            />
          </FormRow>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={handleSave}>Opslaan</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Annuleren
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.5rem 0' }}>
            <strong style={{ color: '#374151', marginRight: '0.5rem' }}>Kandidaat:</strong>
            <span>{mail.candidate_name}</span>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            <strong style={{ color: '#374151', marginRight: '0.5rem' }}>Onderwerp:</strong>
            <span>{mail.subject}</span>
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            {mail.body.split('\n').map((line, i) => (
              <p key={i} style={{ margin: line ? '0 0 1rem 0' : '0.5rem 0' }}>{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      )}

      {canApprove && mail.status === 'draft' && (
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid #e5e7eb',
          display: 'flex',
          gap: '1rem'
        }}>
          <Button onClick={() => {
            console.log('[MailPreview] Send button clicked, mailId:', mail.id);
            onSend(mail.id);
          }} variant="success">
            Markeer als verzonden
          </Button>
        </div>
      )}
    </div>
  );
}
