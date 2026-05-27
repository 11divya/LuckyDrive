// Console provider — used when SMTP_* env vars are not set. Prints the
// rendered email body to stdout so you can verify the flow without real SMTP.

const {
  ticketConfirmationSubject,
  ticketConfirmationText,
} = require('./templates');

function box(title) {
  const line = '─'.repeat(76);
  return `\n┌${line}┐\n│ ${title.padEnd(74)} │\n├${line}┤`;
}

function endBox() {
  return `└${'─'.repeat(76)}┘\n`;
}

const ConsoleProvider = {
  async sendTicketConfirmation({ to, name, car, tickets, booking }) {
    const subject = ticketConfirmationSubject({ car });
    const body = ticketConfirmationText({ to, name, car, tickets, booking });

    process.stdout.write(box(`[email:console]  ${subject}`));
    process.stdout.write(`\n│ TO:      ${to}`);
    process.stdout.write(`\n│ TICKETS: ${tickets.map((t) => t.code).join(', ')}`);
    process.stdout.write(`\n├${'─'.repeat(76)}┤\n`);
    body.split('\n').forEach((line) => process.stdout.write(`│ ${line}\n`));
    process.stdout.write(endBox());

    return { provider: 'console', accepted: true };
  },
};

module.exports = ConsoleProvider;
