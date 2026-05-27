const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, unique: true, index: true },
    winningTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    drawnAt: { type: Date },
    drawnBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seed: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'announced', 'delivered'],
      default: 'scheduled',
      index: true,
    },
    notes: { type: String },
    /** Shown on Winners page when set (overrides linked user name). */
    winnerDisplayName: { type: String, trim: true },
    /** Winning token code when not linked to a Ticket document. */
    publicTicketCode: { type: String, trim: true, uppercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);
