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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Draw', drawSchema);
