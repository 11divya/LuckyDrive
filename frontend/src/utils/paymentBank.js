/** Default bank transfer details shown at checkout until admin updates them. */
export const PAYMENT_BANK_DEFAULTS = {
  bankName: 'First National Bank',
  accountHolderName: 'LuckyDrive Pty Ltd',
  accountNumber: '62845678901',
  branchCode: '250655',
  accountType: 'Cheque',
  paymentInstructions:
    'Transfer the exact ticket total from your bank app. Use the transaction reference below as your payment reference.',
};

export function normalizePaymentBank(data) {
  return {
    bankName: data?.bankName?.trim() || PAYMENT_BANK_DEFAULTS.bankName,
    accountHolderName:
      data?.accountHolderName?.trim() || PAYMENT_BANK_DEFAULTS.accountHolderName,
    accountNumber: data?.accountNumber?.trim() || PAYMENT_BANK_DEFAULTS.accountNumber,
    branchCode: data?.branchCode?.trim() || PAYMENT_BANK_DEFAULTS.branchCode,
    accountType: data?.accountType?.trim() || PAYMENT_BANK_DEFAULTS.accountType,
    paymentInstructions:
      data?.paymentInstructions?.trim() || PAYMENT_BANK_DEFAULTS.paymentInstructions,
  };
}
