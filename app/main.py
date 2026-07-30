from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .database import engine, Base, get_db

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
