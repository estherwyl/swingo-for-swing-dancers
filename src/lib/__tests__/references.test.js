import { describe, expect, it } from 'vitest';
import { normalizeReferenceUrl, referenceDisplayName } from '../references.js';

describe('reference helpers', () => {
  it('normalizes valid HTTP URLs and rejects invalid schemes', () => {
    expect(normalizeReferenceUrl(' https://example.com/video ')).toBe('https://example.com/video');
    expect(normalizeReferenceUrl('http://example.com/path?q=1')).toBe('http://example.com/path?q=1');
    expect(normalizeReferenceUrl('')).toBe('');
    expect(normalizeReferenceUrl('   ')).toBe('');
    expect(normalizeReferenceUrl('not a URL')).toBe('');
    expect(normalizeReferenceUrl('javascript:alert(1)')).toBe('');
    expect(normalizeReferenceUrl('ftp://example.com/video')).toBe('');
  });

  it('uses host names for valid links and a fallback for malformed input', () => {
    expect(referenceDisplayName('https://www.youtube.com/watch?v=123')).toBe('youtube.com');
    expect(referenceDisplayName('https://instagram.com/p/abc')).toBe('instagram.com');
    expect(referenceDisplayName('not a URL')).toBe('Open link');
  });
});
