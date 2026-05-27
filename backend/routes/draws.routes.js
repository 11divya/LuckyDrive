const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { mongoId, handleValidationErrors } = require('../middleware/validation.middleware');
const { NotFoundError } = require('../utils/errors');

const Draw = require('../models/Draw');
const Ticket = require('../models/Ticket');
const Car = require('../models/Car');
const { carAcceptsTicketSales } = require('../utils/ticketSales');
const {
  winnerName,
  winnerTicketCode,
  isAnnouncedDraw,
} = require('../utils/drawWinner');

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
    ticketSalesOpen: carAcceptsTicketSales(car),
  };
}

function drawWinnerPayload(draw) {
  const code = winnerTicketCode(draw);
  if (!code) return null;
  return {
    name: winnerName(draw),
    ticketCode: code,
  };
}

function announcedDrawPayload(draw, totalTicketsEntered) {
  return {
    id: draw._id.toString(),
    car: carPayload(draw.car),
    status: draw.status,
    drawnAt: draw.drawnAt,
    totalTicketsEntered,
    winner: drawWinnerPayload(draw),
    winnerDisplayName: draw.winnerDisplayName || '',
    winningTicketCode: winnerTicketCode(draw) || '',
  };
}

// GET /api/draws — public list grouped into announced + scheduled.
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
      if (isAnnouncedDraw(d)) {
        const totalTickets = await Ticket.countDocuments({ car: d.car?._id });
        announced.push(announcedDrawPayload(d, totalTickets));
      } else {
        scheduled.push({
          id: d._id.toString(),
          car: carPayload(d.car),
          status: d.status,
          drawDate: d.car?.drawDate,
          drawnAt: d.drawnAt,
          notes: d.notes,
          winnerDisplayName: d.winnerDisplayName || '',
          winningTicketCode: winnerTicketCode(d) || '',
          winner: drawWinnerPayload(d),
        });
      }
    }

    scheduled.sort((a, b) => new Date(a.drawDate || 0) - new Date(b.drawDate || 0));

    res.json({
      success: true,
      data: { announced, scheduled },
    });
  })
);

// GET /api/draws/:id/tokens
router.get(
  '/:id/tokens',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const draw = await Draw.findById(req.params.id)
      .populate('car', 'name images prizeValue drawDate status ticketsSold totalTickets')
      .populate('winner', 'name')
      .populate('winningTicket', 'code');

    if (!draw) throw new NotFoundError('Draw not found');

    const tickets = await Ticket.find({ car: draw.car?._id })
      .select('code isWinner')
      .sort({ purchasedAt: 1 });

    const winCode = winnerTicketCode(draw);

    res.json({
      success: true,
      data: {
        id: draw._id.toString(),
        status: draw.status,
        drawnAt: draw.drawnAt,
        car: carPayload(draw.car),
        winner: drawWinnerPayload(draw),
        winnerDisplayName: draw.winnerDisplayName || '',
        winningTicketCode: winCode || '',
        tickets: tickets.map((t) => ({
          code: t.code,
          isWinner: winCode ? t.code === winCode : !!t.isWinner,
        })),
      },
    });
  })
);

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
    });
  })
);

module.exports = router;
