import { useEffect } from 'react';
import Button from '../atoms/Button.jsx';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'medium', showCloseButton = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal__header">
            {title && <h2 className="modal__title">{title}</h2>}
            {showCloseButton && (
              <button className="modal__close" onClick={onClose} aria-label="Sluiten">
                ×
              </button>
            )}
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience component for confirm dialogs
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Bevestigen',
  message,
  confirmText = 'Bevestigen',
  cancelText = 'Annuleren',
  confirmVariant = 'primary',
  loading = false
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      showCloseButton={!loading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Bezig...' : confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}

// Convenience component for alert/success messages
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success', // 'success', 'error', 'info'
  buttonText = 'OK'
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <Button variant="primary" onClick={onClose}>
          {buttonText}
        </Button>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
