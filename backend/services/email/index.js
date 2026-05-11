// EmailService — single interface so providers stay swappable.
//
// Provider selection (auto):
//   - SMTP_HOST + SMTP_USER + SMTP_PASS set → SmtpProvider (real email).
//   - Otherwise                              → ConsoleProvider (logs to stdout).

const ConsoleProvider = require('./console.provider');

let providerCache = null;

function resolveProvider() {
  if (providerCache) return providerCache;
  const hasSmtp =
    !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
  if (hasSmtp) {
    try {
      providerCache = require('./smtp.provider');
      console.log('[email] Using SMTP provider →', process.env.SMTP_HOST);
      return providerCache;
    } catch (err) {
      console.warn(
        '[email] SMTP provider failed to load, falling back to console:',
        err.message
      );
    }
  } else {
    console.log('[email] Using console provider (no SMTP_* env vars set).');
  }
  providerCache = ConsoleProvider;
  return providerCache;
}

const EmailService = {
  /**
   * Send a ticket-purchase confirmation with all token numbers.
   * @param {{ to: string, name?: string, car: object, tickets: Array<{code:string}>, booking: object }} payload
   */
  sendTicketConfirmation(payload) {
    return resolveProvider().sendTicketConfirmation(payload);
  },
};

module.exports = EmailService;
