/**
 * Public settings routes — unauthenticated endpoints that expose non-sensitive
 * configuration the frontend needs (e.g. payment/QR details).
 */
const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const SiteSettings = require('../models/SiteSettings');
const { activeBanners } = require('../utils/announcementBanners');

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
      data: {
        bankName: settings.bankName || 'First National Bank',
        accountHolderName: settings.accountHolderName || 'LuckyDrive (Pty) Ltd',
        accountNumber: settings.accountNumber || '62845678901',
        branchCode: settings.branchCode || '250655',
        accountType: settings.accountType || 'Cheque',
        bankReferenceNote:
          settings.bankReferenceNote ||
          'Use the transaction reference shown at checkout as your payment reference.',
      },
    });
  })
);

module.exports = router;
