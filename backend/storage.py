from pathlib import Path
from uuid import uuid4

import aiofiles
import httpx
from fastapi import HTTPException, UploadFile, status

from config import settings


class StoredFile:
    def __init__(self, *, filename: str, storage_path: str, public_url: str | None, size_bytes: int) -> None:
        self.filename = filename
        self.storage_path = storage_path
        self.public_url = public_url
        self.size_bytes = size_bytes


def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def validate_audio_file(file: UploadFile) -> str:
    filename = file.filename or ""
    extension = get_file_extension(filename)
    if extension not in settings.allowed_audio_extensions:
        allowed = ", ".join(settings.allowed_audio_extensions)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio file type. Allowed extensions: {allowed}",
        )
    return extension


def build_object_name(extension: str) -> str:
    return f"meetings/{uuid4().hex}{extension}"


async def read_upload_bytes(file: UploadFile) -> bytes:
    max_size = settings.max_upload_size_mb * 1024 * 1024
    data = await file.read(max_size + 1)
    if len(data) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file must be {settings.max_upload_size_mb}MB or smaller",
        )
    await file.seek(0)
    return data


async def save_upload(file: UploadFile) -> StoredFile:
    extension = validate_audio_file(file)
    data = await read_upload_bytes(file)
    object_name = build_object_name(extension)

    if settings.storage_backend == "supabase":
        return await save_to_supabase(file=file, data=data, object_name=object_name)

    return await save_to_local(file=file, data=data, object_name=object_name)


async def save_to_local(*, file: UploadFile, data: bytes, object_name: str) -> StoredFile:
    storage_root = Path(settings.storage_dir)
    target_path = storage_root / object_name
    target_path.parent.mkdir(parents=True, exist_ok=True)

    async with aiofiles.open(target_path, "wb") as output_file:
        await output_file.write(data)

    return StoredFile(
        filename=Path(object_name).name,
        storage_path=object_name,
        public_url=None,
        size_bytes=len(data),
    )


async def save_to_supabase(*, file: UploadFile, data: bytes, object_name: str) -> StoredFile:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage is not configured",
        )

    upload_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{object_name}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
        "Content-Type": file.content_type or "application/octet-stream",
        "x-upsert": "false",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(upload_url, content=data, headers=headers)

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload audio to Supabase Storage",
        )

    public_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
        f"{settings.supabase_storage_bucket}/{object_name}"
    )
    return StoredFile(
        filename=Path(object_name).name,
        storage_path=object_name,
        public_url=public_url,
        size_bytes=len(data),
    )


async def read_stored_audio(storage_path: str) -> bytes:
    if settings.storage_backend == "supabase":
        return await read_from_supabase(storage_path)

    target_path = Path(settings.storage_dir) / storage_path
    async with aiofiles.open(target_path, "rb") as input_file:
        return await input_file.read()


async def read_from_supabase(storage_path: str) -> bytes:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("Supabase storage is not configured")

    download_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{storage_path}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.get(download_url, headers=headers)

    response.raise_for_status()
    return response.content
