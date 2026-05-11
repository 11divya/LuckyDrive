// PaymentsAdapter — single interface so providers stay swappable.
// Choose the implementation via PAYMENTS_PROVIDER env var.
//
//   PAYMENTS_PROVIDER=mock     (default — always returns paid)
//   PAYMENTS_PROVIDER=payfast  (future)
//   PAYMENTS_PROVIDER=yoco     (future)
//   PAYMENTS_PROVIDER=stripe   (future)

const MockProvider = require('./mock.provider');

const providers = {
  mock: MockProvider,
};

function resolveProvider() {
  const key = (process.env.PAYMENTS_PROVIDER || 'mock').toLowerCase();
  const provider = providers[key];
  if (!provider) {
    throw new Error(
      `[payments] Unknown PAYMENTS_PROVIDER="${key}". Available: ${Object.keys(providers).join(', ')}`
    );
  }
  return provider;
}

const PaymentsAdapter = {
  /**
   * Create a checkout / payment intent for a booking.
   * @param {{ booking: object, returnUrl: string, cancelUrl: string }} params
   * @returns {Promise<{ redirectUrl: string, providerRef: string }>}
   */
  createCheckout(params) {
    return resolveProvider().createCheckout(params);
  },

  /**
   * Confirm payment status for a provider reference.
   * @param {string} providerRef
   * @returns {Promise<{ status: 'paid' | 'failed' | 'pending', amount?: number }>}
   */
  confirmPayment(providerRef) {
    return resolveProvider().confirmPayment(providerRef);
  },

  /**
   * Verify a webhook signature and decode the event payload.
   * @param {import('express').Request} req — must use express.raw() body parser
   * @returns {Promise<{ event: string, data: object }>}
   */
  verifyWebhook(req) {
    return resolveProvider().verifyWebhook(req);
  },
};

module.exports = PaymentsAdapter;
