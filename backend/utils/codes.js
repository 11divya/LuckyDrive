const crypto = require('crypto');

// 6 hex chars uppercase → ~16M possibilities. Format: LD-A4F8B2
function generateTicketCode() {
  return `LD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// Generate a batch of `n` unique codes (locally unique within the batch — DB
// uniqueness is enforced by the model's unique index, with retry on collision).
function generateTicketCodeBatch(n) {
  const codes = new Set();
  while (codes.size < n) codes.add(generateTicketCode());
  return [...codes];
}

module.exports = { generateTicketCode, generateTicketCodeBatch };
