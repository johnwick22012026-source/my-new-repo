from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    text: str
    is_completed: Optional[bool] = False

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class NoteCompleteRequest(BaseModel):
    id: int
