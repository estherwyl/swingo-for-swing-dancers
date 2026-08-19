function normalizeReferenceUrl(value) {
  const raw = value.trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function referenceDisplayName(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return 'Open link';
  }
}


export { normalizeReferenceUrl, referenceDisplayName };
