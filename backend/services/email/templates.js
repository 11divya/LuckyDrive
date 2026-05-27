function formatZAR(n) {
  const v = Number(n) || 0;
  return `R ${v.toLocaleString('en-ZA')}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ticketConfirmationSubject({ car }) {
  return `Your LuckyDrive tickets — ${car.name}`;
}

function ticketRowsText(tickets, unitPrice) {
  return tickets.map((t, i) => {
    const line = `  ${i + 1}. Token: ${t.code}`;
    return unitPrice != null ? `${line}  (${formatZAR(unitPrice)} each)` : line;
  });
}

function ticketConfirmationText({ to, name, car, tickets, booking }) {
  const unitPrice = booking.unitPrice;
  return [
    `Hi ${name || 'there'},`,
    '',
    `Your purchase for "${car.name}" is confirmed.`,
    '',
    '── Your details ──',
    `Email:              ${to}`,
    `Tickets purchased:  ${booking.quantity}`,
    '',
    '── Token numbers ──',
    ...ticketRowsText(tickets, unitPrice),
    '',
    '── Purchase summary ──',
    `Vehicle:      ${car.name}`,
    `Prize value:  ${formatZAR(car.prizeValue)}`,
    `Ticket price: ${formatZAR(unitPrice)}`,
    `Total paid:   ${formatZAR(booking.totalAmount)}`,
    `Draw date:    ${formatDate(car.drawDate)}`,
    `Reference:    ${booking.providerRef}`,
    '',
    `On draw day every entered token number will be published at https://luckydrive.co.za/winners and the winning token will be revealed live.`,
    '',
    `Keep this email for verification on draw day.`,
    '',
    `Drive away lucky,`,
    `The LuckyDrive Team`,
  ].join('\n');
}

function ticketConfirmationHtml({ to, name, car, tickets, booking }) {
  const unitPrice = booking.unitPrice;
  const tokenChips = tickets
    .map(
      (t) =>
        `<span style="display:inline-block;padding:6px 12px;margin:4px;border-radius:6px;background:#1f1e2b;border:1px solid rgba(240,165,0,0.45);font-family:'Courier New',monospace;font-weight:700;color:#f0a500;letter-spacing:0.05em;font-size:14px;">${t.code}</span>`
    )
    .join('');

  const ticketTableRows = tickets
    .map(
      (t, i) => `
          <tr>
            <td style="padding:10px 8px;border-top:1px solid rgba(159,142,121,0.18);color:#d6c4ac;">#${i + 1}</td>
            <td style="padding:10px 8px;border-top:1px solid rgba(159,142,121,0.18);font-family:'Courier New',monospace;font-weight:700;color:#f0a500;">${t.code}</td>
            <td style="padding:10px 8px;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#e3e0f2;">${formatZAR(unitPrice)}</td>
          </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0c0c14;font-family:'Manrope',Arial,sans-serif;color:#e3e0f2;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;padding:24px 16px;background:#1a1a2e;border-radius:16px;">
        <div style="font-family:Georgia,serif;font-weight:700;letter-spacing:0.18em;font-size:28px;">
          <span style="color:#f0a500;">LUCKY</span><span style="color:#ffffff;">DRIVE</span>
        </div>
        <div style="font-size:11px;color:#9f8e79;letter-spacing:0.4em;margin-top:6px;">YOUR LUCKY WHEEL AWAITS</div>
      </div>

      <div style="margin-top:24px;padding:24px;background:#1f1e2b;border:1px solid rgba(159,142,121,0.25);border-radius:16px;">
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:700;color:#e3e0f2;margin:0 0 8px;">
          You're in the draw, ${name || 'driver'}.
        </h1>
        <p style="margin:0 0 20px;color:#d6c4ac;line-height:1.6;">
          Your purchase for <strong style="color:#e3e0f2;">${car.name}</strong> is confirmed.
          Below are your unique token numbers and full ticket details.
        </p>

        <div style="margin:16px 0;padding:14px 16px;background:#12121e;border-radius:12px;">
          <div style="font-size:11px;letter-spacing:0.05em;font-weight:700;color:#d6c4ac;margin-bottom:8px;">CUSTOMER</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#d6c4ac;">
            <tr><td style="padding:4px 0;">Email</td><td style="padding:4px 0;text-align:right;color:#e3e0f2;">${to}</td></tr>
            <tr><td style="padding:4px 0;">Tickets purchased</td><td style="padding:4px 0;text-align:right;color:#e3e0f2;font-weight:700;">${booking.quantity}</td></tr>
          </table>
        </motion.div>

        <div style="margin:20px 0;text-align:center;background:#12121e;padding:18px 12px;border-radius:12px;">
          <div style="font-size:11px;letter-spacing:0.05em;font-weight:700;color:#d6c4ac;margin-bottom:10px;">YOUR TOKEN NUMBERS</div>
          ${tokenChips}
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#d6c4ac;margin-top:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;color:#9f8e79;font-size:11px;">#</th>
              <th style="text-align:left;padding:8px;color:#9f8e79;font-size:11px;">TOKEN</th>
              <th style="text-align:right;padding:8px;color:#9f8e79;font-size:11px;">PRICE</th>
            </tr>
          </thead>
          <tbody>${ticketTableRows}</tbody>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#d6c4ac;margin-top:16px;">
          <tr>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);">Vehicle</td>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#e3e0f2;">${car.name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);">Prize value</td>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#e3e0f2;">${formatZAR(car.prizeValue)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);">Total paid</td>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#e3e0f2;font-weight:700;">${formatZAR(booking.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);">Draw date</td>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#e3e0f2;">${formatDate(car.drawDate)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);">Reference</td>
            <td style="padding:8px 0;border-top:1px solid rgba(159,142,121,0.18);text-align:right;color:#9f8e79;font-family:'Courier New',monospace;">${booking.providerRef}</td>
          </tr>
        </table>

        <p style="color:#d6c4ac;line-height:1.6;margin-top:18px;">
          On draw day, every issued token number will appear on
          <a style="color:#f0a500;text-decoration:none;" href="https://luckydrive.co.za/winners">luckydrive.co.za/winners</a>.
          Keep this email for verification.
        </p>
      </div>

      <p style="text-align:center;margin-top:18px;color:#9f8e79;font-size:12px;">
        © ${new Date().getFullYear()} LuckyDrive (Pty) Ltd.
      </p>
    </div>
  </body>
</html>`;
}

module.exports = {
  ticketConfirmationSubject,
  ticketConfirmationText,
  ticketConfirmationHtml,
};
