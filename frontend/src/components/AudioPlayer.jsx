import { getMeetingAudioUrl } from "../services/api";

function AudioPlayer({ meeting }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Playback</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Original audio</h2>
        </div>
        <p className="text-sm text-slate-400">{meeting.original_filename || meeting.audio_filename || "Meeting audio"}</p>
      </div>

      <audio className="mt-5 w-full rounded-2xl" controls preload="metadata" src={getMeetingAudioUrl(meeting.id)}>
        Your browser does not support audio playback.
      </audio>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Audio streams from the backend so Supabase service credentials remain private.
      </p>
    </section>
  );
}

export default AudioPlayer;
