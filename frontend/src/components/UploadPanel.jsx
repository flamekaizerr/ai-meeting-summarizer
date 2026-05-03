import { useMemo, useState } from "react";

import { getApiErrorMessage, uploadMeetingAudio } from "../services/api";

const allowedExtensions = [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"];

function UploadPanel({ onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const selectedFileLabel = useMemo(() => {
    if (!file) {
      return "Drop meeting audio here or browse files";
    }

    const sizeInMb = file.size / 1024 / 1024;
    return `${file.name} • ${sizeInMb.toFixed(2)} MB`;
  }, [file]);

  function handleFileSelection(selectedFile) {
    setError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    const isSupported = allowedExtensions.some((extension) => lowerName.endsWith(extension));
    if (!isSupported) {
      setFile(null);
      setError(`Unsupported file type. Use: ${allowedExtensions.join(", ")}`);
      return;
    }

    setFile(selectedFile);
    if (!title.trim()) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Add a meeting title before uploading.");
      return;
    }

    if (!file) {
      setError("Choose an audio file before uploading.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedMeeting = await uploadMeetingAudio({ title: title.trim(), file });
      setTitle("");
      setFile(null);
      onUploaded(uploadedMeeting);
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Upload audio</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Create a meeting summary</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Upload a meeting recording and the backend will transcribe, summarize, and extract action items in the background.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Meeting title</span>
          <input
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            placeholder="Weekly product sync"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label
          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition ${
            isDragging ? "border-cyan-300 bg-cyan-300/10" : "border-white/15 bg-slate-950/60 hover:border-cyan-300/70"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFileSelection(event.dataTransfer.files?.[0]);
          }}
        >
          <input
            className="sr-only"
            type="file"
            accept="audio/*,.mp4,.webm"
            onChange={(event) => handleFileSelection(event.target.files?.[0])}
          />
          <span className="rounded-2xl bg-cyan-300/10 px-4 py-3 text-2xl">🎙️</span>
          <span className="mt-4 font-semibold text-white">{selectedFileLabel}</span>
          <span className="mt-2 text-sm text-slate-400">Supported: {allowedExtensions.join(", ")}</span>
        </label>

        {error && <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        <button
          className="w-full rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading and starting AI processing..." : "Upload and summarize"}
        </button>
      </form>
    </section>
  );
}

export default UploadPanel;
