const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  carValidation,
  drawValidation,
  settingsValidation,
  mongoId,
  pagination,
  handleValidationErrors,
} = require('../middleware/validation.middleware');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Draw = require('../models/Draw');
const Booking = require('../models/Booking');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const { carAcceptsTicketSales } = require('../utils/ticketSales');
const {
  allBanners,
  normalizeBannerInput,
} = require('../utils/announcementBanners');
const { paymentBankShape } = require('../utils/paymentBank');

router.use(authenticate, authorize('admin'));

// Whitelist of fields the admin form is allowed to write. Anything else on the
// payload is silently ignored.
const EDITABLE_FIELDS = [
  'name',
  'make',
  'model',
  'year',
  'color',
  'description',
  'engine',
  'mileageKm',
  'images',
  'prizeValue',
  'ticketPrice',
  'totalTickets',
  'ticketsSold',
  'drawDate',
  'status',
  'faq',
  'ticketSalesOpen',
];

function pickEditable(body) {
  const out = {};
  for (const k of EDITABLE_FIELDS) if (body[k] !== undefined) out[k] = body[k];
  // Filter empty image / faq rows from the form (Form.List leaves blank rows).
  if (Array.isArray(out.images)) out.images = out.images.filter(Boolean);
  if (Array.isArray(out.faq)) {
    out.faq = out.faq.filter((f) => f && f.question && f.answer);
  }
  return out;
}

async function mintedCountsByCar(carIds) {
  if (!carIds.length) return {};
  const rows = await Ticket.aggregate([
    { $match: { car: { $in: carIds } } },
    { $group: { _id: '$car', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id.toString(), r.count]));
}

function carShape(car, mintedMap = {}) {
  const id = car._id.toString();
  const mintedTicketCount = mintedMap[id] ?? 0;
  return {
    ...car.toJSON(),
    id,
    ticketSalesOpen: Boolean(car.ticketSalesOpen),
    mintedTicketCount,
    checkoutOpen: carAcceptsTicketSales(car),
  };
}

function settingsShape(doc) {
  return {
    ...paymentBankShape(doc),
    announcementBanners: allBanners(doc),
  };
}

// GET /api/admin/settings — payment QR / scanner configuration.
router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const settings = await SiteSettings.load();
    res.json({ success: true, data: settingsShape(settings) });
  })
);

// PUT /api/admin/settings — replace payment QR / scanner configuration.
router.put(
  '/settings',
  settingsValidation.update,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const settings = await SiteSettings.load();
    settings.bankName = req.body.bankName.trim();
    settings.accountHolderName = req.body.accountHolderName.trim();
    settings.accountNumber = req.body.accountNumber.trim();
    settings.branchCode = req.body.branchCode.trim();
    settings.accountType = (req.body.accountType || '').trim();
    settings.paymentInstructions = (req.body.paymentInstructions || '').trim();
    await settings.save();
    res.json({ success: true, data: settingsShape(settings) });
  })
);

// PUT /api/admin/settings/announcements — winner-announcement carousel slides.
router.put(
  '/settings/announcements',
  settingsValidation.updateAnnouncements,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const settings = await SiteSettings.load();
    const items = Array.isArray(req.body.announcementBanners)
      ? req.body.announcementBanners
      : [];
    settings.announcementBanners = items.map(normalizeBannerInput);
    await settings.save();
    res.json({
      success: true,
      data: { announcementBanners: allBanners(settings) },
    });
  })
);

// POST /api/admin/bookings/mark-paid — record UPI settlement for a pending checkout (mock / manual).
router.post(
  '/bookings/mark-paid',
  asyncHandler(async (req, res) => {
    const providerRef = (req.body?.providerRef || '').trim();
    if (!providerRef) throw new BadRequestError('providerRef is required');

    const booking = await Booking.findOne({ providerRef, paymentStatus: 'pending' });
    if (!booking) {
      throw new NotFoundError('No pending booking found for this transaction reference');
    }

    booking.paymentStatus = 'paid';
    booking.paidAt = new Date();
    await booking.save();

    res.json({
      success: true,
      data: {
        providerRef,
        paymentStatus: booking.paymentStatus,
        message:
          'Payment marked as received. The customer can tap "I have paid" again to receive tokens.',
      },
    });
  })
);

