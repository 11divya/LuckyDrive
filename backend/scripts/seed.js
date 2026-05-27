/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Car = require('../models/Car');
const Draw = require('../models/Draw');

const FAQ = [
  {
    question: 'How is the winner selected?',
    answer:
      'Winners are chosen via a verifiably random draw conducted under the supervision of independent auditors, ensuring complete fairness and transparency, and accountable to our branding.',
  },
  {
    question: 'Are there cash alternatives?',
    answer:
      "Yes, if the winner prefers, a cash alternative of 80% of the vehicle's retail value can be selected instead of taking delivery of the car.",
  },
  {
    question: 'When does the draw take place?',
    answer:
      'The draw occurs after the maximum number of tickets has been sold OR on the published draw date — whichever happens first. We will notify all entrants at least 24 hours before the draw.',
  },
];

const cars = [
  {
    name: '2024 Volkswagen Golf R',
    make: 'Volkswagen', model: 'Golf R', year: 2024, color: 'Lapiz Blue',
    description:
      'Experience the pinnacle of hot hatch performance. The 2024 Volkswagen Golf R combines blistering acceleration with everyday usability, featuring the legendary 4Motion all-wheel-drive system and a meticulously crafted interior.',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
    ],
    engine: '2.0L TSI 4Motion', mileageKm: 0,
    prizeValue: 1200000, ticketPrice: 100, totalTickets: 12000, ticketsSold: 9000,
    drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    status: 'active', faq: FAQ,
  },
  {
    name: '2024 Porsche 911 GT3 RS',
    make: 'Porsche', model: '911 GT3 RS', year: 2024, color: 'Silver',
    description:
      'A track-focused thoroughbred for the road. The 911 GT3 RS is the most uncompromising 911 ever built — every component sharpened for maximum performance.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'],
    engine: '4.0L Flat-6 NA', mileageKm: 0,
    prizeValue: 4500000, ticketPrice: 250, totalTickets: 20000, ticketsSold: 13000,
    drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    status: 'active', faq: FAQ,
  },
  {
    name: '2024 BMW M4 Competition',
    make: 'BMW', model: 'M4 Competition', year: 2024, color: 'Sao Paulo Yellow',
    description:
      'The pinnacle of BMW M division engineering. Twin-turbo straight-six, M xDrive AWD, and a track-tuned chassis that makes every drive an event.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200'],
    engine: '3.0L Twin-Turbo I6', mileageKm: 0,
    prizeValue: 1600000, ticketPrice: 50, totalTickets: 15000, ticketsSold: 13140,
    drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    status: 'closing_soon', faq: FAQ,
  },
  {
    name: '2024 McLaren 720S',
    make: 'McLaren', model: '720S', year: 2024, color: 'Aurora Blue',
    description:
      'Supercar performance with everyday drivability. The 720S delivers blistering pace courtesy of its 4.0L twin-turbo V8 and feather-light carbon-fibre tub.',
    images: ['https://images.unsplash.com/photo-1517994112540-009c47ea476b?w=1200'],
    engine: '4.0L Twin-Turbo V8', mileageKm: 0,
    prizeValue: 6200000, ticketPrice: 450, totalTickets: 15000, ticketsSold: 4800,
    drawDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    status: 'active', faq: FAQ,
  },
];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  console.log('[seed] Wiping existing seed data…');
  await Promise.all([
    User.deleteMany({}),
    Car.deleteMany({}),
    Ticket.deleteMany({}),
    Booking.deleteMany({}),
    Draw.deleteMany({}),
  ]);

  console.log('[seed] Creating admin user (admin@luckydrive.co.za / Password123!)…');
  await User.create({
    name: 'Admin User',
    email: 'admin@luckydrive.co.za',
    password: 'Password123!',
    role: 'admin',
  });

  console.log('[seed] No demo customers — real signups only via /api/auth/signup');

  console.log(`[seed] Inserting ${cars.length} demo cars…`);
  const insertedCars = await Car.insertMany(cars);

  const upcomingCars = insertedCars;
  await Draw.insertMany(
    upcomingCars.map((c) => ({
      car: c._id,
      drawnAt: null,
      status: 'scheduled',
    }))
  );

  console.log(
    `[seed]   ${upcomingCars.length} scheduled draws queued for upcoming cars.`
  );

  console.log('[seed] Done.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
