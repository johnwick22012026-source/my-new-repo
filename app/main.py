from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .database import engine, Base, get_db
from . import models, schemas

app = FastAPI()

# Create all tables (if any models are defined later)
Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/test-db-connection")
async def test_db_connection(db: Session = Depends(get_db)):
    # Simple test to check DB connectivity by executing a raw SQL query
    result = db.execute("SELECT 1").scalar()
    return {"db_connection": "success" if result == 1 else "failure"}

@app.get("/notes", response_model=List[schemas.Note])
async def get_notes(db: Session = Depends(get_db)):
    notes = db.query(models.Note).all()
    return notes

@app.post("/notes", response_model=schemas.Note, status_code=status.HTTP_201_CREATED)
async def create_note(note_create: schemas.NoteCreate, db: Session = Depends(get_db)):
    note = models.Note(
        text=note_create.text,
        completed=note_create.completed
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@app.put("/notes/{note_id}/completion", response_model=schemas.Note)
async def update_note_completion(note_id: int, request: schemas.NoteCompleteRequest, db: Session = Depends(get_db)):
    if note_id != request.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note ID in path and body must match")
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    note.completed = request.completed
    if request.completed:
        note.completion_timestamp = datetime.utcnow()
    else:
        note.completion_timestamp = None

    db.commit()
    db.refresh(note)
    return note

@app.delete("/notes/{note_id}", response_model=schemas.Note)
async def delete_note(note_id: int, confirm: bool = False, db: Session = Depends(get_db)):
    """
    Delete a note by ID only if confirmed and note is completed.
    Query parameter 'confirm' must be True to proceed with deletion.
    """
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deletion not confirmed. Set 'confirm=true' query parameter to confirm deletion."
        )

    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if not note.completed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only completed notes can be deleted")

    db.delete(note)
    db.commit()
    return note

@app.get("/notes/search", response_model=List[schemas.Note])
async def search_notes(query: Optional[str] = Query(None, min_length=1), db: Session = Depends(get_db)):
    """
    Search notes by text case-insensitively.
    If query is None or empty, return all notes.
    """
    if not query:
        notes = db.query(models.Note).all()
        return notes

    # Use SQLite case-insensitive LIKE with ilike for case-insensitive search
    pattern = f"%{query}%"
    notes = db.query(models.Note).filter(models.Note.text.ilike(pattern)).all()
    return notes

