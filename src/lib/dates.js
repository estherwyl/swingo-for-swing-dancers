function todayStr() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fmt(dateStr) {
  const [year, month, day] = (dateStr || '2026-01-01').split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[(month || 1) - 1];
  return {
    md: `${monthName} ${day}`,
    medium: `${monthName} ${day}, ${year}`,
    full: `${weekdays[date.getDay()]} ${monthName} ${day}, ${year}`,
  };
}

function sortKey(entry) {
  return `${entry.date}T${entry.time || '00:00'}`;
}

function daysSince(dateStr) {
  const [year, month, day] = (dateStr || todayStr()).split('-').map(Number);
  const then = new Date(year, (month || 1) - 1, day || 1);
  const now = new Date();
  return Math.max(0, Math.floor((now - then) / 86400000));
}


export { todayStr, fmt, sortKey, daysSince };
