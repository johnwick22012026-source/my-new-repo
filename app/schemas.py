from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    text: str
    completed: Optional[bool] = False

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
    completion_timestamp: Optional[datetime] = None

    class Config:
        orm_mode = True

class NoteCompleteRequest(BaseModel):
    id: int
    completed: bool

    @validator('id')
    def id_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Note id must be a positive integer')
        return v
