// MockProvider — simulates UPI settlement. confirmPayment only returns paid when
// the booking has been marked paid (admin or future webhook).

const Booking = require('../../models/Booking');

const MockProvider = {
  async createCheckout({ booking }) {
    const providerRef = booking.providerRef;
    if (!providerRef) {
      throw new Error('MockProvider.createCheckout requires booking.providerRef');
    }
    return {
      redirectUrl: null,
      providerRef,
    };
  },

  async confirmPayment(providerRef) {
    const booking = await Booking.findOne({ providerRef });
    if (!booking) {
      return { status: 'not_found', providerRef };
    }
    if (booking.paymentStatus === 'paid') {
      return { status: 'paid', providerRef, amount: booking.totalAmount };
    }
    if (booking.paymentStatus === 'pending') {
      return { status: 'pending', providerRef };
    }
    return { status: 'failed', providerRef };
  },

  async verifyWebhook(req) {
    const providerRef = req.body?.providerRef || req.body?.ref;
    if (providerRef) {
      await Booking.findOneAndUpdate(
        { providerRef, paymentStatus: 'pending' },
        { paymentStatus: 'paid', paidAt: new Date() }
      );
    }
    return { event: 'payment.succeeded', data: req.body || {} };
  },
};

module.exports = MockProvider;
