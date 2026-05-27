export const PAYMENT_BANK_DEFAULTS = {
  bankName: 'First National Bank',
  accountHolderName: 'LuckyDrive (Pty) Ltd',
  accountNumber: '62845678901',
  branchCode: '250655',
  accountType: 'Cheque',
  bankReferenceNote: 'Use the transaction reference shown at checkout as your payment reference.',
};

export function mergePaymentBank(data) {
  return {
    bankName: data?.bankName || PAYMENT_BANK_DEFAULTS.bankName,
    accountHolderName: data?.accountHolderName || PAYMENT_BANK_DEFAULTS.accountHolderName,
    accountNumber: data?.accountNumber || PAYMENT_BANK_DEFAULTS.accountNumber,
    branchCode: data?.branchCode || PAYMENT_BANK_DEFAULTS.branchCode,
    accountType: data?.accountType || PAYMENT_BANK_DEFAULTS.accountType,
    bankReferenceNote: data?.bankReferenceNote ?? PAYMENT_BANK_DEFAULTS.bankReferenceNote,
  };
}

export function formatBankDetailsText(bank, { amount, reference } = {}) {
  const lines = [
    `Bank: ${bank.bankName}`,
    `Account holder: ${bank.accountHolderName}`,
    `Account number: ${bank.accountNumber}`,
    `Branch code: ${bank.branchCode}`,
    `Account type: ${bank.accountType}`,
  ];
  if (amount != null) lines.push(`Amount: ${amount}`);
  if (reference) lines.push(`Reference: ${reference}`);
  if (bank.bankReferenceNote) lines.push('', bank.bankReferenceNote);
  return lines.join('\n');
}
