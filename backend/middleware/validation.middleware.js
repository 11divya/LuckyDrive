const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
}

const mongoId = (field = 'id') =>
  param(field).isMongoId().withMessage('Invalid id');

const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const authValidation = {
  signup: [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  login: [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
};

const CAR_STATUSES = ['draft', 'active', 'closing_soon', 'draw_complete', 'delivered'];

const carValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('prizeValue').isFloat({ gt: 0 }).withMessage('Prize value must be greater than 0'),
    body('ticketPrice').isFloat({ gt: 0 }).withMessage('Ticket price must be greater than 0'),
    body('totalTickets').isInt({ gt: 0 }).withMessage('Total tickets must be a positive integer'),
    body('drawDate').isISO8601().withMessage('Draw date is required (ISO-8601)').toDate(),
    body('make').optional({ checkFalsy: true }).trim().isString(),
    body('model').optional({ checkFalsy: true }).trim().isString(),
    body('year').optional({ checkFalsy: true }).isInt({ min: 1900, max: 2100 }),
    body('color').optional({ checkFalsy: true }).trim().isString(),
    body('description').optional({ checkFalsy: true }).isString(),
    body('engine').optional({ checkFalsy: true }).trim().isString(),
    body('mileageKm').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('images').optional().isArray(),
    body('images.*').optional().isString().withMessage('Image must be a URL string'),
    body('faq').optional().isArray(),
    body('faq.*.question').optional().isString().notEmpty(),
    body('faq.*.answer').optional().isString().notEmpty(),
    body('status').optional().isIn(CAR_STATUSES).withMessage(`Status must be one of: ${CAR_STATUSES.join(', ')}`),
  ],
  update: [
    body('name').optional().trim().notEmpty(),
    body('prizeValue').optional().isFloat({ gt: 0 }),
    body('ticketPrice').optional().isFloat({ gt: 0 }),
    body('totalTickets').optional().isInt({ gt: 0 }),
    body('ticketsSold').optional().isInt({ min: 0 }),
    body('drawDate').optional().isISO8601().toDate(),
    body('make').optional({ checkFalsy: true }).trim().isString(),
    body('model').optional({ checkFalsy: true }).trim().isString(),
    body('year').optional({ checkFalsy: true }).isInt({ min: 1900, max: 2100 }),
    body('color').optional({ checkFalsy: true }).trim().isString(),
    body('description').optional({ checkFalsy: true }).isString(),
    body('engine').optional({ checkFalsy: true }).trim().isString(),
    body('mileageKm').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('images').optional().isArray(),
    body('images.*').optional().isString(),
    body('faq').optional().isArray(),
    body('faq.*.question').optional().isString().notEmpty(),
    body('faq.*.answer').optional().isString().notEmpty(),
    body('status').optional().isIn(CAR_STATUSES),
  ],
};

const ticketValidation = {
  purchase: [
    body('carId').isMongoId(),
    body('quantity').isInt({ min: 1, max: 100 }),
  ],
};

const DRAW_STATUSES = ['scheduled', 'completed', 'announced', 'delivered'];

const drawValidation = {
  update: [
    body('status')
      .optional()
      .isIn(DRAW_STATUSES)
      .withMessage(`Status must be one of: ${DRAW_STATUSES.join(', ')}`),
    body('notes').optional({ nullable: true }).isString(),
  ],
};

module.exports = {
  handleValidationErrors,
  mongoId,
  pagination,
  authValidation,
  carValidation,
  ticketValidation,
  drawValidation,
};
