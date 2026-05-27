import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { Trophy, CalendarClock } from 'lucide-react';

import WinnerCard from './WinnerCard';
import UpcomingDrawCard from './UpcomingDrawCard';
import { fetchDraws } from './Winners.helper';
import { useAuth } from '../../../context/AuthContext';

export default function Winners() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const isAdmin = user?.role === 'admin';

  const reload = async () => {
    const fresh = await fetchDraws();
    setData(fresh);
  };

  useEffect(() => {
    reload();
  }, []);

  const announced = data?.announced || [];
  const scheduled = data?.scheduled || [];
  const featured = announced[0];
  const restAnnounced = announced.slice(1);

  return (
    <div className="ld-winners">
      {/* Hero */}
      <section className="ld-container py-12 text-center">
        <div className="font-label-bold text-xs text-primary mb-3 inline-flex items-center gap-2 justify-center">
          <Trophy size={14} /> WINNERS HALL OF FAME
        </div>
        <h1 className="font-display font-bold text-headline-lg md:text-display-xl leading-[1.05]">
          Lucky Drivers.
        </h1>
        <p className="text-body-lg text-text-muted max-w-xl mx-auto mt-4">
          Real winners. Real cars. Real keys handed over. Every token entered into a draw
          is published here on announcement day — fair, public, auditable.
        </p>
      </section>

      {/* Loading */}
      {data === null && (
        <section className="ld-container pb-12">
          <div className="ld-card">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </section>
      )}

      {/* Featured winner */}
      {data !== null && featured && (
        <section className="ld-container pb-10">
          <h2 className="font-display font-bold text-headline-sm text-text mb-5">
            Latest Winner
          </h2>
          <WinnerCard draw={featured} featured onChanged={reload} />
        </section>
      )}

      {/* Past winners grid */}
      {data !== null && restAnnounced.length > 0 && (
        <section className="ld-container pb-10">
          <h2 className="font-display font-bold text-headline-sm text-text mb-5">
            Past Winners
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {restAnnounced.map((d) => (
              <WinnerCard key={d.id} draw={d} onChanged={reload} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state for announced */}
      {data !== null && announced.length === 0 && (
        <section className="ld-container pb-10">
          <div className="ld-card text-center py-12 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl">No winners yet</h3>
              <p className="text-text-muted mt-1 max-w-md">
                {isAdmin
                  ? 'Go to Admin → Winners, choose a pending draw, and use Announce winner with the winner name and winning token.'
                  : 'The first draw is on its way — when it runs, the winning token will be revealed right here alongside every entered token number.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming */}
      {data !== null && scheduled.length > 0 && (
        <section className="ld-container py-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-headline-sm text-text">
                Coming Soon
              </h2>
              <p className="text-text-muted text-sm mt-1 inline-flex items-center gap-2">
                <CalendarClock size={14} className="text-primary" />
                Winners revealed on the published draw date.
              </p>
            </div>
            <span className="font-label-bold text-[11px] text-text-muted">
              {scheduled.length} UPCOMING
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scheduled.map((d) => (
              <UpcomingDrawCard key={d.id} draw={d} onChanged={reload} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
