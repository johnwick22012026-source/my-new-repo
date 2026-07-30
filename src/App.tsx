import React, { useEffect, useState } from 'react';
import './App.css';

interface Note {
  id: number;
  text: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

interface NoteCreate {
  text: string;
  is_completed?: boolean;
}

const API_BASE = '';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch notes from API
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/notes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.statusText}`);
      }
      const data: Note[] = await response.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Client-side validation for note text
  const validateNoteText = (text: string): string | null => {
    if (!text || !text.trim()) {
      return 'Note text must not be empty or whitespace only';
    }
    if (text.trim().length > 500) {
      return 'Note text must not exceed 500 characters';
    }
    return null;
  };

  // Handle form submit to create a new note
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = newNoteText.trim();
    const validationMsg = validateNoteText(trimmedText);
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }
    setValidationError(null);
    setError(null);
    try {
      const noteCreate: NoteCreate = { text: trimmedText, is_completed: false };
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteCreate),
      });
      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.statusText}`);
      }
      const createdNote: Note = await response.json();
      // Prepend the new note to the notes list
      setNotes(prev => [createdNote, ...prev]);
      setNewNoteText('');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
  };

  // Filter notes by search text
  const filteredNotes = notes.filter(note =>
    note.text.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="app-container">
      <h1 className="app-title">Notes Management</h1>

      <form className="note-form" onSubmit={handleSubmit} aria-label="Add new note" noValidate>
        <input
          type="text"
          placeholder="Enter a new note"
          value={newNoteText}
          onChange={e => setNewNoteText(e.target.value)}
          className={`note-input ${validationError ? 'input-error' : ''}`}
          aria-label="New note text"
          aria-invalid={validationError ? 'true' : 'false'}
          aria-describedby={validationError ? 'note-error' : undefined}
          maxLength={500}
        />
        <button type="submit" className="note-submit" disabled={!newNoteText.trim()}>
          Add Note
        </button>
      </form>

      {validationError && <p id="note-error" className="validation-error" role="alert">{validationError}</p>}

      <input
        type="text"
        placeholder="Search notes"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="search-input"
        aria-label="Search notes"
      />

      {loading && <p className="loading">Loading notes...</p>}
      {error && <p className="error">Error: {error}</p>}

      <ul className="notes-list">
        {filteredNotes.map(note => (
          <li key={note.id} className="note-item">
            <p className="note-text">{note.text}</p>
            <small className="note-date">Created: {new Date(note.created_at).toLocaleString()}</small>
          </li>
        ))}
        {filteredNotes.length === 0 && !loading && <p className="no-notes">No notes found.</p>}
      </ul>
    </div>
  );
}

export default App;
