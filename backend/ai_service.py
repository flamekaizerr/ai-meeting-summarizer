import json
import re
import asyncio
from dataclasses import dataclass
from typing import Any

import httpx

from config import settings


@dataclass
class TranscriptionResult:
    text: str
    language: str | None = None
    duration_seconds: float | None = None


@dataclass
class SummaryResult:
    summary: str
    action_items: list[dict[str, str | None]]


async def transcribe_audio(*, audio_bytes: bytes, filename: str, content_type: str | None) -> TranscriptionResult:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
    files = {
        "file": (filename, audio_bytes, content_type or "application/octet-stream"),
    }
    data = {
        "model": settings.groq_transcription_model,
        "response_format": "verbose_json",
    }

    async with httpx.AsyncClient(timeout=180) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers=headers,
            data=data,
            files=files,
        )

    response.raise_for_status()
    payload = response.json()
    return TranscriptionResult(
        text=payload.get("text", "").strip(),
        language=payload.get("language"),
        duration_seconds=payload.get("duration"),
    )


async def summarize_transcript(transcript_text: str) -> SummaryResult:
    if not settings.openrouter_api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-meeting-summarizer.local",
        "X-Title": "AI Meeting Summarizer",
    }
    payload = {
        "model": settings.openrouter_summary_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You extract useful meeting notes. Return only valid JSON with keys "
                    "summary and action_items. action_items must be an array of objects with "
                    "description, assignee, and due_date fields. Use null when assignee or due_date is unknown."
                ),
            },
            {
                "role": "user",
                "content": f"Transcript:\n{transcript_text}",
            },
        ],
        "temperature": 0.2,
    }

    response = None
    async with httpx.AsyncClient(timeout=120) as client:
        for attempt in range(6):
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if response.status_code != 429 or attempt == 5:
                break
            await asyncio.sleep(15 * (attempt + 1))

    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    parsed = parse_summary_response(content)
    return SummaryResult(
        summary=parsed.get("summary", "").strip(),
        action_items=normalize_action_items(parsed.get("action_items", [])),
    )


def parse_summary_response(content: str) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if match:
            return json.loads(match.group(1))

        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group(0))

    raise ValueError("OpenRouter response did not contain valid JSON")


def normalize_action_items(action_items: Any) -> list[dict[str, str | None]]:
    if not isinstance(action_items, list):
        return []

    normalized_items = []
    for item in action_items:
        if isinstance(item, str):
            normalized_items.append({"description": item, "assignee": None, "due_date": None})
            continue

        if not isinstance(item, dict):
            continue

        description = item.get("description") or item.get("task") or item.get("action")
        if not description:
            continue

        normalized_items.append(
            {
                "description": str(description),
                "assignee": normalize_optional_string(item.get("assignee")),
                "due_date": normalize_optional_string(item.get("due_date") or item.get("deadline")),
            }
        )

    return normalized_items


def normalize_optional_string(value: Any) -> str | None:
    if value is None:
        return None

    value_as_string = str(value).strip()
    if not value_as_string or value_as_string.lower() in {"none", "null", "unknown", "n/a"}:
        return None

    return value_as_string
