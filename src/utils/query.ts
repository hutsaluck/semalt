import { CATEGORIES, MAX_PAGES, MAX_RESULTS, PAGE_SIZE } from '../config';
import type { CatalogQuery, MinDR, Sort } from '../types';

export const DEFAULT_QUERY: CatalogQuery = { q: '', category: '', drMin: '', sort: 'dr', page: 1 };

export function normalizePage(value: unknown): number {
  const page = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(page) ? Math.min(MAX_PAGES, Math.max(1, page)) : 1;
}

export function normalizeQuery(query: Partial<CatalogQuery>): CatalogQuery {
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 200) : '';
  const category = CATEGORIES.some((item) => item.value === query.category) ? query.category! : '';
  const drMin = (['10', '30', '50'] as const).includes(query.drMin as '10' | '30' | '50') ? query.drMin! : '';
  const sort = query.sort === 'went_live' || (query.sort === 'relevance' && q) ? query.sort : 'dr';
  return { q, category, drMin, sort, page: normalizePage(query.page ?? 1) };
}

export function parseRouteQuery(params: URLSearchParams): CatalogQuery {
  return normalizeQuery({
    q: params.get('q') ?? '',
    category: params.get('ai_categories') ?? '',
    drMin: (params.get('dr_min') ?? '') as MinDR,
    sort: (params.get('sort') ?? 'dr') as Sort,
    page: normalizePage(params.get('page') ?? 1),
  });
}

export function buildRouteQuery(input: CatalogQuery): URLSearchParams {
  const query = normalizeQuery(input);
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('ai_categories', query.category);
  if (query.drMin) params.set('dr_min', query.drMin);
  if (query.sort !== 'dr') params.set('sort', query.sort);
  if (query.page !== 1) params.set('page', String(query.page));
  return params;
}

export function pageOffset(page: number): number {
  return (normalizePage(page) - 1) * PAGE_SIZE;
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(Math.min(Math.max(0, total), MAX_RESULTS) / PAGE_SIZE));
}

export function buildApiQuery(input: CatalogQuery): URLSearchParams {
  const query = normalizeQuery(input);
  const params = new URLSearchParams({
    index: 'sites', ai_startups: '1', sort: query.sort,
    order: 'desc', size: String(PAGE_SIZE), from: String(pageOffset(query.page)),
  });
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('ai_categories', query.category);
  if (query.drMin) params.set('dr_min', query.drMin);
  return params;
}
