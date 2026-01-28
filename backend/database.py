from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import NullPool
from config import Config
from models import Base

engine = create_engine(
    Config.SQLALCHEMY_DATABASE_URI,
    poolclass=NullPool,
    echo=Config.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = scoped_session(SessionLocal)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def close_db(e=None):
    session.remove()