// GET /api/admin/customers — all registered customers with purchase summary.
router.get(
  '/customers',
  asyncHandler(async (_req, res) => {
    const customers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .select('name email phone rewardPoints lastLoginAt createdAt')
      .lean();

    const userIds = customers.map((c) => c._id);

    const [ticketStats, bookingStats] = await Promise.all([
      Ticket.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: '$user', ticketCount: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { user: { $in: userIds }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$user',
            bookingCount: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const ticketsByUser = Object.fromEntries(
      ticketStats.map((r) => [r._id.toString(), r.ticketCount])
    );
    const bookingsByUser = Object.fromEntries(
      bookingStats.map((r) => [
        r._id.toString(),
        { bookingCount: r.bookingCount, totalSpent: r.totalSpent },
      ])
    );

    res.json({
      success: true,
      data: customers.map((c) => {
        const id = c._id.toString();
        const bookings = bookingsByUser[id];
        return {
          id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          rewardPoints: c.rewardPoints ?? 0,
          lastLoginAt: c.lastLoginAt,
          registeredAt: c.createdAt,
          ticketCount: ticketsByUser[id] ?? 0,
          bookingCount: bookings?.bookingCount ?? 0,
          totalSpent: bookings?.totalSpent ?? 0,
        };
      }),
    });
  })
);

// GET /api/admin/overview — KPI tiles + recent bookings (still a stub for now).
router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    res.status(501).json({
      success: false,
      error: 'Not implemented',
      contract: {
        success: true,
        data: {
          kpis: { totalRevenueZAR: 0, ticketsSold: 0, activeDraws: 0, totalUsers: 0 },
          drawStatus: [],
          recentBookings: [],
        },
      },
    });
  })
);

// GET /api/admin/cars — full inventory list (drafts + every status).
router.get(
  '/cars',
  pagination,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Car.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Car.countDocuments({}),
    ]);

    const mintedMap = await mintedCountsByCar(items.map((c) => c._id));

    res.json({
      success: true,
      data: items.map((c) => carShape(c, mintedMap)),
      meta: { page, limit, total },
    });
  })
);

// GET /api/admin/cars/:id — single car (drafts included).
router.get(
  '/cars/:id',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);
    if (!car) throw new NotFoundError('Car not found');
    const mintedMap = await mintedCountsByCar([car._id]);
    res.json({ success: true, data: carShape(car, mintedMap) });
  })
);

// POST /api/admin/cars — create.
router.post(
  '/cars',
  carValidation.create,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const payload = pickEditable(req.body);
    if (payload.ticketsSold == null) payload.ticketsSold = 0;
    if (payload.ticketSalesOpen == null) {
      payload.ticketSalesOpen = ['active', 'closing_soon'].includes(payload.status);
    }
    if (payload.totalTickets != null && payload.ticketsSold > payload.totalTickets) {
      throw new BadRequestError('ticketsSold cannot exceed totalTickets');
    }
    payload.createdBy = req.user.id;

    const car = await Car.create(payload);
    const mintedMap = await mintedCountsByCar([car._id]);
    res.status(201).json({ success: true, data: carShape(car, mintedMap) });
  })
);

// PUT /api/admin/cars/:id — partial update.
router.put(
  '/cars/:id',
  mongoId('id'),
  carValidation.update,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const existing = await Car.findById(req.params.id);
    if (!existing) throw new NotFoundError('Car not found');

    const payload = pickEditable(req.body);

    // Inventory sanity: if the admin tries to lower totalTickets below the
    // count of tickets that have already been minted, reject with a clear
    // error rather than corrupting the schema.
    const mintedCount = await Ticket.countDocuments({ car: existing._id });
    const nextTotal = payload.totalTickets ?? existing.totalTickets;
    const nextSold = payload.ticketsSold ?? existing.ticketsSold;

    if (nextSold < mintedCount) {
      throw new BadRequestError(
        `ticketsSold cannot be below ${mintedCount} — that many ticket${
          mintedCount === 1 ? ' has' : 's have'
        } already been minted in checkout.`
      );
    }
    if (nextTotal < mintedCount) {
      throw new BadRequestError(
        `Cannot set totalTickets to ${nextTotal} \u2014 ${mintedCount} ticket${
          mintedCount === 1 ? ' has' : 's have'
        } already been issued.`
      );
    }
    if (nextSold > nextTotal) {
      throw new BadRequestError('ticketsSold cannot exceed totalTickets');
    }

    Object.assign(existing, payload);
    await existing.save();

    const mintedMap = await mintedCountsByCar([existing._id]);
    res.json({ success: true, data: carShape(existing, mintedMap) });
  })
);

// ============================================================================
// Draws
// ============================================================================

