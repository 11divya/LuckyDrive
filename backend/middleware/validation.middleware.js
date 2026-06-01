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
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Contact number is required')
      .matches(/^\+?[\d\s()-]{9,20}$/)
      .withMessage('Enter a valid contact number'),
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
    body('ticketSalesOpen').optional().isBoolean(),
    body('ticketsSold').optional().isInt({ min: 0 }),
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
    body('ticketSalesOpen').optional().isBoolean(),
    body('ticketsSold').optional().isInt({ min: 0 }),
  ],
};

const ticketValidation = {
  purchase: [
    body('carId').isMongoId(),
    body('quantity').isInt({ min: 1, max: 100 }),
  ],
  checkout: [
    body('carId').isMongoId(),
    body('quantity').isInt({ min: 1, max: 100 }),
    body('providerRef')
      .trim()
      .notEmpty()
      .isLength({ min: 8, max: 64 })
      .withMessage('providerRef is required'),
  ],
  confirmPurchase: [
    body('providerRef')
      .trim()
      .notEmpty()
      .isLength({ min: 8, max: 64 })
      .withMessage('providerRef is required'),
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
    body('drawnAt').optional({ nullable: true }).isISO8601().toDate(),
    body('winnerDisplayName').optional({ nullable: true }).trim().isString(),
    body('winningTicketCode').optional({ nullable: true }).trim().isString(),
  ],
};

const settingsValidation = {
  update: [
    body('bankName').trim().notEmpty().withMessage('Bank name is required'),
    body('accountHolderName').trim().notEmpty().withMessage('Account holder name is required'),
    body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
    body('branchCode').trim().notEmpty().withMessage('Branch code / IFSC is required'),
    body('accountType').optional({ nullable: true }).trim().isString(),
    body('paymentInstructions').optional({ nullable: true }).trim().isString(),
  ],
  updateAnnouncements: [
    body('announcementBanners').isArray().withMessage('announcementBanners must be an array'),
    body('announcementBanners.*.headline')
      .trim()
      .notEmpty()
      .withMessage('Each slide needs a headline'),
    body('announcementBanners.*.message').optional({ nullable: true }).trim().isString(),
    body('announcementBanners.*.vehicleName').optional({ nullable: true }).trim().isString(),
    body('announcementBanners.*.announcementDate')
      .notEmpty()
      .isISO8601()
      .toDate()
      .withMessage('Each slide needs a valid announcement date'),
    body('announcementBanners.*.active').optional().isBoolean(),
    body('announcementBanners.*.sortOrder').optional().isInt({ min: 0 }),
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
  settingsValidation,
};
