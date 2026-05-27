/** Build a UPI deep-link URI encoded in the payment QR. */
export function buildUpiUri({ vpa, name, amount, note, currency = 'INR' }) {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name,
    am: Number(amount).toFixed(2),
    cu: currency,
    tn: note || 'LuckyDrive',
  });
  return `upi://pay?${params.toString()}`;
}

export const PAYMENT_QR_DEFAULTS = {
  upiVpa: 'luckydrive@oksbi',
  upiMerchantName: 'LuckyDrive',
  upiLogoUrl: '/luckydrive-icon.svg',
};