// PUT /api/admin/draws/:id — update draw / announce winner.
router.put(
  '/draws/:id',
  mongoId('id'),
  drawValidation.update,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const draw = await Draw.findById(req.params.id).populate('winningTicket', 'code');
    if (!draw) throw new NotFoundError('Draw not found');

    if (req.body.notes !== undefined) draw.notes = req.body.notes;
    if (req.body.drawnAt !== undefined) {
      draw.drawnAt = req.body.drawnAt ? new Date(req.body.drawnAt) : null;
    }
    if (req.body.winnerDisplayName !== undefined) {
      const name = (req.body.winnerDisplayName || '').trim();
      draw.winnerDisplayName = name || null;
    }

    if (req.body.winningTicketCode !== undefined) {
      const raw = (req.body.winningTicketCode || '').trim();
      if (!raw) {
        await Ticket.updateMany({ car: draw.car }, { isWinner: false });
        draw.winningTicket = null;
        draw.winner = null;
        draw.publicTicketCode = null;
      } else {
        const code = raw.toUpperCase();
        const ticket = await Ticket.findOne({ car: draw.car, code });
        await Ticket.updateMany({ car: draw.car }, { isWinner: false });
        if (ticket) {
          ticket.isWinner = true;
          await ticket.save();
          draw.winningTicket = ticket._id;
          draw.winner = ticket.user;
          draw.publicTicketCode = null;
        } else {
          draw.winningTicket = null;
          draw.winner = null;
          draw.publicTicketCode = code;
        }
      }
    }

    if (req.body.status !== undefined) {
      draw.status = req.body.status;
    }

    const { hasWinnerDetails } = require('../utils/drawWinner');
    if (hasWinnerDetails(draw) && draw.status === 'scheduled') {
      draw.status = 'announced';
    }

    if (
      ['announced', 'completed', 'delivered'].includes(draw.status) &&
      !draw.drawnAt
    ) {
      draw.drawnAt = draw.drawnAt || new Date();
    }

    const hasWinner =
      draw.winningTicket ||
      (draw.publicTicketCode && draw.publicTicketCode.length > 0);
    if (
      hasWinner &&
      ['announced', 'completed', 'delivered'].includes(draw.status) &&
      draw.car
    ) {
      await Car.findByIdAndUpdate(draw.car, { status: 'draw_complete' });
    }

    await draw.save();
    await draw.populate([
      { path: 'car' },
      { path: 'winner', select: 'name email' },
      { path: 'winningTicket', select: 'code' },
    ]);

    const { winnerTicketCode, winnerName, isAnnouncedDraw } = require('../utils/drawWinner');
    const totalTickets = await Ticket.countDocuments({ car: draw.car?._id });

    res.json({
      success: true,
      data: {
        id: draw._id.toString(),
        status: draw.status,
        notes: draw.notes,
        drawnAt: draw.drawnAt,
        winnerDisplayName: draw.winnerDisplayName || '',
        winningTicketCode: winnerTicketCode(draw) || '',
        winner: isAnnouncedDraw(draw)
          ? { name: winnerName(draw), ticketCode: winnerTicketCode(draw) }
          : null,
        totalTicketsEntered: totalTickets,
        car: draw.car
          ? {
              id: draw.car._id.toString(),
              name: draw.car.name,
              image: draw.car.images?.[0],
              prizeValue: draw.car.prizeValue,
            }
          : null,
      },
    });
  })
);

// DELETE /api/admin/draws/:id — remove the draw record. If it had a winning
// ticket, un-flag that ticket so the winner badge disappears from history.
router.delete(
  '/draws/:id',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const draw = await Draw.findById(req.params.id);
    if (!draw) throw new NotFoundError('Draw not found');

    if (draw.winningTicket) {
      await Ticket.findByIdAndUpdate(draw.winningTicket, { isWinner: false });
    }
    await draw.deleteOne();

    res.json({ success: true, data: { id: req.params.id } });
  })
);

// ============================================================================
// Cars (existing)
// ============================================================================

// DELETE /api/admin/cars/:id — hard-delete (only if zero tickets minted).
router.delete(
  '/cars/:id',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);
    if (!car) throw new NotFoundError('Car not found');

    const minted = await Ticket.countDocuments({ car: car._id });
    if (minted > 0) {
      throw new BadRequestError(
        'Cannot delete a car with issued tickets. Mark it as draw_complete instead.'
      );
    }
    await car.deleteOne();
    res.json({ success: true, data: { id: req.params.id } });
  })
);

module.exports = router;
