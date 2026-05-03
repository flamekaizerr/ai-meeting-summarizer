from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

import repository
from database import get_db
from processing import run_meeting_processing
from schemas import MeetingRead
from storage import save_upload


router = APIRouter()


@router.post("/uploads", response_model=MeetingRead, status_code=201)
async def upload_audio(
    background_tasks: BackgroundTasks,
    title: str = Form(..., min_length=1, max_length=255),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    stored_file = await save_upload(file)
    meeting = repository.create_meeting(
        db,
        title=title,
        audio_filename=stored_file.filename,
        original_filename=file.filename or stored_file.filename,
        audio_storage_path=stored_file.storage_path,
        audio_url=stored_file.public_url,
        audio_content_type=file.content_type,
        audio_size_bytes=stored_file.size_bytes,
    )
    background_tasks.add_task(run_meeting_processing, meeting.id)
    return meeting
