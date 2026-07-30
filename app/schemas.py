from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    text: str
    is_completed: Optional[bool] = False

    @validator('text')
    def text_must_be_non_empty_and_within_limit(cls, v):
        if not v or not v.strip():
            raise ValueError('Note text must not be empty or whitespace only')
        if len(v) > 500:
            raise ValueError('Note text must not exceed 500 characters')
        return v

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
