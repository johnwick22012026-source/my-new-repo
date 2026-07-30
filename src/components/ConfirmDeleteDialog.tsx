import React, { useEffect } from 'react';
import './ConfirmDeleteDialog.css';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  noteText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ isOpen, noteText, onConfirm, onCancel }) => {
  // Trap focus inside dialog when open
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = document.getElementById('confirm-delete-dialog');
    if (!modal) return;

    const firstFocusableElement = modal.querySelectorAll<HTMLElement>(focusableElements)[0];
    const focusableContent = modal.querySelectorAll<HTMLElement>(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    firstFocusableElement?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) { // shift + tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else { // tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title" id="confirm-delete-dialog">
      <div className="dialog-content" tabIndex={-1}>
        <h2 id="dialog-title" className="dialog-title">Confirm Delete</h2>
        <p className="dialog-message">Are you sure you want to delete the completed note:</p>
        <blockquote className="dialog-note-text">{noteText}</blockquote>
        <div className="dialog-buttons">
          <button className="dialog-button confirm" onClick={onConfirm} autoFocus>
            Confirm
          </button>
          <button className="dialog-button cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;
