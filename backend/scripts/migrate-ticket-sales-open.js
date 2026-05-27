/**
 * Set ticketSalesOpen on existing cars (active/closing_soon → open).
 * Usage: node scripts/migrate-ticket-sales-open.js
 */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const Car = require('../models/Car');

async function main() {
  await connectDB(process.env.MONGODB_URI);

  const open = await Car.updateMany(
    { status: { $in: ['active', 'closing_soon'] } },
    { $set: { ticketSalesOpen: true } }
  );
  const closed = await Car.updateMany(
    { status: { $nin: ['active', 'closing_soon'] } },
    { $set: { ticketSalesOpen: false } }
  );

  console.log(`[migrate] ticketSalesOpen=true on ${open.modifiedCount} active listing(s)`);
  console.log(`[migrate] ticketSalesOpen=false on ${closed.modifiedCount} other listing(s)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
