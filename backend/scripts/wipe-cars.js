/**
 * Wipe all car-related data (Cars, Tickets, Bookings, Draws) from the DB.
 * User accounts are preserved so the admin can still log in.
 *
 * Usage: node scripts/wipe-cars.js
 */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Draw = require('../models/Draw');

async function main() {
  await connectDB(process.env.MONGODB_URI);

  console.log('[wipe] Deleting all Tickets…');
  const t = await Ticket.deleteMany({});
  console.log(`  → ${t.deletedCount} ticket(s) removed`);

  console.log('[wipe] Deleting all Bookings…');
  const b = await Booking.deleteMany({});
  console.log(`  → ${b.deletedCount} booking(s) removed`);

  console.log('[wipe] Deleting all Draws…');
  const d = await Draw.deleteMany({});
  console.log(`  → ${d.deletedCount} draw(s) removed`);

  console.log('[wipe] Deleting all Cars…');
  const c = await Car.deleteMany({});
  console.log(`  → ${c.deletedCount} car(s) removed`);

  console.log('[wipe] Done. User accounts were preserved.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[wipe] Failed:', err);
  process.exit(1);
});
