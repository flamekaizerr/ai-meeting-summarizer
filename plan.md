Plan: AI Meeting Audio Summarizer & Task Extractor
This project adds a new modality (Audio/Speech-to-Text) to your portfolio, showcasing versatility beyond pure text/NLP features.

Hosted portfolio validity

This project is intended to be hosted on the internet as a portfolio demo:
- Deploy the Vite React frontend on Vercel, Netlify, or Cloudflare Pages.
- Deploy the FastAPI backend on Render, Railway, Fly.io, or another container-friendly host.
- Use Supabase Postgres for the hosted database.
- Use Supabase Storage for uploaded meeting audio.
- Use Groq Whisper for hosted speech-to-text.
- Use OpenRouter free models for hosted summarization and action-item extraction.
- Keep all API keys and Supabase service credentials backend-only through environment variables.

Steps

Phase 1: Project Scaffolding & Architecture

1. Initialize backend folder ai-meeting-summarizer/backend with FastAPI, SQLAlchemy, hosted configuration files (requirements.txt, .env.example), and deployment-ready environment settings.
2. Initialize frontend folder ai-meeting-summarizer/frontend with Vite + React.
3. Define the database schema (Tables: Meetings, Transcripts, ActionItems) with hosted storage metadata.

Phase 2: Core Backend & Data Layer

4. Setup the database lifecycle and repository/service functions.
5. Create secure file upload endpoints for supported audio files.
6. Implement structured audio storage using Supabase Storage for hosted deployments, with local storage available only as a development fallback.

Phase 3: The AI Audio Processing Pipeline

7. Integrate Speech-to-Text using Groq Whisper.
8. Integrate transcript processing with OpenRouter model google/gemma-4-31b-it:free to generate a concise Summary and a structured JSON list of Action Items.
9. Wire these AI services into an asynchronous backend background task so the API does not timeout on large files.

Phase 4: Frontend Core Features

10. Build the UploadPanel component with drag-and-drop support and a loading/processing state indicator.
11. Build the Dashboard component to list previously processed meetings.
12. Create a generic API Service in React to communicate with the FastAPI backend.

Phase 5: Advanced Frontend & Polish

13. Build the MeetingDetail view featuring:
- Audio player synced with the transcript.
- Highlighted Summary section.
- Checkbox-style Action Items list.
14. Handle error states, toast notifications for completed processing, and mobile responsiveness.

Phase 6: Deployment & Documentation

15. Containerize the backend and frontend with Dockerfile.
16. Update the main PORTFOLIO_AGENT_INSTRUCTIONS.md to document the new project.
17. Write README.md and deploy the portfolio-friendly version.

Relevant files

ai-meeting-summarizer/backend/main.py — Central FastAPI app and routing entry point.
ai-meeting-summarizer/backend/config.py — Environment-driven configuration.
ai-meeting-summarizer/backend/database.py — SQLAlchemy database setup.
ai-meeting-summarizer/backend/models.py — SQLAlchemy schema for Meetings, Transcripts, and ActionItems.
ai-meeting-summarizer/backend/repository.py — Database access functions for meetings, transcripts, and action items.
ai-meeting-summarizer/backend/storage.py — Audio storage abstraction for Supabase Storage and development fallback storage.
ai-meeting-summarizer/backend/routers/uploads.py — Secure audio upload endpoint.
ai-meeting-summarizer/backend/routers/meetings.py — Meeting list/detail endpoints.
ai-meeting-summarizer/backend/ai_service.py — Groq transcription and OpenRouter summarization service wrapper.
ai-meeting-summarizer/frontend/src/services/api.js — Frontend API client for backend requests.
ai-meeting-summarizer/frontend/src/components/UploadPanel.jsx — Audio ingestion component.
ai-meeting-summarizer/frontend/src/components/Dashboard.jsx — Meeting dashboard component.
ai-meeting-summarizer/frontend/src/components/AudioPlayer.jsx — Audio playback component backed by the backend audio endpoint.
ai-meeting-summarizer/frontend/src/components/ActionItemsPanel.jsx — Checkbox-style action-item component.
ai-meeting-summarizer/frontend/src/components/SummaryPanel.jsx — Highlighted AI summary component.
ai-meeting-summarizer/frontend/src/pages/MeetingDetailPage.jsx — Meeting detail view.

Verification

Phase 1:
- Confirm backend files exist and Python files compile.
- Confirm frontend Vite React scaffold files exist.
- Confirm schema includes Meetings, Transcripts, and ActionItems.

Phase 2:
- Confirm backend upload and meeting endpoints import successfully.
- Confirm secure upload validation rejects unsupported files.
- Confirm a valid test audio upload creates a Meeting row and stores structured audio metadata.
- Confirm meeting list/detail endpoints return saved meetings.

Phase 3:
- Confirm uploaded meetings trigger background processing without blocking the upload response.
- Confirm Groq transcription service integration accepts stored audio bytes and saves a Transcript row.
- Confirm OpenRouter model google/gemma-4-31b-it:free returns a summary and structured ActionItems.
- Confirm processing status moves from uploaded to processing to completed, or failed on errors.

Phase 4:
- Confirm the Vite React frontend builds successfully for production.
- Confirm the upload panel sends multipart audio uploads to the backend /api/uploads endpoint.
- Confirm the dashboard lists meetings from the backend /api/meetings endpoint.
- Confirm the meeting detail page reads /api/meetings/{meeting_id} and renders status, summary, transcript, and action items.

Phase 5:
- Confirm audio playback streams through the backend /api/meetings/{meeting_id}/audio endpoint.
- Confirm checkbox-style action items persist completion state through /api/action-items/{action_item_id}.
- Confirm polished summary, transcript, toast, loading, empty, error, and mobile-responsive UI states build successfully.

Later phases:
- Send a 1-minute test audio file to the /upload backend endpoint and verify transcript row is created.
- Verify transcript processing extracts at least one Action Item and a valid Summary.
- Check frontend accurately renders the structured JSON data without console errors.

Decisions

Architecture: Separated frontend/backend rather than full-stack Next.js keeps consistency with your previous projects and makes it easier for independent agents to manage separate folders.
Asynchronous Processing: Audio transcription takes time. Utilizing FastAPI's BackgroundTasks ensures the frontend receives an immediate Processing response rather than a timeout.
Hosted-first Implementation: Supabase Postgres, Supabase Storage, Groq Whisper, and OpenRouter free models keep the app suitable for an internet-hosted portfolio demo while staying free-tier friendly.
