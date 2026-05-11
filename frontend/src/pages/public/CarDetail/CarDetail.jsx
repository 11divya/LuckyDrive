import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Skeleton, App as AntdApp } from 'antd';

import CarGallery from './CarGallery';
import CarStatsStrip from './CarStatsStrip';
import CarFAQ from './CarFAQ';
import TicketPurchaseRail from './TicketPurchaseRail';
import PaymentModal from '../../../components/PaymentModal';
import { useAuth } from '../../../context/AuthContext';
import { formatZAR } from '../../../utils/format';
import {
  fetchCar,
  buildBreadcrumbs,
  buildStats,
  calcTotal,
  buildOpenPaymentHandler,
} from './CarDetail.helper';

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const { user } = useAuth();
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchCar(id)
      .then(setCar)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="ld-container py-10">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="ld-container py-20 text-center">
        <h1 className="font-display text-headline-md mb-2">Car not found</h1>
        <p className="text-text-muted mb-6">The draw you are looking for is no longer available.</p>
        <Link to="/" className="text-primary font-label-bold">← BACK TO HOME</Link>
      </div>
    );
  }

  const onBuy = buildOpenPaymentHandler({
    car,
    message,
    navigate,
    user,
    openModal: () => setPaymentOpen(true),
  });

  return (
    <div className="ld-container py-10 ld-car-detail">
      <Breadcrumb
        items={buildBreadcrumbs(car).map((b) =>
          b.href ? { title: <Link to={b.href}>{b.title}</Link> } : { title: b.title }
        )}
        className="mb-6"
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: gallery + content */}
        <div>
          <h1 className="font-display font-bold text-headline-lg text-text mb-6">{car.name}</h1>
          <CarGallery images={car.images} alt={car.name} />
          <CarStatsStrip stats={buildStats(car)} />

          <section className="mt-10">
            <h2 className="font-display font-bold text-headline-sm mb-3">Vehicle Overview</h2>
            <p className="text-text-muted leading-relaxed">{car.description}</p>
          </section>

          <CarFAQ items={car.faq} />
        </div>

        {/* Right: sticky purchase rail */}
        <TicketPurchaseRail
          car={car}
          qty={qty}
          onQtyChange={setQty}
          total={formatZAR(calcTotal(qty, car.ticketPrice))}
          onBuy={onBuy}
          submitting={false}
        />
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        car={car}
        qty={qty}
        total={calcTotal(qty, car.ticketPrice)}
      />
    </div>
  );
}
