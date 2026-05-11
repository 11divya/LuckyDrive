import ApiService from '../../../services/api';
import { demoCars } from '../../../data/demoCars';

const LIVE_STATUSES = new Set(['active', 'closing_soon']);
const HRS_72_MS = 72 * 60 * 60 * 1000;
const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;

export const TAB_ITEMS = [
  { key: 'all',     label: 'All Live' },
  { key: 'closing', label: 'Closing Soon' },
  { key: 'new',     label: 'Just Launched' },
];

export const SORT_OPTIONS = [
  { value: 'closing',  label: 'Closing soonest', cmp: (a, b) => +new Date(a.drawDate) - +new Date(b.drawDate) },
  { value: 'prize',    label: 'Highest prize',   cmp: (a, b) => b.prizeValue - a.prizeValue },
  { value: 'cheapest', label: 'Lowest ticket',   cmp: (a, b) => a.ticketPrice - b.ticketPrice },
  { value: 'newest',   label: 'Newest',          cmp: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) },
];

const isLive = (c) => LIVE_STATUSES.has(c.status);

export const fetchLiveDraws = async () => {
  try {
    const data = await ApiService.getCars({ limit: 50 });
    if (Array.isArray(data) && data.length) {
      const live = data.filter(isLive);
      if (live.length) return live;
    }
  } catch {
    // 501 / network — fall through to demo.
  }
  return demoCars.filter(isLive);
};

export const filterByTab = (rows, tab) => {
  if (!Array.isArray(rows)) return [];
  const now = Date.now();
  if (tab === 'closing') {
    return rows.filter(
      (c) => c.status === 'closing_soon' || +new Date(c.drawDate) - now <= HRS_72_MS
    );
  }
  if (tab === 'new') {
    return rows.filter((c) => c.createdAt && now - +new Date(c.createdAt) <= DAYS_7_MS);
  }
  return rows;
};

export const pickFeatured = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return [...rows].sort((a, b) => +new Date(a.drawDate) - +new Date(b.drawDate))[0];
};

export const computeStats = (rows) => {
  const activeDraws = rows.length;
  const totalPrize = rows.reduce((sum, r) => sum + (Number(r.prizeValue) || 0), 0);
  const avgTicketPrice = activeDraws
    ? Math.round(rows.reduce((sum, r) => sum + (Number(r.ticketPrice) || 0), 0) / activeDraws / 10) * 10
    : 0;
  return { activeDraws, totalPrize, avgTicketPrice };
};

export const sortRows = (rows, sortKey) => {
  const opt = SORT_OPTIONS.find((o) => o.value === sortKey) || SORT_OPTIONS[0];
  return [...rows].sort(opt.cmp);
};
