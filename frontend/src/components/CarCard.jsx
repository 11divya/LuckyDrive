import { useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';
import SalesProgress from './SalesProgress';
import CountdownTimer from './CountdownTimer';
import Button from './Button';
import { formatZAR } from '../utils/format';

export default function CarCard({ car }) {
  const navigate = useNavigate();
  const showClosingSoon = car.status === 'closing_soon';

  return (
    <article className="ld-card !p-0 overflow-hidden flex flex-col hover:shadow-card-hover transition-shadow">
      <div className="relative aspect-[16/9] bg-dark-200 overflow-hidden">
        <img
          src={car.images?.[0]}
          alt={car.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {showClosingSoon && (
          <div className="absolute top-3 left-3">
            <StatusPill status="closing_soon" />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-display font-bold text-xl text-text">{car.name}</h3>
          <p className="text-sm text-text-muted mt-1">
            Current Prize Value: <span className="text-text font-medium">{formatZAR(car.prizeValue)}</span>
          </p>
        </div>

        <SalesProgress sold={car.ticketsSold} total={car.totalTickets} />

        <CountdownTimer targetDate={car.drawDate} />

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="text-text">
            <span className="font-display font-bold text-xl">{formatZAR(car.ticketPrice, { compact: false })}</span>
            <span className="text-sm text-text-muted"> / ticket</span>
          </div>
          <Button size="middle" onClick={() => navigate(`/cars/${car.id}`)}>
            Enter Now
          </Button>
        </div>
      </div>
    </article>
  );
}
