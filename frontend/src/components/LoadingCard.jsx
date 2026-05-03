function LoadingCard({ title = "Loading", lines = 4 }) {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="h-4 w-32 animate-pulse rounded-full bg-cyan-300/20" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-white/10" />
      <p className="sr-only">{title}</p>
      <div className="mt-8 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div className="h-4 animate-pulse rounded-full bg-white/10" key={index} style={{ width: `${95 - index * 12}%` }} />
        ))}
      </div>
    </section>
  );
}

export default LoadingCard;
