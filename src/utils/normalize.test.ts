import { describe, expect, it } from 'vitest';
import { normalizeDate, normalizeDomain, normalizeService, normalizeSnapshot, safeHomepage } from './normalize';

describe('external data normalization', () => {
  it('provides honest fallbacks for an incomplete record and preserves zero DR', () => {
    expect(normalizeService({ domain: 'WWW.Example.AI.', dr: 0 })).toEqual({ domain: 'example.ai', url: 'https://example.ai/', title: 'example.ai', summary: 'Опис відсутній', categories: [], dr: 0, wentLive: null });
    expect(normalizeService({ domain: 'example.ai' })?.dr).toBeNull();
  });
  it('validates numeric DR and category strings without trusting TypeScript casts', () => {
    const record = normalizeService({ domain: 'example.ai', dr: '30', title: ' Tool ', ai_categories: ['Code & Dev Tools', null, 1, '', 'Code & Dev Tools'] });
    expect(record?.dr).toBe(30);
    expect(record?.title).toBe('Tool');
    expect(record?.categories).toEqual(['Code & Dev Tools']);
    expect(normalizeService({ domain: 'example.ai', dr: -3 })?.dr).toBeNull();
    expect(normalizeService({ domain: 'example.ai', dr: '' })?.dr).toBeNull();
  });
  it.each(['not-a-date', '2026-02-31', '2026-13-01', '', null])('rejects invalid date %s', (value) => expect(normalizeDate(value)).toBeNull());
  it('keeps valid dates and hides a missing date', () => {
    expect(normalizeDate('2024-02-29')).toBe('2024-02-29');
    expect(normalizeDate('2026-10-02T12:00:00Z')).toBe('2026-10-02');
    expect(normalizeService({ domain: 'example.ai', went_live: '2026-02-31' })?.wentLive).toBeNull();
  });
  it.each(['javascript:alert(1)', 'data:text/html,hi', 'ftp://example.ai', 'https://evil.ai/path', 'https://user:pass@example.ai', 'https://example.ai:8000'])('rejects unsafe or mismatched URL %s', (url) => {
    expect(safeHomepage(url, 'example.ai')).toBeNull();
  });
  it('reduces a valid URL to its homepage and only reconstructs missing URLs', () => {
    expect(safeHomepage('https://www.example.ai/path?q=a#b', 'example.ai')).toBe('https://www.example.ai/');
    expect(safeHomepage(undefined, 'example.ai')).toBe('https://example.ai/');
    expect(normalizeSnapshot({ domain: 'example.ai', url: null })?.url).toBeNull();
  });
  it.each(['localhost', 'evil.ai/path', 'user@evil.ai', '-bad.ai', '127.0.0.1', '', null])('rejects invalid domain %s', (value) => expect(normalizeDomain(value)).toBeNull());
  it('ignores entries without a valid identity', () => {
    expect(normalizeService({ title: 'Broken' })).toBeNull();
    expect(normalizeService(null)).toBeNull();
  });
});
