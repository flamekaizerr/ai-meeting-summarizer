from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from models import ActionItem, Meeting, Transcript


def create_meeting(
    db: Session,
    *,
    title: str,
    audio_filename: str,
    original_filename: str,
    audio_storage_path: str,
    audio_url: str | None,
    audio_content_type: str | None,
    audio_size_bytes: int,
    status: str = "uploaded",
) -> Meeting:
    meeting = Meeting(
        title=title,
        audio_filename=audio_filename,
        original_filename=original_filename,
        audio_storage_path=audio_storage_path,
        audio_url=audio_url,
        audio_content_type=audio_content_type,
        audio_size_bytes=audio_size_bytes,
        status=status,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def list_meetings(db: Session, *, limit: int = 50, offset: int = 0) -> list[Meeting]:
    statement = select(Meeting).order_by(Meeting.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(statement).all())


def get_meeting(db: Session, meeting_id: int) -> Meeting | None:
    statement = (
        select(Meeting)
        .where(Meeting.id == meeting_id)
        .options(selectinload(Meeting.transcript), selectinload(Meeting.action_items))
    )
    return db.scalars(statement).first()


def update_meeting_status(db: Session, meeting_id: int, status: str) -> Meeting | None:
    meeting = get_meeting(db, meeting_id)
    if meeting is None:
        return None

    meeting.status = status
    db.commit()
    db.refresh(meeting)
    return meeting


def update_meeting_summary(db: Session, meeting_id: int, summary: str) -> Meeting | None:
    meeting = get_meeting(db, meeting_id)
    if meeting is None:
        return None

    meeting.summary = summary
    db.commit()
    db.refresh(meeting)
    return meeting


def create_transcript(
    db: Session,
    *,
    meeting_id: int,
    text: str,
    language: str | None = None,
    duration_seconds: float | None = None,
) -> Transcript:
    transcript = Transcript(
        meeting_id=meeting_id,
        text=text,
        language=language,
        duration_seconds=duration_seconds,
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


def create_action_item(
    db: Session,
    *,
    meeting_id: int,
    description: str,
    assignee: str | None = None,
    due_date: str | None = None,
) -> ActionItem:
    action_item = ActionItem(
        meeting_id=meeting_id,
        description=description,
        assignee=assignee,
        due_date=due_date,
    )
    db.add(action_item)
    db.commit()
    db.refresh(action_item)
    return action_item


def get_action_item(db: Session, action_item_id: int) -> ActionItem | None:
    statement = select(ActionItem).where(ActionItem.id == action_item_id)
    return db.scalars(statement).first()


def update_action_item_completion(db: Session, action_item_id: int, is_completed: bool) -> ActionItem | None:
    action_item = get_action_item(db, action_item_id)
    if action_item is None:
        return None

    action_item.is_completed = is_completed
    db.commit()
    db.refresh(action_item)
    return action_item


def replace_action_items(db: Session, *, meeting_id: int, action_items: list[dict]) -> list[ActionItem]:
    db.execute(delete(ActionItem).where(ActionItem.meeting_id == meeting_id))
    created_items = [
        ActionItem(
            meeting_id=meeting_id,
            description=item["description"],
            assignee=item.get("assignee"),
            due_date=item.get("due_date"),
        )
        for item in action_items
        if item.get("description")
    ]
    db.add_all(created_items)
    db.commit()
    for action_item in created_items:
        db.refresh(action_item)
    return created_items
