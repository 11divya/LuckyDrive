import useCountdown from '../hooks/useCountdown';

const pad = (n) => String(n).padStart(2, '0');

// Two visual densities:
//   compact (default) = inline strip used inside CarCard (per Stitch Home)
//   block             = larger labelled block used on the Car Detail rail

export default function CountdownTimer({ targetDate, variant = 'compact', label }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate);

  if (expired) {
    return (
      <div className="bg-dark-200 rounded-md px-4 py-3 text-center">
        <span className="font-label-bold text-xs text-text-muted">Draw Complete</span>
      </div>
    );
  }

  if (variant === 'block') {
    const cells = [
      { v: pad(days), l: 'DAYS' },
      { v: pad(hours), l: 'HRS' },
      { v: pad(minutes), l: 'MIN' },
      { v: pad(seconds), l: 'SEC' },
    ];
    return (
      <div>
        {label && (
          <div className="font-label-bold text-xs text-text-muted mb-2">{label}</div>
        )}
        <div className="grid grid-cols-4 gap-2">
          {cells.map((c) => (
            <div
              key={c.l}
              className="bg-dark-200 rounded-md py-3 px-2 text-center border border-outline-variant/30"
            >
              <div className="font-display font-bold text-2xl tabular-nums text-text">{c.v}</div>
              <div className="font-label-bold text-[10px] text-text-muted mt-1">{c.l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // compact
  return (
    <div className="bg-dark-200 rounded-md px-4 py-2.5 flex items-center justify-center gap-2 font-bold text-primary tabular-nums text-lg md:text-xl">
      <span>{pad(days)}</span>
      <span className="text-text-muted">:</span>
      <span>{pad(hours)}</span>
      <span className="text-text-muted">:</span>
      <span>{pad(minutes)}</span>
      <span className="text-text-muted">:</span>
      <span>{pad(seconds)}</span>
    </div>
  );
}
