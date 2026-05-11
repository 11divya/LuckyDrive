import { useEffect, useState } from 'react';
import { Crown, Calendar, Ticket as TicketIcon } from 'lucide-react';
import StatusPill from '../../../components/StatusPill';
import { formatZAR } from '../../../utils/format';
import TokenGrid from './TokenGrid';
import DrawAdminActions from './DrawAdminActions';
import { fetchDrawTokens, formatDrawDate } from './Winners.helper';

// One announced winner — featured row layout (image left, content right) on
// desktop, stacked on mobile. Lazy-loads the full token list on first mount
// so the page stays light when there are many announced draws.

export default function WinnerCard({ draw, featured = false, onChanged }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDrawTokens(draw.id)
      .then(setDetails)
      .finally(() => setLoading(false));
  }, [draw.id]);

  const tokens = details?.tickets || [];

  return (
    <article
      className={`ld-card !p-0 overflow-hidden ${featured ? '' : 'flex flex-col'}`}
    >
      <div className={featured ? 'grid lg:grid-cols-2' : ''}>
        {/* Image */}
        <div className="relative aspect-[16/9] bg-dark-200">
          <img
            src={draw.car?.image}
            alt={draw.car?.name}
            className="w-full h-full object-cover"
            loading={featured ? 'eager' : 'lazy'}
          />
          <div className="absolute top-3 left-3">
            <StatusPill status="active_draw" label="WINNER ANNOUNCED" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-label-bold text-[11px] text-primary mb-2 inline-flex items-center gap-2">
                <Crown size={14} /> LUCKY DRIVER
              </div>
              <h3 className="font-display font-bold text-headline-sm md:text-headline-md text-text">
                {draw.car?.name}
              </h3>
              <p className="text-text-muted text-sm mt-1">
                Prize value{' '}
                <span className="text-text font-medium">
                  {formatZAR(draw.car?.prizeValue)}
                </span>
              </p>
            </div>
            <DrawAdminActions draw={draw} onChanged={onChanged} />
          </div>

          {/* Winner block */}
          <div className="mt-5 px-5 py-4 rounded-xl bg-dark-200 border border-primary/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-label-bold text-[10px] text-text-muted">
                  WINNER
                </div>
                <div className="font-display font-bold text-xl text-text mt-0.5">
                  {draw.winner?.name || 'Anonymous'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-label-bold text-[10px] text-text-muted">
                  WINNING TOKEN
                </div>
                <div className="font-mono font-bold text-lg text-primary tracking-wider mt-0.5">
                  {draw.winner?.ticketCode}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-text-muted">
            <span className="inline-flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              Drawn {formatDrawDate(draw.drawnAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <TicketIcon size={14} className="text-primary" />
              {(draw.totalTicketsEntered || 0).toLocaleString('en-ZA')} tokens entered
            </span>
          </div>

          <TokenGrid
            tokens={tokens}
            loading={loading}
            winnerCode={draw.winner?.ticketCode}
          />
        </div>
      </div>
    </article>
  );
}
