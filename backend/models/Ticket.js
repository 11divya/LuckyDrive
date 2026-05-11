const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // e.g. LD-6492
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    isWinner: { type: Boolean, default: false, index: true },
    purchasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ticketSchema.index({ car: 1, user: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
