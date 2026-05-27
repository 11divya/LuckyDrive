const PURCHASABLE_STATUSES = ['active', 'closing_soon'];

function carAcceptsTicketSales(car) {
  if (!car) return false;
  if (!car.ticketSalesOpen) return false;
  if (!PURCHASABLE_STATUSES.includes(car.status)) return false;
  const sold = car.ticketsSold ?? 0;
  const cap = car.totalTickets ?? 0;
  if (cap > 0 && sold >= cap) return false;
  return true;
}

module.exports = {
  PURCHASABLE_STATUSES,
  carAcceptsTicketSales,
};
