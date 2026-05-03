from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TranscriptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    text: str
    language: str | None
    duration_seconds: float | None
    created_at: datetime


class ActionItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    description: str
    assignee: str | None
    due_date: str | None
    is_completed: bool
    created_at: datetime


class ActionItemUpdate(BaseModel):
    is_completed: bool


class MeetingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    audio_filename: str | None
    original_filename: str | None
    audio_storage_path: str | None
    audio_url: str | None
    audio_content_type: str | None
    audio_size_bytes: int | None
    status: str
    summary: str | None
    created_at: datetime
    updated_at: datetime


class MeetingDetail(MeetingRead):
    transcript: TranscriptRead | None = None
    action_items: list[ActionItemRead] = []
