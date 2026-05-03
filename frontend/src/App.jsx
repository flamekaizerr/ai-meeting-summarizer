import { Link, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import MeetingDetailPage from "./pages/MeetingDetailPage";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8 lg:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_32%)]" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Portfolio Project</p>
            <Link to="/">
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">AI Meeting Audio Summarizer</h1>
            </Link>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Upload meeting audio, generate a transcript, summarize the discussion, and extract action items in a clean dashboard.
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[27rem]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <span className="block font-semibold text-cyan-200">Groq</span>
              <span className="mt-1 block text-slate-400">Whisper STT</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <span className="block font-semibold text-cyan-200">OpenRouter</span>
              <span className="mt-1 block text-slate-400">Gemma summary</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <span className="block font-semibold text-cyan-200">Supabase</span>
              <span className="mt-1 block text-slate-400">DB + storage</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<MeetingDetailPage />} path="/meetings/:meetingId" />
        </Routes>
      </div>
    </main>
  );
}

export default App;
