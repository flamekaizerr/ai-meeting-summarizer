# Deployment Checklist

Recommended production setup:

- GitHub repository: `https://github.com/flamekaizerr/ai-meeting-summarizer`
- Backend: Render web service from `render.yaml`
- Frontend: Vercel project with `frontend` as the root directory
- Database: Supabase Postgres
- Storage: Supabase Storage bucket named `meeting-audio`

## 1. Supabase

Create or confirm:

- Postgres database connection string
- Storage bucket named `meeting-audio`
- Project URL
- Service role key

The backend needs these values:

```env
DATABASE_URL=postgresql+psycopg://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=meeting-audio
STORAGE_BACKEND=supabase
```

Do not put the service role key in Vercel/frontend variables.

## 2. Render Backend

Use the GitHub repository and the root `render.yaml` Blueprint.

Set these Render environment variables:

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

After Render deploys, test:

```text
https://your-render-service.onrender.com/
```

Expected response:

```json
{"message":"AI Meeting Summarizer API"}
```

## 3. Vercel Frontend

Create a Vercel project from the same GitHub repository.

Settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Set this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

## 4. Final Live Smoke Test

On the deployed Vercel URL:

1. Upload a short `.mp3` or `.wav` meeting sample.
2. Confirm status moves to `completed`.
3. Confirm transcript appears.
4. Confirm summary appears.
5. Confirm audio playback works.
6. Toggle an action item if one exists.

## Current Local Smoke Test Status

A real local smoke test with Groq and OpenRouter passed:

```text
REAL_SMOKE_TEST_PASSED
```
