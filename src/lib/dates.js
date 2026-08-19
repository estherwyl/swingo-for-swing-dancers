const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function pad(value) {
  return String(value).padStart(2, '0');
}

export function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function timeStr(now = new Date()) {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function dateParts(dateStr, fallback) {
  const [year, month, day] = (dateStr || fallback).split('-').map(Number);
  return { year, month: month || 1, day: day || 1 };
}

export function fmt(dateStr) {
  const { year, month, day } = dateParts(dateStr, '2026-01-01');
  const date = new Date(year, month - 1, day);
  const monthName = MONTHS[month - 1];
  return {
    md: `${monthName} ${day}`,
    medium: `${monthName} ${day}, ${year}`,
    full: `${WEEKDAYS[date.getDay()]} ${monthName} ${day}, ${year}`,
  };
}

export function daysSince(dateStr, now = new Date()) {
  const { year, month, day } = dateParts(dateStr, todayStr(now));
  const then = new Date(year, month - 1, day);
  return Math.max(0, Math.floor((now - then) / 86400000));
}

export function sortKey(entry) {
  return `${entry.date}T${entry.time || '00:00'}`;
}

export function byRecencyDesc(a, b) {
  return sortKey(b).localeCompare(sortKey(a));
}

export function sortByRecency(entries) {
  return entries.toSorted(byRecencyDesc);
}
