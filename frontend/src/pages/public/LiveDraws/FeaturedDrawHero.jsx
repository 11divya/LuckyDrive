import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import StatusPill from '../../../components/StatusPill';
import SalesProgress from '../../../components/SalesProgress';
import CountdownTimer from '../../../components/CountdownTimer';
import { formatZAR } from '../../../utils/format';

export default function FeaturedDrawHero({ car }) {
  const navigate = useNavigate();
  if (!car) return null;
  const showClosingSoon = car.status === 'closing_soon';

  return (
    <article className="ld-card !p-0 overflow-hidden">
      <div className="grid lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[16/9] lg:aspect-auto bg-dark-200">
          <img
            src={car.images?.[0]}
            alt={car.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <StatusPill status="active_draw" label="FEATURED DRAW" />
            {showClosingSoon && <StatusPill status="closing_soon" />}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div>
            <div className="font-label-bold text-[11px] text-primary mb-2">
              ★ NEXT TO CLOSE
            </div>
            <h2 className="font-display font-bold text-headline-md text-text">{car.name}</h2>
            <p className="text-text-muted mt-1">
              Current Prize Value:{' '}
              <span className="text-text font-medium">{formatZAR(car.prizeValue)}</span>
            </p>
          </div>

          <CountdownTimer
            targetDate={car.drawDate}
            variant="block"
            label="DROP CLOSES IN"
          />

          <SalesProgress sold={car.ticketsSold} total={car.totalTickets} />

          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-2 border-t border-outline-variant/20">
            <div className="text-text">
              <span className="font-display font-bold text-2xl">{formatZAR(car.ticketPrice)}</span>
              <span className="text-sm text-text-muted"> / ticket</span>
            </div>
            <Button onClick={() => navigate(`/cars/${car.id}`)}>Enter Now</Button>
          </div>
        </div>
      </div>
    </article>
  );
}
