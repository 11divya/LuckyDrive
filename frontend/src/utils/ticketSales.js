/** Whether the public checkout rail should allow purchases. */
export function isTicketSalesOpen(car) {
  if (!car) return false;
  return Boolean(car.ticketSalesOpen);
}

export const TICKET_SALES_CLOSED_MESSAGE =
  'Ticket sales are closed for this draw. Check back later or browse our other vehicles.';
