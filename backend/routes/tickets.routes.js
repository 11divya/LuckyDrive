const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');

const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  ticketValidation,
  handleValidationErrors,
} = require('../middleware/validation.middleware');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { generateTicketCodeBatch } = require('../utils/codes');

const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const User = require('../models/User');
const PaymentsAdapter = require('../services/payments');
const EmailService = require('../services/email');

const PURCHASABLE_STATUSES = ['active', 'closing_soon'];

// ----------------------------------------------------------------------------
// POST /api/tickets/purchase
// Reserves inventory atomically, creates a paid Booking, mints `quantity` unique
// Tickets, and emails the token numbers to the buyer (console fallback if no
// SMTP). Currently goes through PaymentsAdapter.confirmPayment with the mock
// provider — always succeeds.
// ----------------------------------------------------------------------------
router.post(
  '/purchase',
  authenticate,
  ticketValidation.purchase,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { carId, quantity } = req.body;
    const userId = req.user.id;

    let car;
    let booking;
    let tickets;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // 1) Atomic inventory reservation. Guard prevents oversell when two
        //    buyers race for the last ticket(s).
        car = await Car.findOneAndUpdate(
          {
            _id: carId,
            status: { $in: PURCHASABLE_STATUSES },
            $expr: {
              $lte: [{ $add: ['$ticketsSold', quantity] }, '$totalTickets'],
            },
          },
          { $inc: { ticketsSold: quantity } },
          { new: true, session }
        );

        if (!car) {
          // Distinguish "not found / closed" from "not enough remaining".
          const existing = await Car.findById(carId).session(session);
          if (!existing) throw new NotFoundError('Car not found');
          if (!PURCHASABLE_STATUSES.includes(existing.status)) {
            throw new BadRequestError('This draw is no longer accepting tickets');
          }
          const remaining = existing.totalTickets - existing.ticketsSold;
          throw new BadRequestError(
            `Only ${remaining} ticket${remaining === 1 ? '' : 's'} remaining`
          );
        }

        // 2) Booking — payments are mock-confirmed inline.
        const unitPrice = car.ticketPrice;
        const totalAmount = unitPrice * quantity;
        const providerRef = `mock_${crypto.randomBytes(8).toString('hex')}`;

        const confirm = await PaymentsAdapter.confirmPayment(providerRef);

        const created = await Booking.create(
          [
            {
              user: userId,
              car: car._id,
              quantity,
              unitPrice,
              totalAmount,
              currency: 'ZAR',
              paymentStatus: confirm.status === 'paid' ? 'paid' : 'failed',
              paymentProvider: process.env.PAYMENTS_PROVIDER || 'mock',
              providerRef,
              paidAt: confirm.status === 'paid' ? new Date() : undefined,
            },
          ],
          { session }
        );
        booking = created[0];

        // 3) Mint unique tickets. With a 16M-key code space + unique index,
        //    collisions are astronomically rare; we still retry once on E11000.
        const codes = generateTicketCodeBatch(quantity);
        try {
          tickets = await Ticket.insertMany(
            codes.map((code) => ({
              code,
              car: car._id,
              user: userId,
              booking: booking._id,
            })),
            { session, ordered: true }
          );
        } catch (err) {
          if (err?.code !== 11000) throw err;
          const retryCodes = generateTicketCodeBatch(quantity);
          tickets = await Ticket.insertMany(
            retryCodes.map((code) => ({
              code,
              car: car._id,
              user: userId,
              booking: booking._id,
            })),
            { session, ordered: true }
          );
        }

        // 4) Link tickets onto the booking.
        booking.tickets = tickets.map((t) => t._id);
        await booking.save({ session });
      });
    } finally {
      session.endSession();
    }

    // 5) Email — fire-and-forget after the transaction commits. We pull the
    //    user's name from the DB once (the JWT payload doesn't carry it).
    User.findById(userId)
      .lean()
      .then((u) =>
        EmailService.sendTicketConfirmation({
          to: req.user.email,
          name: u?.name,
          car,
          tickets,
          booking,
        })
      )
      .catch((err) =>
        console.error('[email] Ticket confirmation send failed:', err.message)
      );

    res.status(201).json({
      success: true,
      data: {
        booking: {
          id: booking._id.toString(),
          quantity: booking.quantity,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          paymentStatus: booking.paymentStatus,
          providerRef: booking.providerRef,
        },
        tickets: tickets.map((t) => ({ id: t._id.toString(), code: t.code })),
        car: {
          id: car._id.toString(),
          name: car.name,
          drawDate: car.drawDate,
        },
        message: `${tickets.length} token${
          tickets.length === 1 ? '' : 's'
        } issued. Confirmation sent to ${req.user.email}.`,
      },
    });
  })
);

// ----------------------------------------------------------------------------
// GET /api/tickets/me — every ticket the signed-in user owns.
// ----------------------------------------------------------------------------
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const items = await Ticket.find({ user: req.user.id })
      .sort({ purchasedAt: -1 })
      .populate('car', 'name images prizeValue drawDate status')
      .populate('booking', 'totalAmount paymentStatus createdAt providerRef');

    res.json({
      success: true,
      data: items.map((t) => ({
        id: t._id.toString(),
        code: t.code,
        isWinner: t.isWinner,
        purchasedAt: t.purchasedAt,
        car: t.car && {
          id: t.car._id.toString(),
          name: t.car.name,
          image: t.car.images?.[0],
          prizeValue: t.car.prizeValue,
          drawDate: t.car.drawDate,
          status: t.car.status,
        },
        booking: t.booking && {
          id: t.booking._id.toString(),
          totalAmount: t.booking.totalAmount,
          paymentStatus: t.booking.paymentStatus,
          providerRef: t.booking.providerRef,
        },
      })),
    });
  })
);

module.exports = router;
