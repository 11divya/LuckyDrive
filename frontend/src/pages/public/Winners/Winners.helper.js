import ApiService from '../../../services/api';

export const fetchDraws = async () => {
  try {
    const data = await ApiService.getDraws();
    if (data && (data.announced || data.scheduled)) return data;
  } catch {
    // fall through to empty state
  }
  return { announced: [], scheduled: [] };
};

export const fetchDrawTokens = async (drawId) => {
  try {
    return await ApiService.getDrawTokens(drawId);
  } catch {
    return null;
  }
};

export const formatDrawDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const daysUntil = (d) => {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
};
