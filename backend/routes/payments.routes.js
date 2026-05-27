/**
 * Payment provider webhooks — mock provider marks a pending booking as paid when
 * providerRef is included in the webhook body (simulates bank settlement).
 */
const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler.middleware');
const PaymentsAdapter = require('../services/payments');

router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    await PaymentsAdapter.verifyWebhook(req);
    res.json({ success: true, data: { received: true } });
  })
);

module.exports = router;
