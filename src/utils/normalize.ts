import type { Service } from '../types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown, limit: number): string {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

export function normalizeDomain(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const input = value.trim().toLowerCase().replace(/\.$/, '');
  if (!input || /[\s/:@?#\\]/.test(input)) return null;
  try {
    const domain = new URL(`https://${input}`).hostname.replace(/^www\./, '');
    const labels = domain.split('.');
    if (domain.length > 253 || labels.length < 2 || /^\d+(\.\d+){3}$/.test(domain)) return null;
    return labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) ? domain : null;
  } catch {
    return null;
  }
}

export function safeHomepage(value: unknown, domain: string): string | null {
  if (value === undefined || value === null || value === '') return `https://${domain}/`;
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    if (normalizeDomain(url.hostname) !== domain) return null;
    return `${url.origin}/`;
  } catch {
    return null;
  }
}

export function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)) return null;
  const day = value.slice(0, 10);
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (!Number.isFinite(date.getTime())) return null;
  const calendar = new Date(`${day}T00:00:00Z`);
  return calendar.toISOString().slice(0, 10) === day ? day : null;
}

export function normalizeService(value: unknown): Service | null {
  if (!isRecord(value)) return null;
  const domain = normalizeDomain(value.domain);
  if (!domain) return null;
  const rawDR = typeof value.dr === 'number' || (typeof value.dr === 'string' && value.dr.trim() !== '') ? Number(value.dr) : NaN;
  const categories = Array.isArray(value.ai_categories)
    ? [...new Set(value.ai_categories.map((item) => text(item, 200)).filter(Boolean))].slice(0, 64)
    : [];
  return {
    domain,
    url: safeHomepage(value.url, domain),
    title: text(value.title, 300) || domain,
    summary: text(value.ai_summary, 20_000) || 'Опис відсутній',
    categories,
    dr: Number.isFinite(rawDR) && rawDR >= 0 && rawDR <= 100 ? rawDR : null,
    wentLive: normalizeDate(value.went_live),
  };
}

export function normalizeSnapshot(value: unknown): Service | null {
  if (!isRecord(value)) return null;
  const service = normalizeService({
    ...value, ai_summary: value.summary, ai_categories: value.categories, went_live: value.wentLive,
  });
  // A deliberately disabled unsafe URL must remain disabled when reading a snapshot.
  if (service && value.url === null) service.url = null;
  return service;
}

const dateFormatter = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}
