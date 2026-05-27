// ZAR currency + draw-date formatting helpers used across the app.

export function formatZAR(amount, { compact = false } = {}) {
  if (amount == null) return 'R 0';
  const n = Number(amount);
  if (Number.isNaN(n)) return 'R 0';
  if (compact && n >= 1_000_000) return `R ${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `R ${(n / 1_000).toFixed(0)}k`;
  return `R ${n.toLocaleString('en-ZA')}`;
}

export function formatDrawDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatAnnouncementDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(num, denom) {
  if (!denom) return '0%';
  return `${Math.round((num / denom) * 100)}%`;
}
