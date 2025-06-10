import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatPostDate(dateStr: string): string {
  const d = dayjs(dateStr);
  const relative = d.fromNow(true); // e.g., "19 hours"
  return `${relative} · ${d.format('MMM D')}`;
}
