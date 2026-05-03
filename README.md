# AI Meeting Audio Summarizer

A hosted-friendly portfolio web app that uploads meeting audio, transcribes it with Groq Whisper, summarizes the transcript with OpenRouter, and displays action items in a polished React dashboard.

## Features

- Audio upload with validation for `.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`, and `.mp4`
- Background AI processing with FastAPI `BackgroundTasks`
- Groq Whisper speech-to-text integration
- OpenRouter summarization with `google/gemma-4-31b-it:free`
- Meeting dashboard with processing status
- Meeting detail page with audio playback, transcript, highlighted summary, and checkbox action items
- Supabase Postgres and Supabase Storage ready for hosted deployment
- Local SQLite and local file storage fallback for development

## Tech Stack

- Frontend: Vite, React, React Router, Tailwind CSS, Axios
- Backend: FastAPI, SQLAlchemy, Pydantic, HTTPX
- Database: Supabase Postgres in production, SQLite for local development
- Storage: Supabase Storage in production, local storage for local development
- AI: Groq Whisper and OpenRouter

## Local Backend Setup

```bash
cd backend
python -m venv ..\.venv
..\.venv\Scripts\pip install -r requirements.txt
copy .env.example .env
..\.venv\Scripts\uvicorn main:app --reload
```

For local development, use SQLite/local storage in `backend/.env`:

```env
DATABASE_URL=sqlite:///./meeting_summarizer.db
CORS_ORIGINS=["http://localhost:5173"]
STORAGE_BACKEND=local
STORAGE_DIR=storage
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_SUMMARY_MODEL=google/gemma-4-31b-it:free
```

## Local Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend local environment:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Production Environment Variables

Backend host variables:

```env
DATABASE_URL=postgresql+psycopg://...
CORS_ORIGINS=["https://your-vercel-app.vercel.app","http://localhost:5173"]
MAX_UPLOAD_SIZE_MB=25
ALLOWED_AUDIO_EXTENSIONS=[".mp3",".wav",".m4a",".ogg",".webm",".mp4"]
STORAGE_BACKEND=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=meeting-audio
GROQ_API_KEY=your-groq-api-key
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_SUMMARY_MODEL=google/gemma-4-31b-it:free
```

Frontend host variables:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

## Deployment

Recommended production setup:

- Frontend: Vercel
- Backend: Render
- Database: Supabase Postgres
- Storage: Supabase Storage

This repository includes:

- `backend/Dockerfile` for the FastAPI backend
- `render.yaml` for a Render Blueprint deployment
- `frontend/vercel.json` for React Router SPA fallback routing

## Security Notes

- Never expose `GROQ_API_KEY`, `OPENROUTER_API_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- The React app only uses `VITE_API_BASE_URL`.
- Audio playback is proxied through the backend so Supabase service credentials stay private.
