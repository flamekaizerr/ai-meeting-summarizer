from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

# SQLAlchemy 2.0 with psycopg3 requires postgresql+psycopg schema
db_url = settings.database_url
if db_url.startswith("postgres://") or db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://").replace("postgresql://", "postgresql+psycopg://")

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.database_url.startswith("sqlite"):
        sync_sqlite_schema()


def sync_sqlite_schema() -> None:
    inspector = inspect(engine)
    if "meetings" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("meetings")}
    missing_columns = {
        "original_filename": "VARCHAR(255)",
        "audio_storage_path": "VARCHAR(512)",
        "audio_url": "TEXT",
        "audio_content_type": "VARCHAR(128)",
        "audio_size_bytes": "INTEGER",
    }

    with engine.begin() as connection:
        for column_name, column_type in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE meetings ADD COLUMN {column_name} {column_type}"))


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
