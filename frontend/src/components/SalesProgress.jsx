// Tailwind-only progress bar — gold fill on dark-200 track. Used on CarCard,
// Car Detail rail, and Manage Inventory table.

export default function SalesProgress({ sold, total, showLabels = true, className = '' }) {
  const pct = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;
  return (
    <div className={className}>
      {showLabels && (
        <div className="flex justify-between font-label-bold text-[11px] text-text-muted mb-1.5">
          <span>TICKETS SOLD: {sold.toLocaleString('en-ZA')}</span>
          <span>GOAL: {total.toLocaleString('en-ZA')}</span>
        </div>
      )}
      <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </div>
    </div>
  );
}
