import ApiService from '../../../services/api';
import { demoCars } from '../../../data/demoCars';

export const TAB_ITEMS = [
  { key: 'all',       label: 'All Cars' },
  { key: 'active',    label: 'Active Draws' },
  { key: 'completed', label: 'Completed' },
];

export const fetchInventory = async () => {
  try {
    const data = await ApiService.adminCars({ limit: 50 });
    if (Array.isArray(data) && data.length) return data;
  } catch {
    // 501 / network — fall through to demo.
  }
  return demoCars;
};

export const filterByTab = (rows, tab) => {
  if (tab === 'active')    return rows.filter((r) => r.status === 'active' || r.status === 'closing_soon');
  if (tab === 'completed') return rows.filter((r) => r.status === 'draw_complete' || r.status === 'delivered');
  return rows;
};

export const filterBySearch = (rows, q) => {
  if (!q) return rows;
  const needle = q.toLowerCase();
  return rows.filter(
    (r) =>
      r.name?.toLowerCase().includes(needle) ||
      r.shortId?.toLowerCase().includes(needle) ||
      r.color?.toLowerCase().includes(needle)
  );
};
