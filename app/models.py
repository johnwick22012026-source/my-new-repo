from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Index
from .database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    completion_timestamp = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    # Index for case-insensitive search on text using SQLite's NOCASE collation
    __table_args__ = (
        Index('ix_notes_text_nocase', text.collate('NOCASE')),
    )

    # No child relationships currently, so no cascade needed
    # If future relationships added, consider cascade='all, delete' to avoid orphans
