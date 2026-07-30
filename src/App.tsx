import React, { useEffect, useState } from 'react';
import './App.css';
import NotesList, { Note } from './components/NotesList';
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog';

interface NoteCreate {
  text: string;
  completed?: boolean;
}

const API_BASE = '';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

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
      const noteCreate: NoteCreate = { text: trimmedText, completed: false };
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

  // Handle toggle completion
  const handleToggleComplete = async (id: number, completed: boolean) => {
    setError(null);
    // Optimistic UI update
    setNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, completed } : note))
    );
    try {
      const response = await fetch(`${API_BASE}/notes/${id}/completion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update note completion: ${response.statusText}`);
      }
      const updatedNote: Note = await response.json();
      // Update note with backend response
      setNotes(prev =>
        prev.map(note => (note.id === id ? updatedNote : note))
      );
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      // Revert optimistic update on error
      setNotes(prev =>
        prev.map(note => (note.id === id ? { ...note, completed: !completed } : note))
      );
    }
  };

  // Handle delete note request (opens confirmation dialog if note is completed)
  const handleDeleteRequest = (note: Note) => {
    if (!note.completed) {
      // Should not happen because delete button disabled, but just in case
      setError('Only completed notes can be deleted.');
      return;
    }
    setNoteToDelete(note);
    setConfirmDialogOpen(true);
  };

  // Confirm delete after dialog confirmation
  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/notes/${noteToDelete.id}?confirm=true`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.statusText}`);
      }
      // Remove note from list
      setNotes(prev => prev.filter(note => note.id !== noteToDelete.id));
      setConfirmDialogOpen(false);
      setNoteToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setConfirmDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setNoteToDelete(null);
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

      <NotesList notes={filteredNotes} onToggleComplete={handleToggleComplete} onDelete={handleDeleteRequest} />

      <ConfirmDeleteDialog
        isOpen={confirmDialogOpen}
        noteText={noteToDelete?.text || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default App;
