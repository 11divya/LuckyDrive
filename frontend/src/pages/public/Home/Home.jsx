import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { ChevronRight } from 'lucide-react';

import CarCard from '../../../components/CarCard';
import { fetchHomeData, HOW_IT_WORKS } from './Home.helper';

export default function Home() {
  const [cars, setCars] = useState(null);

  useEffect(() => {
    fetchHomeData().then(setCars);
  }, []);

  return (
    <div className="ld-home">
      {/* HERO */}
      <section className="ld-container py-12 md:py-20 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <div className="font-label-bold text-xs text-primary mb-4">
            ★ SOUTH AFRICA'S PREMIER LUXURY CAR DRAW
          </div>
          <h1 className="font-display font-bold text-4xl md:text-display-xl leading-[1.05] mb-6">
            Win Your Dream <br />
            <span className="text-primary">Car Today.</span>
          </h1>
          <p className="text-body-lg text-text-muted max-w-lg">
            Experience the thrill of owning a high-performance luxury vehicle. Buy your tickets now
            for a chance to drive away in a premium Mercedes or BMW for a fraction of the cost.
          </p>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-dark-100 border border-outline-variant/30 shadow-card">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400"
              alt="Hero — luxury sports car"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* FEATURED DRAWS */}
      <section className="ld-container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-headline-md text-text">Featured Draws</h2>
            <p className="text-text-muted mt-1">Tickets selling fast. Don't miss your chance.</p>
          </div>
          <Link
            to="/draws"
            className="font-label-bold text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            VIEW ALL <ChevronRight size={14} />
          </Link>
        </div>

        {!cars ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ld-card">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="ld-container py-12 md:py-20">
        <h2 className="font-display font-bold text-headline-md text-text mb-2">How It Works</h2>
        <p className="text-text-muted mb-10 max-w-xl">
          Four simple steps from browsing a dream car to driving it home.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.n} className="ld-card">
              <div className="font-display font-bold text-3xl text-primary mb-3">{s.n}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{s.t}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
