function ActionItemsPanel({ actionItems, onToggle }) {
  const completedCount = actionItems.filter((item) => item.is_completed).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Follow-up</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Action items</h2>
        </div>
        {actionItems.length > 0 && (
          <span className="text-sm text-slate-400">
            {completedCount}/{actionItems.length} completed
          </span>
        )}
      </div>

      {actionItems.length ? (
        <div className="mt-5 space-y-3">
          {actionItems.map((item) => (
            <label
              className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition ${
                item.is_completed
                  ? "border-emerald-400/20 bg-emerald-400/10"
                  : "border-white/10 bg-slate-950/60 hover:border-cyan-300/40"
              }`}
              key={item.id}
            >
              <input
                checked={item.is_completed}
                className="mt-1 h-5 w-5 rounded border-white/20 bg-slate-950 text-cyan-300 focus:ring-cyan-300"
                onChange={(event) => onToggle(item, event.target.checked)}
                type="checkbox"
              />
              <span className="min-w-0 flex-1">
                <span className={`block font-semibold leading-6 ${item.is_completed ? "text-slate-400 line-through" : "text-white"}`}>
                  {item.description}
                </span>
                <span className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full bg-white/5 px-3 py-1">Assignee: {item.assignee || "Unassigned"}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1">Due: {item.due_date || "No due date"}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-slate-950/60 p-5 text-slate-400">Action items will appear here after processing completes.</p>
      )}
    </div>
  );
}

export default ActionItemsPanel;
