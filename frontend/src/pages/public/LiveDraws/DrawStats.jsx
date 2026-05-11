import { Trophy, Flame, Ticket } from 'lucide-react';
import { formatZAR } from '../../../utils/format';

const tile = 'flex items-center gap-4 p-5 rounded-xl bg-dark-100 border border-outline-variant/30';

export default function DrawStats({ stats }) {
  if (!stats) return null;
  const items = [
    {
      label: 'ACTIVE DRAWS',
      value: stats.activeDraws.toLocaleString('en-ZA'),
      Icon: Flame,
    },
    {
      label: 'TOTAL PRIZE AT STAKE',
      value: formatZAR(stats.totalPrize, { compact: true }),
      Icon: Trophy,
    },
    {
      label: 'AVG TICKET PRICE',
      value: formatZAR(stats.avgTicketPrice),
      Icon: Ticket,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ label, value, Icon }) => (
        <div key={label} className={tile}>
          <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-label-bold text-[11px] text-text-muted">{label}</div>
            <div className="font-display font-bold text-2xl text-text mt-0.5 tabular-nums">
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
