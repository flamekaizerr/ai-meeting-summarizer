function Toast({ message, type = "success", onDismiss }) {
  const styles = type === "error" ? "border-rose-400/30 bg-rose-400/15 text-rose-100" : "border-emerald-400/30 bg-emerald-400/15 text-emerald-100";

  if (!message) {
    return null;
  }

  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${styles}`}>
      <span className="mt-0.5">{type === "error" ? "⚠️" : "✅"}</span>
      <p className="text-sm font-medium leading-6">{message}</p>
      <button className="ml-auto text-sm opacity-70 transition hover:opacity-100" onClick={onDismiss} type="button">
        ✕
      </button>
    </div>
  );
}

export default Toast;
