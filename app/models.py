from sqlalchemy import Column, Integer, String, Boolean, DateTime
from .database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)