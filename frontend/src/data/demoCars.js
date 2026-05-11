// Demo data — used while backend stubs return 501. Mirrors the contracts in
// backend/routes/cars.routes.js and admin.routes.js so a swap-in is trivial.

const now = Date.now();
const days = (n) => new Date(now + n * 86_400_000).toISOString();

const FAQ = [
  {
    key: 'fair',
    question: 'How is the winner selected?',
    answer:
      'Winners are chosen via a verifiably random draw conducted under the supervision of independent auditors, ensuring complete fairness and transparency, and accountable to our brand.',
  },
  {
    key: 'cash',
    question: 'Are there cash alternatives?',
    answer:
      "Yes, if the winner prefers, a cash alternative of 80% of the vehicle's retail value can be selected instead of taking delivery of the car.",
  },
  {
    key: 'when',
    question: 'When does the draw take place?',
    answer:
      'The draw occurs after the maximum number of tickets has been sold OR on the published draw date — whichever happens first. We notify all entrants at least 24 hours before the draw.',
  },
];

export const demoCars = [
  {
    id: 'lda-001',
    name: '2024 Volkswagen Golf R',
    make: 'Volkswagen',
    model: 'Golf R',
    shortId: 'LD-1042',
    color: 'Lapiz Blue',
    year: 2024,
    description:
      'Experience the pinnacle of hot hatch performance. The 2024 Volkswagen Golf R combines blistering acceleration with everyday usability, featuring the legendary 4Motion all-wheel-drive system and a meticulously crafted interior. Panoramic sunroof and premium Harman Kardon sound system included.',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
    ],
    engine: '2.0L TSI 4Motion',
    mileageKm: 0,
    prizeValue: 1200000,
    ticketPrice: 100,
    totalTickets: 12000,
    ticketsSold: 9000,
    drawDate: days(14),
    status: 'active',
    faq: FAQ,
  },
  {
    id: 'lda-002',
    name: '2024 Porsche 911 GT3 RS',
    make: 'Porsche',
    model: '911 GT3 RS',
    shortId: 'LD-1042',
    color: 'Silver',
    year: 2024,
    description:
      'A track-focused thoroughbred for the road. The 911 GT3 RS is the most uncompromising 911 ever built — every component sharpened for maximum performance.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'],
    engine: '4.0L Flat-6 NA',
    mileageKm: 0,
    prizeValue: 4500000,
    ticketPrice: 250,
    totalTickets: 20000,
    ticketsSold: 13000,
    drawDate: days(30),
    status: 'active',
    faq: FAQ,
  },
  {
    id: 'lda-003',
    name: '2024 BMW M4 Competition',
    make: 'BMW',
    model: 'M4 Competition',
    shortId: 'LD-1043',
    color: 'Sao Paulo Yellow',
    year: 2024,
    description:
      'The pinnacle of BMW M division engineering. Twin-turbo straight-six, M xDrive AWD, and a track-tuned chassis that makes every drive an event.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200'],
    engine: '3.0L Twin-Turbo I6',
    mileageKm: 0,
    prizeValue: 1600000,
    ticketPrice: 50,
    totalTickets: 15000,
    ticketsSold: 13140,
    drawDate: days(7),
    status: 'closing_soon',
    faq: FAQ,
  },
  {
    id: 'lda-004',
    name: '2024 McLaren 720S',
    make: 'McLaren',
    model: '720S',
    shortId: 'LD-1041',
    color: 'Aurora Blue',
    year: 2024,
    description:
      'Supercar performance with everyday drivability. The 720S delivers blistering pace courtesy of its 4.0L twin-turbo V8 and feather-light carbon-fibre tub.',
    images: ['https://images.unsplash.com/photo-1517994112540-009c47ea476b?w=1200'],
    engine: '4.0L Twin-Turbo V8',
    mileageKm: 0,
    prizeValue: 6200000,
    ticketPrice: 450,
    totalTickets: 15000,
    ticketsSold: 4800,
    drawDate: days(45),
    status: 'active',
    faq: FAQ,
  },
  {
    id: 'lda-005',
    name: '2023 Mercedes-AMG G63',
    make: 'Mercedes-AMG',
    model: 'G63',
    shortId: 'LD-1039',
    color: 'Obsidian Black',
    year: 2023,
    description:
      'The icon, perfected. AMG-tuned 4.0L V8 biturbo, hand-built engine, and an interior that mixes brutal capability with first-class luxury.',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200'],
    engine: '4.0L V8 Biturbo',
    mileageKm: 1900,
    prizeValue: 3800000,
    ticketPrice: 200,
    totalTickets: 19000,
    ticketsSold: 19000,
    drawDate: days(-30),
    status: 'draw_complete',
    faq: FAQ,
  },
];

export const findCar = (id) => demoCars.find((c) => c.id === id);
