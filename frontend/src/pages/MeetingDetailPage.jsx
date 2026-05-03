import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ActionItemsPanel from "../components/ActionItemsPanel";
import AudioPlayer from "../components/AudioPlayer";
import LoadingCard from "../components/LoadingCard";
import StatusBadge from "../components/StatusBadge";
import SummaryPanel from "../components/SummaryPanel";
import Toast from "../components/Toast";
import { getApiErrorMessage, getMeeting, updateActionItem } from "../services/api";

const processingStatuses = new Set(["uploaded", "processing"]);

function formatDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function MeetingDetailPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const previousStatusRef = useRef(null);

  const shouldPoll = useMemo(() => meeting && processingStatuses.has(meeting.status), [meeting]);

  async function loadMeeting({ showLoading = false } = {}) {
    if (showLoading) {
      setIsLoading(true);
    }
    setError("");

    try {
      const meetingDetail = await getMeeting(meetingId);
      setMeeting(meetingDetail);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleActionItem(actionItem, isCompleted) {
    setMeeting((currentMeeting) => ({
      ...currentMeeting,
      action_items: currentMeeting.action_items.map((item) =>
        item.id === actionItem.id ? { ...item, is_completed: isCompleted } : item,
      ),
    }));

    try {
      const updatedItem = await updateActionItem(actionItem.id, { is_completed: isCompleted });
      setMeeting((currentMeeting) => ({
        ...currentMeeting,
        action_items: currentMeeting.action_items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      }));
      setToast({ message: isCompleted ? "Action item marked complete." : "Action item reopened.", type: "success" });
    } catch (updateError) {
      setToast({ message: getApiErrorMessage(updateError), type: "error" });
      loadMeeting();
    }
  }

  useEffect(() => {
    loadMeeting({ showLoading: true });
  }, [meetingId]);

  useEffect(() => {
    if (!shouldPoll) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadMeeting();
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [shouldPoll, meetingId]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!meeting?.status) {
      return;
    }

    const previousStatus = previousStatusRef.current;
    if (processingStatuses.has(previousStatus) && meeting.status === "completed") {
      setToast({ message: "AI processing finished. Your summary is ready.", type: "success" });
    }
    previousStatusRef.current = meeting.status;
  }, [meeting?.status]);

  return (
    <div className="mx-auto max-w-6xl">
      <Toast message={toast?.message} onDismiss={() => setToast(null)} type={toast?.type} />

      <Link className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200" to="/">
        ← Back to dashboard
      </Link>

      {isLoading && <LoadingCard title="Loading meeting" lines={6} />}

      {error && (
        <section className="mt-8 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
          <h2 className="text-xl font-bold">Could not load meeting</h2>
          <p className="mt-2 text-sm leading-6">{error}</p>
          <button
            className="mt-5 rounded-2xl border border-rose-300/30 px-4 py-2 text-sm font-semibold transition hover:bg-rose-300/10"
            onClick={() => loadMeeting({ showLoading: true })}
            type="button"
          >
            Try again
          </button>
        </section>
      )}

      {!isLoading && meeting && (
        <div className="mt-8 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Meeting detail</p>
                <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">{meeting.title}</h1>
                <p className="mt-3 text-sm text-slate-400">{meeting.original_filename || meeting.audio_filename || "Audio file"}</p>
              </div>
              <StatusBadge status={meeting.status} />
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <span className="block text-xs uppercase tracking-wide text-slate-500">Created</span>
                <span className="mt-1 block font-semibold">{formatDate(meeting.created_at)}</span>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <span className="block text-xs uppercase tracking-wide text-slate-500">Updated</span>
                <span className="mt-1 block font-semibold">{formatDate(meeting.updated_at)}</span>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <span className="block text-xs uppercase tracking-wide text-slate-500">Transcript</span>
                <span className="mt-1 block font-semibold">{meeting.transcript?.language || "Pending"}</span>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-4">
                <span className="block text-xs uppercase tracking-wide text-slate-500">File size</span>
                <span className="mt-1 block font-semibold">
                  {meeting.audio_size_bytes ? `${(meeting.audio_size_bytes / 1024 / 1024).toFixed(2)} MB` : "Unknown"}
                </span>
              </div>
            </div>

            {processingStatuses.has(meeting.status) && (
              <p className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                AI processing is still running. This page refreshes automatically every few seconds.
              </p>
            )}

            {meeting.status === "completed" && (
              <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                Processing complete. Summary, transcript, and action items are ready.
              </p>
            )}

            {meeting.status === "failed" && (
              <p className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                Processing failed. Check backend logs and confirm Groq/OpenRouter/Supabase environment variables are configured correctly.
              </p>
            )}
          </section>

          <AudioPlayer meeting={meeting} />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <SummaryPanel summary={meeting.summary} />
            <ActionItemsPanel actionItems={meeting.action_items || []} onToggle={handleToggleActionItem} />
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Transcript</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Full text</h2>
              </div>
              {meeting.transcript?.duration_seconds && (
                <p className="text-sm text-slate-400">{Math.round(meeting.transcript.duration_seconds)} seconds</p>
              )}
            </div>
            {meeting.transcript?.text ? (
              <p className="mt-5 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950/60 p-5 leading-7 text-slate-300">
                {meeting.transcript.text}
              </p>
            ) : (
              <p className="mt-5 rounded-2xl bg-slate-950/60 p-5 text-slate-400">Transcript will appear here after processing completes.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default MeetingDetailPage;
