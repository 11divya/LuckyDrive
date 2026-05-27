function maskName(fullName) {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function winnerTicketCode(draw) {
  if (draw.winningTicket?.code) return draw.winningTicket.code;
  return draw.publicTicketCode || null;
}

function winnerName(draw) {
  if (draw.winnerDisplayName?.trim()) return draw.winnerDisplayName.trim();
  return maskName(draw.winner?.name);
}

function hasWinnerDetails(draw) {
  const code = winnerTicketCode(draw);
  return Boolean(draw.winnerDisplayName?.trim() && code);
}

function isAnnouncedDraw(draw) {
  if (!hasWinnerDetails(draw)) return false;
  if (['announced', 'completed', 'delivered'].includes(draw.status)) return true;
  // Legacy rows: winner fields saved while status was left on scheduled.
  return draw.status === 'scheduled';
}

module.exports = {
  maskName,
  winnerTicketCode,
  winnerName,
  hasWinnerDetails,
  isAnnouncedDraw,
};
