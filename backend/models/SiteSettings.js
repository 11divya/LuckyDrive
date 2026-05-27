const mongoose = require('mongoose');

/**
 * Singleton site-wide settings document. There is always exactly one document
 * in this collection. Use `SiteSettings.load()` to get-or-create it.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    // UPI / Payment QR settings
    upiVpa: {
      type: String,
      default: 'luckydrive@oksbi',
      trim: true,
    },
    upiMerchantName: {
      type: String,
      default: 'LuckyDrive',
      trim: true,
    },
    upiLogoUrl: {
      type: String,
      default: '/luckydrive-icon.svg',
      trim: true,
    },
    // Bank transfer details shown at checkout
    bankName: {
      type: String,
      default: 'First National Bank',
      trim: true,
    },
    accountHolderName: {
      type: String,
      default: 'LuckyDrive (Pty) Ltd',
      trim: true,
    },
    accountNumber: {
      type: String,
      default: '62845678901',
      trim: true,
    },
    branchCode: {
      type: String,
      default: '250655',
      trim: true,
    },
    accountType: {
      type: String,
      default: 'Cheque',
      trim: true,
    },
    bankReferenceNote: {
      type: String,
      default: 'Use the transaction reference shown at checkout as your payment reference.',
      trim: true,
    },
    announcementBanners: {
      type: [
        {
          headline: { type: String, required: true, trim: true, maxlength: 120 },
          message: { type: String, trim: true, maxlength: 280, default: '' },
          vehicleName: { type: String, trim: true, maxlength: 80, default: '' },
          announcementDate: { type: Date, required: true },
          active: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * Get the singleton settings document, creating one with defaults if it
 * doesn't exist yet.
 */
siteSettingsSchema.statics.load = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
