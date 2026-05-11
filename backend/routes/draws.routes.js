const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { mongoId, handleValidationErrors } = require('../middleware/validation.middleware');
const { NotFoundError } = require('../utils/errors');

const Draw = require('../models/Draw');
const Ticket = require('../models/Ticket');
const Car = require('../models/Car');

// Privacy-friendly winner display: "Alex Mokoena" → "Alex M."
function maskName(fullName) {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function carPayload(car) {
  if (!car) return null;
  return {
    id: car._id.toString(),
    name: car.name,
    image: car.images?.[0] || null,
    prizeValue: car.prizeValue,
    drawDate: car.drawDate,
    status: car.status,
    ticketsSold: car.ticketsSold,
    totalTickets: car.totalTickets,
  };
}

// ----------------------------------------------------------------------------
// GET /api/draws — public list, grouped into `announced` (drawn) and
// `scheduled` (upcoming). Each entry carries enough data for the Winners page
// to render a card without a second roundtrip.
// ----------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const draws = await Draw.find({})
      .sort({ drawnAt: -1, createdAt: -1 })
      .populate('car')
      .populate('winner', 'name email')
      .populate('winningTicket', 'code');

    const announced = [];
    const scheduled = [];

    for (const d of draws) {
      const base = {
        id: d._id.toString(),
        car: carPayload(d.car),
        status: d.status,
      };

      if (
        (d.status === 'announced' || d.status === 'completed' || d.status === 'delivered') &&
        d.winningTicket
      ) {
        const totalTickets = await Ticket.countDocuments({ car: d.car?._id });
        announced.push({
          ...base,
          drawnAt: d.drawnAt,
          totalTicketsEntered: totalTickets,
          winner: {
            name: maskName(d.winner?.name),
            ticketCode: d.winningTicket.code,
          },
        });
      } else {
        scheduled.push({
          ...base,
          drawDate: d.car?.drawDate,
        });
      }
    }

    // Scheduled list — soonest first.
    scheduled.sort(
      (a, b) => new Date(a.drawDate || 0) - new Date(b.drawDate || 0)
    );

    res.json({
      success: true,
      data: { announced, scheduled },
    });
  })
);

// ----------------------------------------------------------------------------
// GET /api/draws/:id/tokens — every token that entered a specific draw, with
// the winning one flagged. Used by the Winners page to show the full token
// list "during the winner announcement".
// ----------------------------------------------------------------------------
router.get(
  '/:id/tokens',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const draw = await Draw.findById(req.params.id)
      .populate('car', 'name images prizeValue drawDate')
      .populate('winner', 'name')
      .populate('winningTicket', 'code');

    if (!draw) throw new NotFoundError('Draw not found');

    const tickets = await Ticket.find({ car: draw.car?._id })
      .select('code isWinner')
      .sort({ purchasedAt: 1 });

    res.json({
      success: true,
      data: {
        id: draw._id.toString(),
        status: draw.status,
        drawnAt: draw.drawnAt,
        car: carPayload(draw.car),
        winner: draw.winningTicket
          ? {
              name: maskName(draw.winner?.name),
              ticketCode: draw.winningTicket.code,
            }
          : null,
        tickets: tickets.map((t) => ({
          code: t.code,
          isWinner: !!t.isWinner,
        })),
      },
    });
  })
);

// ----------------------------------------------------------------------------
// POST /api/draws/:id/run — admin-only manual draw trigger (kept as a 501
// stub for now; runs are handled at seed time today).
// ----------------------------------------------------------------------------
router.post(
  '/:id/run',
  authenticate,
  authorize('admin'),
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (_req, res) => {
    res.status(501).json({
      success: false,
      error: 'Not implemented',
      contract: {
        success: true,
        data: {
          draw: {
            id: 'string',
            status: 'announced',
            winningTicket: 'ticketId',
            winner: 'userId',
            drawnAt: 'ISO-8601',
          },
        },
      },
    });
  })
);

module.exports = router;
