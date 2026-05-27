/**
 * Hard-delete cars by exact name + cascade related Ticket, Booking, Draw docs.
 * Usage: node scripts/delete-cars-by-name.js "Car Name One" "Car Name Two"
 * Or run with no args to delete the default demo trio from seed.
 */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Draw = require('../models/Draw');

const DEFAULT_NAMES = [
  '2023 Mercedes-AMG G63',
  '2024 Volkswagen Golf R',
  '2024 Porsche 911 GT3 RS',
];

async function main() {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_NAMES;
  await connectDB(process.env.MONGODB_URI);

  for (const name of names) {
    const car = await Car.findOne({ name: name.trim() });
    if (!car) {
      console.log(`[skip] Not found: "${name}"`);
      continue;
    }
    const t = await Ticket.deleteMany({ car: car._id });
    const b = await Booking.deleteMany({ car: car._id });
    const d = await Draw.deleteMany({ car: car._id });
    await Car.deleteOne({ _id: car._id });
    console.log(
      `[ok] "${name}" — tickets=${t.deletedCount} bookings=${b.deletedCount} draws=${d.deletedCount}`
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
