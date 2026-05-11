import ApiService from '../../../services/api';
import { demoCars } from '../../../data/demoCars';

// Until POST /api/cars works, fall back to demoCars so the UI is alive.
export const fetchHomeData = async () => {
  try {
    const data = await ApiService.getCars({ limit: 6 });
    if (Array.isArray(data) && data.length) return data;
  } catch {
    // 501 / network — fall through to demo.
  }
  return demoCars.filter((c) => c.status !== 'draw_complete');
};

export const HOW_IT_WORKS = [
  { n: '01', t: 'Pick a Car', d: 'Browse our curated collection of dream cars and choose the draw you want to enter.' },
  { n: '02', t: 'Buy a Ticket', d: 'Purchase one or more tickets at a fraction of the prize value. The more you buy, the better your odds.' },
  { n: '03', t: 'Wait for the Draw', d: 'Each draw is conducted under independent supervision on the published date.' },
  { n: '04', t: 'Drive Away Lucky', d: 'Winners are announced on-platform and our team contacts you directly to arrange delivery.' },
];
