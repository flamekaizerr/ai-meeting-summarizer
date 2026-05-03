import asyncio

import repository
from ai_service import summarize_transcript, transcribe_audio
from database import SessionLocal
from storage import read_stored_audio


async def process_meeting_audio(meeting_id: int) -> None:
    db = SessionLocal()
    try:
        meeting = repository.get_meeting(db, meeting_id)
        if meeting is None:
            return

        repository.update_meeting_status(db, meeting_id, "processing")
        audio_bytes = await read_stored_audio(meeting.audio_storage_path)
        transcription = await transcribe_audio(
            audio_bytes=audio_bytes,
            filename=meeting.original_filename or meeting.audio_filename or "meeting-audio",
            content_type=meeting.audio_content_type,
        )
        repository.create_transcript(
            db,
            meeting_id=meeting_id,
            text=transcription.text,
            language=transcription.language,
            duration_seconds=transcription.duration_seconds,
        )
        summary = await summarize_transcript(transcription.text)
        repository.update_meeting_summary(db, meeting_id, summary.summary)
        repository.replace_action_items(db, meeting_id=meeting_id, action_items=summary.action_items)
        repository.update_meeting_status(db, meeting_id, "completed")
    except Exception:
        db.rollback()
        repository.update_meeting_status(db, meeting_id, "failed")
    finally:
        db.close()


def run_meeting_processing(meeting_id: int) -> None:
    asyncio.run(process_meeting_audio(meeting_id))
