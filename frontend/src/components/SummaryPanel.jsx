function SummaryPanel({ summary }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/15 via-white/[0.07] to-indigo-400/10 p-6 shadow-2xl shadow-cyan-950/20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">AI summary</p>
        <h2 className="mt-3 text-2xl font-bold text-white">Key takeaways</h2>
        {summary ? (
          <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-slate-100">{summary}</p>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-950/50 p-5 text-slate-400">Summary will appear here after processing completes.</p>
        )}
      </div>
    </div>
  );
}

export default SummaryPanel;
