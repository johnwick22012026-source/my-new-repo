import React, { useState, useEffect } from 'react';
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
  newNoteId?: number | null;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onToggleComplete, onDelete, newNoteId = null }) => {
  // State to track which notes are animating completion
  const [animatingCompletedIds, setAnimatingCompletedIds] = useState<Set<number>>(new Set());
  // State to track which notes are animating deletion
  const [animatingDeleteIds, setAnimatingDeleteIds] = useState<Set<number>>(new Set());

  // When a note's completed status changes from false to true, trigger animation
  useEffect(() => {
    // Find notes that are completed and not already animating
    const newlyCompleted = notes.filter(note => note.completed && !animatingCompletedIds.has(note.id));
    if (newlyCompleted.length > 0) {
      setAnimatingCompletedIds(prev => {
        const newSet = new Set(prev);
        newlyCompleted.forEach(note => newSet.add(note.id));
        return newSet;
      });
      // Remove animation class after animation duration (e.g., 600ms)
      const timeout = setTimeout(() => {
        setAnimatingCompletedIds(prev => {
          const newSet = new Set(prev);
          newlyCompleted.forEach(note => newSet.delete(note.id));
          return newSet;
        });
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [notes, animatingCompletedIds]);

  // Handle delete click with animation
  const handleDeleteClick = (id: number) => {
    // Add id to animatingDeleteIds to trigger animation
    setAnimatingDeleteIds(prev => new Set(prev).add(id));
    // After animation duration, call onDelete to remove note from parent state
    setTimeout(() => {
      onDelete(id);
      setAnimatingDeleteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 400); // match animation duration in CSS
  };

  return (
    <>
      {notes.length === 0 ? (
        <p className="no-notes">No notes available. Create your first note.</p>
      ) : (
        <ul className="notes-list">
          {notes.map(note => {
            const isNewNote = note.id === newNoteId;
            const isAnimatingComplete = animatingCompletedIds.has(note.id);
            const isAnimatingDelete = animatingDeleteIds.has(note.id);
            return (
              <li
                key={note.id}
                className={`note-item ${note.completed ? 'completed' : ''} ${isNewNote ? 'new-note' : ''} ${isAnimatingComplete ? 'complete-animate' : ''} ${isAnimatingDelete ? 'delete-animate' : ''}`}
              >
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
                    onClick={() => handleDeleteClick(note.id)}
                    aria-label={`Delete note ${note.text}`}
                    title={note.completed ? "Delete note" : "Cannot delete incomplete note"}
                    disabled={!note.completed || isAnimatingDelete}
                  >
                    &times;
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default NotesList;
