/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

const { connectDB } = require('../config/database');
const User = require('../models/User');
const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Draw = require('../models/Draw');
const { generateTicketCodeBatch } = require('../utils/codes');

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
  // The "already-drawn" car — the seed mints real tickets and a Draw doc for it
  // so the Winners page renders a real winner + token list.
  {
    name: '2023 Mercedes-AMG G63',
    make: 'Mercedes-AMG', model: 'G63', year: 2023, color: 'Obsidian Black',
    description:
      'The icon, perfected. AMG-tuned 4.0L V8 biturbo, hand-built engine, and an interior that mixes brutal capability with first-class luxury.',
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200'],
    engine: '4.0L V8 Biturbo', mileageKm: 1900,
    prizeValue: 3800000, ticketPrice: 200, totalTickets: 50, ticketsSold: 0, // overwritten below
    drawDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    status: 'draw_complete', faq: FAQ,
  },
];

const demoCustomers = [
  { name: 'Alex Customer',   email: 'customer@luckydrive.co.za' }, // shared with login demos
  { name: 'Thando Mokoena',  email: 'thando.m@example.co.za' },
  { name: 'Naledi Khumalo',  email: 'naledi.k@example.co.za' },
  { name: 'Pieter van Wyk',  email: 'pieter.vw@example.co.za' },
  { name: 'Zinhle Dlamini',  email: 'zinhle.d@example.co.za' },
  { name: 'Sipho Nkosi',     email: 'sipho.n@example.co.za' },
  { name: 'Kavita Patel',    email: 'kavita.p@example.co.za' },
  { name: 'Lerato Sithole',  email: 'lerato.s@example.co.za' },
  { name: 'Daniel Botha',    email: 'daniel.b@example.co.za' },
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

  console.log(`[seed] Creating ${demoCustomers.length} demo customers (Password123!)…`);
  const customers = await Promise.all(
    demoCustomers.map((c) =>
      User.create({ ...c, password: 'Password123!', role: 'customer' })
    )
  );

  console.log(`[seed] Inserting ${cars.length} demo cars…`);
  const insertedCars = await Car.insertMany(cars);
  const amgG63 = insertedCars.find((c) => c.status === 'draw_complete');

  // ---------- Past draw: AMG G63 ----------
  // Distribute tickets across customers, mint Booking + Ticket docs, then run
  // a deterministic draw and persist the Draw record so the Winners page has
  // real data to render.
  const TARGET_TICKET_COUNT = amgG63.totalTickets; // 50

  // Per-user ticket allocation roughly summing to TARGET_TICKET_COUNT.
  const allocations = customers.map((u, i) => ({
    user: u,
    qty: [10, 8, 7, 6, 5, 4, 4, 3, 3][i] || 1,
  }));

  console.log(
    `[seed] Minting ${TARGET_TICKET_COUNT} demo tickets for "${amgG63.name}" across ${customers.length} customers…`
  );

  let mintedTickets = [];
  for (const { user, qty } of allocations) {
    const unitPrice = amgG63.ticketPrice;
    const totalAmount = unitPrice * qty;
    const booking = await Booking.create({
      user: user._id,
      car: amgG63._id,
      quantity: qty,
      unitPrice,
      totalAmount,
      currency: 'ZAR',
      paymentStatus: 'paid',
      paymentProvider: 'mock',
      providerRef: `seed_${crypto.randomBytes(6).toString('hex')}`,
      paidAt: new Date(amgG63.drawDate.getTime() - 1000 * 60 * 60 * 24 * 7),
    });

    const codes = generateTicketCodeBatch(qty);
    const ticketDocs = await Ticket.insertMany(
      codes.map((code) => ({
        code,
        car: amgG63._id,
        user: user._id,
        booking: booking._id,
        purchasedAt: booking.paidAt,
      }))
    );
    booking.tickets = ticketDocs.map((t) => t._id);
    await booking.save();
    mintedTickets = mintedTickets.concat(ticketDocs);
  }

  // Pick a winner deterministically (first-customer's first ticket would feel
  // rigged — use a random index from the AMG draw date as the seed).
  const seedHex = crypto
    .createHash('sha256')
    .update(`${amgG63._id.toString()}|${amgG63.drawDate.toISOString()}`)
    .digest('hex');
  const winningIndex = parseInt(seedHex.slice(0, 12), 16) % mintedTickets.length;
  const winningTicket = mintedTickets[winningIndex];

  await Ticket.findByIdAndUpdate(winningTicket._id, { isWinner: true });
  await Car.findByIdAndUpdate(amgG63._id, { ticketsSold: mintedTickets.length });

  await Draw.create({
    car: amgG63._id,
    winningTicket: winningTicket._id,
    winner: winningTicket.user,
    drawnAt: amgG63.drawDate,
    seed: seedHex,
    status: 'announced',
    notes: 'Seeded historical draw for the Winners page demo.',
  });

  const winnerUser = customers.find(
    (c) => c._id.toString() === winningTicket.user.toString()
  );
  console.log(
    `[seed]   Winning token: ${winningTicket.code}  →  ${winnerUser?.name} <${winnerUser?.email}>`
  );

  // ---------- Scheduled draws for upcoming cars ----------
  // Insert a "scheduled" Draw record for each upcoming car so the Winners page
  // can render an "Announcing soon on…" tile from a single endpoint.
  const upcomingCars = insertedCars.filter((c) => c.status !== 'draw_complete');
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
