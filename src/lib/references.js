export const MAX_REFERENCES_PER_MOVE = 3;

export function normalizeReferenceUrl(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function referenceDisplayName(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return 'Open link';
  }
}

/** Reference drafts are stored as an array, with a fallback for legacy single-url check-ins. */
export function referenceDrafts(checkin) {
  return Array.isArray(checkin.referenceUrls) ? checkin.referenceUrls : [checkin.referenceUrl || ''];
}

export function normalizedReferenceUrls(checkin) {
  return [...new Set(referenceDrafts(checkin).map(normalizeReferenceUrl).filter(Boolean))];
}
