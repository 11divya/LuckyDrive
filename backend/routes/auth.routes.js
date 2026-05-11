const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const { authValidation, handleValidationErrors } = require('../middleware/validation.middleware');
const { authenticate, generateToken } = require('../middleware/auth.middleware');
const { UnauthorizedError, NotFoundError } = require('../utils/errors');
const User = require('../models/User');

// POST /api/auth/signup
router.post(
  '/signup',
  authValidation.signup,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Mongoose unique index on `email` will throw 11000 → mapped to 409 by errorHandler.
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      data: { user: user.toJSON(), token },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  authValidation.login,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // password has `select: false` — pull it explicitly for compare.
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const ok = await user.comparePassword(password);
    if (!ok) throw new UnauthorizedError('Invalid email or password');

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user);
    res.json({
      success: true,
      data: { user: user.toJSON(), token },
    });
  })
);

// GET /api/auth/me — full user document, not just the JWT payload.
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    res.json({ success: true, data: { user } });
  })
);

// POST /api/auth/logout — JWTs are stateless; client clears localStorage.
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: { message: 'Logged out' } });
  })
);

module.exports = router;
