from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./meeting_summarizer.db"
    cors_origins: list[str] = ["http://localhost:5173"]
    max_upload_size_mb: int = 25
    allowed_audio_extensions: list[str] = [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"]
    storage_backend: str = "local"
    storage_dir: str = "storage"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_storage_bucket: str = "meeting-audio"
    groq_api_key: str | None = None
    groq_transcription_model: str = "whisper-large-v3-turbo"
    openrouter_api_key: str | None = None
    openrouter_summary_model: str = "google/gemma-4-31b-it:free"


settings = Settings()
