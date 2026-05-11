const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  carValidation,
  drawValidation,
  mongoId,
  pagination,
  handleValidationErrors,
} = require('../middleware/validation.middleware');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const Car = require('../models/Car');
const Ticket = require('../models/Ticket');
const Draw = require('../models/Draw');

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

function carShape(car) {
  return {
    ...car.toJSON(),
    id: car._id.toString(),
  };
}

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

    res.json({
      success: true,
      data: items.map(carShape),
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
    res.json({ success: true, data: carShape(car) });
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
    if (payload.totalTickets != null && payload.ticketsSold > payload.totalTickets) {
      throw new BadRequestError('ticketsSold cannot exceed totalTickets');
    }
    payload.createdBy = req.user.id;

    const car = await Car.create(payload);
    res.status(201).json({ success: true, data: carShape(car) });
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

    res.json({ success: true, data: carShape(existing) });
  })
);

// ============================================================================
// Draws
// ============================================================================

// PUT /api/admin/draws/:id — update status / notes on an existing draw.
router.put(
  '/draws/:id',
  mongoId('id'),
  drawValidation.update,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const draw = await Draw.findById(req.params.id);
    if (!draw) throw new NotFoundError('Draw not found');

    if (req.body.status !== undefined) draw.status = req.body.status;
    if (req.body.notes !== undefined) draw.notes = req.body.notes;
    await draw.save();

    res.json({
      success: true,
      data: {
        id: draw._id.toString(),
        status: draw.status,
        notes: draw.notes,
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
