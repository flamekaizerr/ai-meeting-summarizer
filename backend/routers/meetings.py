from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

import repository
from database import get_db
from schemas import ActionItemRead, ActionItemUpdate, MeetingDetail, MeetingRead
from storage import read_stored_audio


router = APIRouter()


@router.get("/meetings", response_model=list[MeetingRead])
def list_saved_meetings(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return repository.list_meetings(db, limit=limit, offset=offset)


@router.get("/meetings/{meeting_id}", response_model=MeetingDetail)
def get_saved_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = repository.get_meeting(db, meeting_id)
    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found",
        )
    return meeting


@router.get("/meetings/{meeting_id}/audio")
async def get_meeting_audio(meeting_id: int, db: Session = Depends(get_db)):
    meeting = repository.get_meeting(db, meeting_id)
    if meeting is None or not meeting.audio_storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting audio not found",
        )

    audio_bytes = await read_stored_audio(meeting.audio_storage_path)
    return Response(
        content=audio_bytes,
        media_type=meeting.audio_content_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{meeting.original_filename or meeting.audio_filename or "meeting-audio"}"'},
    )


@router.patch("/action-items/{action_item_id}", response_model=ActionItemRead)
def update_saved_action_item(action_item_id: int, payload: ActionItemUpdate, db: Session = Depends(get_db)):
    action_item = repository.update_action_item_completion(db, action_item_id, payload.is_completed)
    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action item not found",
        )
    return action_item
