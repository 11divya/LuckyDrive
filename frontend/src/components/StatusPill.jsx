const STATUS_MAP = {
  active:         { label: 'ACTIVE',         tone: 'gold-soft' },
  active_draw:    { label: 'ACTIVE DRAW',    tone: 'gold-solid' },
  closing_soon:   { label: 'CLOSING SOON',   tone: 'gold-soft' },
  high_demand:    { label: 'HIGH DEMAND',    tone: 'gold-solid' },
  draw_complete:  { label: 'DRAW COMPLETE',  tone: 'muted' },
  delivered:      { label: 'DELIVERED',      tone: 'success' },
  draft:          { label: 'DRAFT',          tone: 'muted' },
};

const TONE_CLS = {
  'gold-solid': 'bg-primary text-dark',
  'gold-soft':  'bg-primary/15 text-primary border border-primary/30',
  muted:        'bg-dark-200 text-text-muted border border-outline-variant/30',
  success:      'bg-success/20 text-success border border-success/40',
};

export default function StatusPill({ status, label, className = '' }) {
  const def = STATUS_MAP[status] || { label: status?.toUpperCase() || '—', tone: 'muted' };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-label-bold text-[11px] ${TONE_CLS[def.tone]} ${className}`}
    >
      {label || def.label}
    </span>
  );
}
