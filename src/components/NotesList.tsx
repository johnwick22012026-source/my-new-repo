import React from 'react';
import './NotesList.css';

export interface Note {
  id: number;
  text: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

interface NotesListProps {
  notes: Note[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onToggleComplete, onDelete }) => {
  return (
    <ul className="notes-list">
      {notes.length === 0 && <p className="no-notes">No notes found.</p>}
      {notes.map(note => (
        <li key={note.id} className={`note-item ${note.is_completed ? 'completed' : ''}`}>
          <div className="note-main">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={note.is_completed}
                onChange={() => onToggleComplete(note.id, !note.is_completed)}
                aria-label={`Mark note ${note.text} as ${note.is_completed ? 'incomplete' : 'completed'}`}
              />
              <span className="checkmark" />
            </label>
            <p className="note-text">{note.text}</p>
          </div>
          <div className="note-meta">
            <small className="note-date">Created: {new Date(note.created_at).toLocaleString()}</small>
            <button
              className="delete-button"
              onClick={() => onDelete(note.id)}
              aria-label={`Delete note ${note.text}`}
              disabled={!note.is_completed}
              title={note.is_completed ? 'Delete note' : 'Complete note before deleting'}
            >
              &times;
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NotesList;
