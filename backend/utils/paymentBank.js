function paymentBankShape(doc) {
  return {
    bankName: doc.bankName || 'First National Bank',
    accountHolderName: doc.accountHolderName || 'LuckyDrive Pty Ltd',
    accountNumber: doc.accountNumber || '62845678901',
    branchCode: doc.branchCode || '250655',
    accountType: doc.accountType || 'Cheque',
    paymentInstructions:
      doc.paymentInstructions ||
      'Transfer the exact ticket total from your bank app. Use the transaction reference below as your payment reference.',
  };
}

module.exports = { paymentBankShape };
