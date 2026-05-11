export default function CarStatsStrip({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="ld-card !p-4 text-center"
        >
          <div className="font-label-bold text-[11px] text-text-muted">{s.label}</div>
          <div className="font-display font-bold text-lg text-text mt-1">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
