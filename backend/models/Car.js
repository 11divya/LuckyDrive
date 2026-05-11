const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number, min: 1900, max: 2100 },
    color: { type: String, trim: true },

    description: { type: String },
    images: [{ type: String }],

    engine: { type: String, trim: true },
    mileageKm: { type: Number, default: 0, min: 0 },

    prizeValue: { type: Number, required: true, min: 0 },
    ticketPrice: { type: Number, required: true, min: 0 },
    totalTickets: { type: Number, required: true, min: 1 },
    ticketsSold: { type: Number, default: 0, min: 0 },

    drawDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'closing_soon', 'draw_complete', 'delivered'],
      default: 'draft',
      index: true,
    },

    faq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

carSchema.virtual('salesProgress').get(function () {
  if (!this.totalTickets) return 0;
  return Math.min(100, (this.ticketsSold / this.totalTickets) * 100);
});

carSchema.set('toJSON', { virtuals: true });
carSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Car', carSchema);
