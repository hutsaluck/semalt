import { describe, expect, it } from 'vitest';
import { MAX_RESULTS, PAGE_SIZE } from '../config';
import { buildApiQuery, buildRouteQuery, DEFAULT_QUERY, normalizePage, normalizeQuery, pageCount, pageOffset, parseRouteQuery } from './query';

describe('FreeSerp query', () => {
  it('always uses the sites index, AI product filter and server pagination', () => {
    const params = buildApiQuery(DEFAULT_QUERY);
    expect(Object.fromEntries(params)).toEqual({ index: 'sites', ai_startups: '1', sort: 'dr', order: 'desc', size: '20', from: '0' });
    expect(params.has('q')).toBe(false);
    expect(params.has('ai_categories')).toBe(false);
    expect(params.has('dr_min')).toBe(false);
    expect(params.has('ai')).toBe(false);
  });
  it('encodes ampersands and sends all nonempty filters', () => {
    const params = buildApiQuery({ ...DEFAULT_QUERY, q: 'code & review', category: 'Code & Dev Tools', drMin: '30', page: 3, sort: 'relevance' });
    expect(params.toString()).toContain('ai_categories=Code+%26+Dev+Tools');
    expect(params.get('q')).toBe('code & review');
    expect(params.get('dr_min')).toBe('30');
    expect(params.get('from')).toBe('40');
    expect(params.get('sort')).toBe('relevance');
  });
  it('normalizes invalid route values and unavailable relevance', () => {
    expect(parseRouteQuery(new URLSearchParams('q=%20&ai_categories=Fake&dr_min=99&sort=relevance&page=oops'))).toEqual(DEFAULT_QUERY);
    expect(normalizeQuery({ ...DEFAULT_QUERY, q: '  assistant  ', sort: 'relevance' }).q).toBe('assistant');
  });
  it('round trips a shared URL with all filters', () => {
    const query = { ...DEFAULT_QUERY, q: 'video editor', category: 'Video Generation', drMin: '50' as const, page: 4, sort: 'went_live' as const };
    expect(parseRouteQuery(buildRouteQuery(query))).toEqual(query);
  });
});

describe('pagination window', () => {
  it.each([0, -1, 1.5, NaN, Infinity, 'abc'])('normalizes invalid page %s to 1', (page) => expect(normalizePage(page)).toBe(1));
  it('calculates offsets and clamps the last API page', () => {
    expect(pageOffset(1)).toBe(0);
    expect(pageOffset(2)).toBe(20);
    expect(pageOffset(500)).toBe(9980);
    expect(pageOffset(999999) + PAGE_SIZE).toBe(MAX_RESULTS);
  });
  it('never offers pages beyond total or the API cap', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(21)).toBe(2);
    expect(pageCount(10_001)).toBe(500);
  });
});
