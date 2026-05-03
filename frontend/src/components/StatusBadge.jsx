const statusStyles = {
  uploaded: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  processing: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || "border-slate-400/30 bg-slate-400/10 text-slate-200";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
