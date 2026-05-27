/**
 * Insert demo car listings (no users wiped, no tickets minted).
 * Safe to re-run when the inventory is empty.
 *
 * Usage: node scripts/seed-cars.js
 */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Car = require('../models/Car');
const Draw = require('../models/Draw');

const FAQ = [
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
      'The draw occurs after the maximum number of tickets has been sold OR on the published draw date — whichever happens first.',
  },
];

const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const cars = [
  {
    name: '2024 McLaren 720S',
    make: 'McLaren',
    model: '720S',
    year: 2024,
    color: 'Aurora Blue',
    description:
      'Supercar performance with everyday drivability. The 720S delivers blistering pace courtesy of its 4.0L twin-turbo V8 and feather-light carbon-fibre tub.',
    images: ['https://images.unsplash.com/photo-1517994112540-009c47ea476b?w=1200'],
    engine: '4.0L Twin-Turbo V8',
    mileageKm: 0,
    prizeValue: 6200000,
    ticketPrice: 450,
    totalTickets: 15000,
    ticketsSold: 0,
    drawDate: days(45),
    status: 'active',
    ticketSalesOpen: true,
    faq: FAQ,
  },
  {
    name: '2024 BMW M4 Competition',
    make: 'BMW',
    model: 'M4 Competition',
    year: 2024,
    color: 'Sao Paulo Yellow',
    description:
      'The pinnacle of BMW M division engineering. Twin-turbo straight-six, M xDrive AWD, and a track-tuned chassis that makes every drive an event.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200'],
    engine: '3.0L Twin-Turbo I6',
    mileageKm: 0,
    prizeValue: 1600000,
    ticketPrice: 50,
    totalTickets: 15000,
    ticketsSold: 0,
    drawDate: days(7),
    status: 'closing_soon',
    ticketSalesOpen: true,
    faq: FAQ,
  },
  {
    name: '2024 Volkswagen Golf R',
    make: 'Volkswagen',
    model: 'Golf R',
    year: 2024,
    color: 'Lapiz Blue',
    description:
      'Experience the pinnacle of hot hatch performance. The 2024 Volkswagen Golf R combines blistering acceleration with everyday usability.',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
    ],
    engine: '2.0L TSI 4Motion',
    mileageKm: 0,
    prizeValue: 1200000,
    ticketPrice: 100,
    totalTickets: 12000,
    ticketsSold: 0,
    drawDate: days(14),
    status: 'active',
    ticketSalesOpen: true,
    faq: FAQ,
  },
  {
    name: '2024 Porsche 911 GT3 RS',
    make: 'Porsche',
    model: '911 GT3 RS',
    year: 2024,
    color: 'Silver',
    description:
      'A track-focused thoroughbred for the road. The 911 GT3 RS is the most uncompromising 911 ever built.',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'],
    engine: '4.0L Flat-6 NA',
    mileageKm: 0,
    prizeValue: 4500000,
    ticketPrice: 250,
    totalTickets: 20000,
    ticketsSold: 0,
    drawDate: days(30),
    status: 'active',
    ticketSalesOpen: true,
    faq: FAQ,
  },
];

async function main() {
  await connectDB(process.env.MONGODB_URI);

  const count = await Car.countDocuments();
  if (count > 0) {
    console.log(`[seed-cars] ${count} car(s) already in DB — skipping insert.`);
    console.log('[seed-cars] To replace listings, run wipe-cars.js first.');
    await mongoose.disconnect();
    return;
  }

  console.log(`[seed-cars] Inserting ${cars.length} listings…`);
  const inserted = await Car.insertMany(cars);

  await Draw.insertMany(
    inserted.map((c) => ({
      car: c._id,
      drawnAt: null,
      status: 'scheduled',
    }))
  );

  inserted.forEach((c) => console.log(`  ✓ ${c.name}`));
  console.log('[seed-cars] Done. Refresh Admin → Inventory.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed-cars] Failed:', err);
  process.exit(1);
});
