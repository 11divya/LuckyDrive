// MockProvider — for local dev only. Always succeeds after a short delay.

const crypto = require('crypto');

function fakeRef() {
  return `mock_${crypto.randomBytes(8).toString('hex')}`;
}

const MockProvider = {
  async createCheckout({ booking, returnUrl }) {
    const providerRef = fakeRef();
    const redirectUrl =
      `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}` +
      `mockPay=true&ref=${providerRef}&bookingId=${booking._id || booking.id || ''}`;
    return { redirectUrl, providerRef };
  },

  async confirmPayment(providerRef) {
    return { status: 'paid', providerRef, amount: null };
  },

  async verifyWebhook(req) {
    return { event: 'payment.succeeded', data: req.body || {} };
  },
};

module.exports = MockProvider;
