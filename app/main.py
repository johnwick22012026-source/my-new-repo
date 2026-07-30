from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

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
