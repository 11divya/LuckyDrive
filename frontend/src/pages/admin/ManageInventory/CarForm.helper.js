import dayjs from 'dayjs';
import ApiService from '../../../services/api';

export const STATUS_OPTIONS = [
  { value: 'draft',          label: 'Draft' },
  { value: 'active',         label: 'Active' },
  { value: 'closing_soon',   label: 'Closing Soon' },
  { value: 'draw_complete',  label: 'Draw Complete' },
  { value: 'delivered',      label: 'Delivered' },
];

export const DEFAULT_FAQ = [
  {
    question: 'How is the winner selected?',
    answer:
      'Winners are chosen via a verifiably random draw conducted under the supervision of independent auditors, ensuring complete fairness and transparency.',
  },
  {
    question: 'Are there cash alternatives?',
    answer:
      "Yes, if the winner prefers, a cash alternative of 80% of the vehicle's retail value can be selected instead of taking delivery of the car.",
  },
  {
    question: 'When does the draw take place?',
    answer:
      'The draw occurs after the maximum number of tickets has been sold OR on the published draw date — whichever happens first. Entrants are notified at least 24 hours before the draw.',
  },
];

// Convert a Car document (from the API) into AntD Form initial values.
export const carToFormValues = (car) => {
  if (!car) {
    return {
      status: 'active',
      ticketSalesOpen: true,
      ticketsSold: 0,
      year: new Date().getFullYear(),
      mileageKm: 0,
      images: [''],
      faq: DEFAULT_FAQ.map((f) => ({ ...f })),
    };
  }
  return {
    name: car.name,
    make: car.make,
    model: car.model,
    year: car.year,
    color: car.color,
    description: car.description,
    engine: car.engine,
    mileageKm: car.mileageKm ?? 0,
    prizeValue: car.prizeValue,
    ticketPrice: car.ticketPrice,
    totalTickets: car.totalTickets,
    ticketsSold: car.ticketsSold ?? 0,
    ticketSalesOpen: car.ticketSalesOpen ?? false,
    drawDate: car.drawDate ? dayjs(car.drawDate) : undefined,
    status: car.status || 'active',
    images: car.images?.length ? [...car.images] : [''],
    faq: car.faq?.length
      ? car.faq.map((f) => ({ question: f.question, answer: f.answer }))
      : [],
  };
};

// Convert AntD Form values into a payload accepted by the admin endpoints.
export const formValuesToPayload = (values) => {
  const { mintedTicketCount: _minted, ...rest } = values;
  const payload = { ...rest };
  payload.images = (values.images || []).filter(Boolean);
  payload.faq = (values.faq || []).filter((f) => f && f.question && f.answer);
  if (values.drawDate) {
    // dayjs → ISO string for express-validator's isISO8601()
    payload.drawDate = values.drawDate.toISOString();
  }
  return payload;
};

// Submit handler used by the drawer. Returns the saved car on success.
export const saveCar = async ({ carId, payload }) => {
  if (carId) return ApiService.adminUpdateCar(carId, payload);
  return ApiService.adminCreateCar(payload);
};

// Render the API validation `details` array as a single human message.
export const formatApiError = (err) => {
  if (err?.details?.length) {
    return err.details.map((d) => `${d.field}: ${d.message}`).join('  ·  ');
  }
  return err?.message || 'Unable to save car';
};
