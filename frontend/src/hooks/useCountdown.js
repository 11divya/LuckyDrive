import { useEffect, useState } from 'react';

function compute(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired: ms === 0, ms };
}

export default function useCountdown(targetDate) {
  const [time, setTime] = useState(() => compute(targetDate));

  useEffect(() => {
    setTime(compute(targetDate));
    const id = setInterval(() => setTime(compute(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
