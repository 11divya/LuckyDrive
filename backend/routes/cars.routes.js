const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { mongoId, pagination, handleValidationErrors } = require('../middleware/validation.middleware');
const { NotFoundError } = require('../utils/errors');
const Car = require('../models/Car');
const { carAcceptsTicketSales } = require('../utils/ticketSales');

const PUBLIC_STATUSES = ['active', 'closing_soon', 'draw_complete'];

function publicCarShape(car) {
  return {
    ...car.toJSON(),
    id: car._id.toString(),
    ticketSalesOpen: carAcceptsTicketSales(car),
  };
}


// GET /api/cars — public, paginated. Hides drafts and archived cars.
router.get(
  '/',
  pagination,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;

    const filter = { status: { $in: PUBLIC_STATUSES } };

    const [items, total] = await Promise.all([
      Car.find(filter).sort({ drawDate: 1 }).skip(skip).limit(limit),
      Car.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items.map(publicCarShape),
      meta: { page, limit, total },
    });
  })
);

// GET /api/cars/:id
router.get(
  '/:id',
  mongoId('id'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);
    if (!car || !PUBLIC_STATUSES.includes(car.status)) {
      throw new NotFoundError('Car not found');
    }
    res.json({
      success: true,
      data: publicCarShape(car),
    });
  })
);

module.exports = router;
