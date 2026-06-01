/**
 * Public settings routes — unauthenticated endpoints that expose non-sensitive
 * configuration the frontend needs (e.g. payment/QR details).
 */
const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const SiteSettings = require('../models/SiteSettings');
const { activeBanners } = require('../utils/announcementBanners');
const { paymentBankShape } = require('../utils/paymentBank');

// GET /api/settings/announcements — active winner-announcement carousel slides.
router.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    const settings = await SiteSettings.load();
    res.json({
      success: true,
      data: { banners: activeBanners(settings) },
    });
  })
);

// GET /api/settings/payment — bank transfer details for the checkout modal.
router.get(
  '/payment',
  asyncHandler(async (_req, res) => {
    const settings = await SiteSettings.load();
    res.json({
      success: true,
      data: paymentBankShape(settings),
    });
  })
);

module.exports = router;
