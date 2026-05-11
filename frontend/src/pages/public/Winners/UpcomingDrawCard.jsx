import { useNavigate } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import StatusPill from '../../../components/StatusPill';
import SalesProgress from '../../../components/SalesProgress';
import Button from '../../../components/Button';
import DrawAdminActions from './DrawAdminActions';
import { formatZAR } from '../../../utils/format';
import { formatDrawDate, daysUntil } from './Winners.helper';

// Upcoming draw card — shown on /winners while the draw hasn't run yet.
// Communicates "winner will be announced on <date>" per the brief.

export default function UpcomingDrawCard({ draw, onChanged }) {
  const navigate = useNavigate();
  const days = daysUntil(draw.drawDate);
  const car = draw.car || {};

  return (
    <article className="ld-card !p-0 overflow-hidden flex flex-col">
      <div className="relative aspect-[16/9] bg-dark-200 overflow-hidden">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-3 left-3">
          <StatusPill status="closing_soon" label="ANNOUNCING SOON" />
        </div>
        <div className="absolute top-3 right-3">
          <DrawAdminActions draw={draw} onChanged={onChanged} />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-display font-bold text-xl text-text">{car.name}</h3>
          <p className="text-sm text-text-muted mt-1">
            Prize value{' '}
            <span className="text-text font-medium">{formatZAR(car.prizeValue)}</span>
          </p>
        </div>

        <div className="px-4 py-3 rounded-lg bg-dark-200 border border-outline-variant/30 flex items-center gap-3">
          <CalendarClock size={20} className="text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-label-bold text-[10px] text-text-muted">WINNER ANNOUNCED ON</div>
            <div className="font-display font-bold text-text">
              {formatDrawDate(draw.drawDate)}
              {typeof days === 'number' && (
                <span className="text-text-muted text-xs font-sans font-normal ml-2">
                  · in {days} day{days === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </div>

        <SalesProgress sold={car.ticketsSold || 0} total={car.totalTickets || 0} />

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-text-muted text-xs">
            All token numbers will be revealed live on draw day.
          </span>
          <Button size="middle" onClick={() => navigate(`/cars/${car.id}`)}>
            Enter Now
          </Button>
        </div>
      </div>
    </article>
  );
}
