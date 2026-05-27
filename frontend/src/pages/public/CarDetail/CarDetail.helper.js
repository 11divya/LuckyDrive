import ApiService from '../../../services/api';
import { findCar } from '../../../data/demoCars';
import { isTicketSalesOpen, TICKET_SALES_CLOSED_MESSAGE } from '../../../utils/ticketSales';

export const fetchCar = async (id) => {
  try {
    const data = await ApiService.getCar(id);
    if (data?.id || data?._id) return { ...data, id: data.id || data._id };
  } catch {
    // 501 / network — fall through to demo.
  }
  return findCar(id) || null;
};

export const buildBreadcrumbs = (car) => [
  { title: 'Home',  href: '/' },
  { title: 'Cars',  href: '/' },
  { title: car?.name || '—' },
];

export const buildStats = (car) => {
  if (!car) return [];
  return [
    { label: 'ENGINE',      value: car.engine || '—' },
    { label: 'YEAR',        value: car.year || '—' },
    { label: 'MILEAGE',     value: `${(car.mileageKm ?? 0).toLocaleString('en-ZA')} km` },
    { label: 'PRIZE VALUE', value: `R ${(car.prizeValue || 0).toLocaleString('en-ZA')}` },
  ];
};

export const calcTotal = (qty, price) => qty * price;

// Click handler for the "Buy Now" button. Opens the UPI payment modal,
// after gating on authentication. The actual payment confirmation lives
// inside the modal (see components/PaymentModal.jsx).
export const buildOpenPaymentHandler = ({ car, message, navigate, user, openModal }) => () => {
  if (!isTicketSalesOpen(car)) {
    message.warning(TICKET_SALES_CLOSED_MESSAGE);
    return;
  }
  if (!user) {
    message.info('Please log in to buy tickets.');
    navigate('/login', { state: { from: { pathname: `/cars/${car.id}` } } });
    return;
  }
  openModal();
};
