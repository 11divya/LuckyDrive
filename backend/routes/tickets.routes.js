const router = require('express').Router();
const mongoose = require('mongoose');

const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  ticketValidation,
  handleValidationErrors,
} = require('../middleware/validation.middleware');
const { BadRequestError, NotFoundError, ConflictError } = require('../utils/errors');
const { generateTicketCodeBatch } = require('../utils/codes');

const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const User = require('../models/User');
const PaymentsAdapter = require('../services/payments');
const EmailService = require('../services/email');
const { carAcceptsTicketSales } = require('../utils/ticketSales');

const PURCHASABLE_STATUSES = ['active', 'closing_soon'];

const PAYMENT_NOT_RECEIVED_MSG =
  'Payment not received yet. Complete your UPI payment in your banking app, then tap "I have paid" again.';

function bookingPayload(booking) {
  return {
    id: booking._id.toString(),
    quantity: booking.quantity,
    unitPrice: booking.unitPrice,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    paymentStatus: booking.paymentStatus,
    providerRef: booking.providerRef,
    purchasedAt: booking.paidAt || booking.createdAt,
  };
}

function purchaseSuccessPayload({ booking, tickets, car, user, buyer }) {
  return {
    customer: {
      email: user.email,
      name: buyer?.name || null,
    },
    booking: bookingPayload(booking),
    tickets: tickets.map((t) => ({
      id: t._id.toString(),
      code: t.code,
      purchasedAt: t.purchasedAt,
    })),
    car: {
      id: car._id.toString(),
      name: car.name,
      drawDate: car.drawDate,
      ticketPrice: car.ticketPrice,
      prizeValue: car.prizeValue,
    },
    message: `${tickets.length} token${
      tickets.length === 1 ? '' : 's'
    } issued. Confirmation sent to ${user.email}.`,
  };
}

async function assertCarAvailableForPurchase(carId, quantity) {
  const carForPolicy = await Car.findById(carId);
  if (!carForPolicy) throw new NotFoundError('Car not found');
  if (!carAcceptsTicketSales(carForPolicy)) {
    throw new BadRequestError(
      'Ticket sales are not open for this vehicle. Contact support if you believe this is an error.'
    );
  }
  if (!PURCHASABLE_STATUSES.includes(carForPolicy.status)) {
    throw new BadRequestError('This draw is no longer accepting tickets');
  }
  const remaining = carForPolicy.totalTickets - carForPolicy.ticketsSold;
  if (quantity > remaining) {
    throw new BadRequestError(
      `Only ${remaining} ticket${remaining === 1 ? '' : 's'} remaining`
    );
  }
  return carForPolicy;
}

async function fulfillPaidBooking(booking, user) {
  if (booking.paymentStatus === 'paid' && booking.tickets?.length) {
    const car = await Car.findById(booking.car);
    const tickets = await Ticket.find({ booking: booking._id });
    const buyer = await User.findById(user.id).lean();
    return { booking, tickets, car, buyer };
  }

  const { carId, quantity } = {
    carId: booking.car,
    quantity: booking.quantity,
  };
  const userId = booking.user;

  let car;
  let tickets;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const freshBooking = await Booking.findById(booking._id).session(session);
      if (!freshBooking) throw new NotFoundError('Booking not found');
      if (freshBooking.paymentStatus === 'paid' && freshBooking.tickets?.length) {
        car = await Car.findById(freshBooking.car).session(session);
        tickets = await Ticket.find({ booking: freshBooking._id }).session(session);
        booking = freshBooking;
        return;
      }

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

      const codes = generateTicketCodeBatch(quantity);
      try {
        tickets = await Ticket.insertMany(
          codes.map((code) => ({
            code,
            car: car._id,
            user: userId,
            booking: freshBooking._id,
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
            booking: freshBooking._id,
          })),
          { session, ordered: true }
        );
      }

      freshBooking.paymentStatus = 'paid';
      freshBooking.paidAt = freshBooking.paidAt || new Date();
      freshBooking.tickets = tickets.map((t) => t._id);
      await freshBooking.save({ session });
      booking = freshBooking;
    });
  } finally {
    session.endSession();
  }

  const buyer = await User.findById(user.id).lean();

  EmailService.sendTicketConfirmation({
    to: user.email,
    name: buyer?.name,
    car,
    tickets,
    booking,
  }).catch((err) =>
    console.error('[email] Ticket confirmation send failed:', err.message)
  );

  return { booking, tickets, car, buyer };
}

// ----------------------------------------------------------------------------
// POST /api/tickets/checkout — start UPI checkout (pending booking, no tokens yet).
// ----------------------------------------------------------------------------
router.post(
  '/checkout',
  authenticate,
  ticketValidation.checkout,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { carId, quantity, providerRef } = req.body;
    const userId = req.user.id;

    const car = await assertCarAvailableForPurchase(carId, quantity);

    const refTaken = await Booking.findOne({ providerRef });
    if (refTaken) {
      if (refTaken.user.toString() !== userId) {
        throw new ConflictError('Transaction reference already in use');
      }
      if (refTaken.paymentStatus === 'paid') {
        throw new BadRequestError('This payment has already been completed');
      }
      if (
        refTaken.car.toString() === carId &&
        refTaken.quantity === quantity
      ) {
        return res.json({
          success: true,
          data: {
            booking: bookingPayload(refTaken),
            paymentStatus: refTaken.paymentStatus,
          },
        });
      }
      throw new ConflictError('Transaction reference already in use');
    }

    const unitPrice = car.ticketPrice;
    const totalAmount = unitPrice * quantity;

    const booking = await Booking.create({
      user: userId,
      car: car._id,
      quantity,
      unitPrice,
      totalAmount,
      currency: 'ZAR',
      paymentStatus: 'pending',
      paymentProvider: process.env.PAYMENTS_PROVIDER || 'mock',
      providerRef,
    });

    res.status(201).json({
      success: true,
      data: {
        booking: bookingPayload(booking),
        paymentStatus: 'pending',
      },
    });
  })
);

// ----------------------------------------------------------------------------
// POST /api/tickets/purchase/confirm — verify UPI payment, then mint tokens.
// ----------------------------------------------------------------------------
router.post(
  '/purchase/confirm',
  authenticate,
  ticketValidation.confirmPurchase,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { providerRef } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ providerRef, user: userId });
    if (!booking) {
      throw new NotFoundError('Checkout session not found. Please scan the QR again.');
    }

    if (booking.paymentStatus === 'paid') {
      const fulfilled = await fulfillPaidBooking(booking, req.user);
      return res.json({
        success: true,
        data: purchaseSuccessPayload({
          ...fulfilled,
          user: req.user,
        }),
      });
    }

    const confirm = await PaymentsAdapter.confirmPayment(providerRef);

    if (confirm.status === 'pending' || confirm.status === 'not_found') {
      throw new BadRequestError(PAYMENT_NOT_RECEIVED_MSG);
    }

    if (confirm.status !== 'paid') {
      booking.paymentStatus = 'failed';
      await booking.save();
      throw new BadRequestError('Payment failed. Please try again or contact support.');
    }

    const fulfilled = await fulfillPaidBooking(booking, req.user);

    res.json({
      success: true,
      data: purchaseSuccessPayload({
        ...fulfilled,
        user: req.user,
      }),
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
