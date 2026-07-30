import React from 'react';
import './NotesList.css';

export interface Note {
  id: number;
  text: string;
  completed: boolean;
  created_at: string;
  completion_timestamp: string | null;
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
        <li key={note.id} className={`note-item ${note.completed ? 'completed' : ''}`}>
          <div className="note-main">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={note.completed}
                onChange={() => onToggleComplete(note.id, !note.completed)}
                aria-label={`Mark note ${note.text} as ${note.completed ? 'incomplete' : 'completed'}`}
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
              title="Delete note"
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
