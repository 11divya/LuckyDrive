import { useEffect, useMemo, useState } from 'react';
import { Skeleton, Tabs, Select } from 'antd';
import { Hourglass } from 'lucide-react';

import CarCard from '../../../components/CarCard';
import Button from '../../../components/Button';
import DrawStats from './DrawStats';
import FeaturedDrawHero from './FeaturedDrawHero';
import {
  TAB_ITEMS,
  SORT_OPTIONS,
  fetchLiveDraws,
  filterByTab,
  pickFeatured,
  computeStats,
  sortRows,
} from './LiveDraws.helper';

export default function LiveDraws() {
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState('all');
  const [sortKey, setSortKey] = useState('closing');

  useEffect(() => {
    fetchLiveDraws().then(setRows);
  }, []);

  const featured = useMemo(() => pickFeatured(rows || []), [rows]);
  const stats = useMemo(() => computeStats(rows || []), [rows]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const filtered = filterByTab(rows, tab);
    const withoutFeatured = featured ? filtered.filter((c) => c.id !== featured.id) : filtered;
    return sortRows(withoutFeatured, sortKey);
  }, [rows, tab, sortKey, featured]);

  return (
    <div className="ld-live-draws">
      {/* Hero header */}
      <section className="ld-container py-12">
        <div className="font-label-bold text-xs text-primary mb-3">★ LIVE DRAWS</div>
        <h1 className="font-display font-bold text-headline-lg md:text-display-xl leading-[1.05]">
          Every Open Draw.
        </h1>
        <p className="text-body-lg text-text-muted max-w-2xl mt-4">
          Pick your dream car. Pick your ticket count. Watch the countdown.
        </p>
      </section>

      {/* Stats banner */}
      <section className="ld-container">
        {rows === null ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ld-card !p-5">
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </div>
            ))}
          </div>
        ) : (
          <DrawStats stats={stats} />
        )}
      </section>

      {/* Featured hero */}
      {rows !== null && featured && (
        <section className="ld-container py-10">
          <FeaturedDrawHero car={featured} />
        </section>
      )}

      {/* Tabs + sort + grid */}
      <section className="ld-container pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display font-bold text-headline-sm text-text">All Open Draws</h2>
            <p className="text-text-muted text-sm mt-1">
              {rows === null
                ? 'Loading the latest live draws…'
                : `${visible.length} draw${visible.length === 1 ? '' : 's'} available`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-bold text-[11px] text-text-muted hidden md:inline">
              SORT BY
            </span>
            <Select
              value={sortKey}
              onChange={setSortKey}
              options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
              className="!w-[200px]"
              size="middle"
            />
          </div>
        </div>

        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={TAB_ITEMS}
          className="ld-live-draws__tabs"
        />

        {rows === null ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="ld-card">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="ld-card text-center py-16 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Hourglass size={24} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl">No open draws right now</h3>
              <p className="text-text-muted mt-1 max-w-md">
                New cars launch every Friday. Drop us your email and we'll ping you the moment the
                next draw goes live.
              </p>
            </div>
            <Button variant="secondary">Notify Me</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
