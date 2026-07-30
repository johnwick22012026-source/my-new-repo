from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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
        is_completed=note_create.is_completed
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@app.post("/notes/complete", response_model=schemas.Note)
async def mark_note_completed(request: schemas.NoteCompleteRequest, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == request.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.is_completed:
        # Already completed, just return
        return note
    note.is_completed = True
    note.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note

@app.delete("/notes/{note_id}", response_model=schemas.Note)
async def delete_completed_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if not note.is_completed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note is not completed and cannot be deleted")
    db.delete(note)
    db.commit()
    return note
