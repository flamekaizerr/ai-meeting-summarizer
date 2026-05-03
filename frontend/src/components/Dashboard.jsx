import { Link } from "react-router-dom";

import StatusBadge from "./StatusBadge";

function formatDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function Dashboard({ meetings, isLoading, error, onRefresh }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Recent meetings</h2>
        </div>
        <button
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200"
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <div className="mt-6 space-y-3">
        {isLoading && <p className="rounded-2xl bg-slate-950/60 px-4 py-5 text-sm text-slate-300">Loading meetings...</p>}

        {!isLoading && meetings.length === 0 && (
          <p className="rounded-2xl bg-slate-950/60 px-4 py-5 text-sm text-slate-300">
            No meetings yet. Upload your first audio file to start processing.
          </p>
        )}

        {!isLoading &&
          meetings.map((meeting) => (
            <Link
              className="block rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-300/60 hover:bg-slate-900"
              key={meeting.id}
              to={`/meetings/${meeting.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{meeting.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{meeting.original_filename || meeting.audio_filename || "Audio file"}</p>
                </div>
                <StatusBadge status={meeting.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>{formatDate(meeting.created_at)}</span>
                {meeting.audio_size_bytes && <span>{(meeting.audio_size_bytes / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
              {meeting.summary && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">{meeting.summary}</p>}
            </Link>
          ))}
      </div>
    </section>
  );
}

export default Dashboard;
