/**
 * Remove seeded demo customers (@example.co.za) and their tickets/bookings.
 * Keeps admin users and real signups (e.g. customer@luckydrive.co.za).
 *
 * Usage: node scripts/remove-demo-customers.js
 */
/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Draw = require('../models/Draw');
const Car = require('../models/Car');

async function main() {
  await connectDB(process.env.MONGODB_URI);

  const demoUsers = await User.find({
    role: 'customer',
    email: { $regex: /@example\.co\.za$/i },
  });

  if (!demoUsers.length) {
    console.log('[cleanup] No @example.co.za demo customers found.');
    await mongoose.disconnect();
    return;
  }

  const ids = demoUsers.map((u) => u._id);
  console.log(
    `[cleanup] Removing ${demoUsers.length} demo customer(s):`,
    demoUsers.map((u) => u.email).join(', ')
  );

  const demoTicketIds = (
    await Ticket.find({ user: { $in: ids } }).select('_id')
  ).map((t) => t._id);

  const ticketResult = await Ticket.deleteMany({ user: { $in: ids } });
  const bookingResult = await Booking.deleteMany({ user: { $in: ids } });

  const drawResult = await Draw.updateMany(
    { $or: [{ winner: { $in: ids } }, { winningTicket: { $in: demoTicketIds } }] },
    {
      $unset: {
        winner: '',
        winningTicket: '',
        winnerDisplayName: '',
        publicTicketCode: '',
        drawnAt: '',
      },
      $set: { status: 'scheduled' },
    }
  );

  const userResult = await User.deleteMany({ _id: { $in: ids } });

  const cars = await Car.find({});
  for (const car of cars) {
    const sold = await Ticket.countDocuments({ car: car._id });
    if (car.ticketsSold !== sold) {
      car.ticketsSold = sold;
      await car.save();
      console.log(`[cleanup] Synced ticketsSold for ${car.name}: ${sold}`);
    }
  }

  console.log(`[cleanup] Deleted ${userResult.deletedCount} users`);
  console.log(`[cleanup] Deleted ${ticketResult.deletedCount} tickets`);
  console.log(`[cleanup] Deleted ${bookingResult.deletedCount} bookings`);
  console.log(`[cleanup] Reset ${drawResult.modifiedCount} draw(s) tied to demo winners`);

  const remaining = await User.countDocuments({ role: 'customer' });
  console.log(`[cleanup] ${remaining} real customer(s) remain.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[cleanup] Failed:', err);
  process.exit(1);
});
