import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ENDPOINT, ApiError, clearApiCache, errorMessage, fetchCatalog, parseApiResponse } from './freeserp';
import { DEFAULT_QUERY } from '../utils/query';

const empty = { ok: true, total: 0, results: [] };
const valid = { ok: true, total: 1, results: [{ domain: 'example.ai', dr: 0 }] };
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => { clearApiCache(); vi.stubGlobal('fetch', fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('API response validation', () => {
  it('accepts a genuinely empty response', () => expect(parseApiResponse(empty)).toEqual({ total: 0, results: [] }));
  it('rejects ok=false independently of HTTP status', () => expect(() => parseApiResponse({ ok: false, error: 'upstream' })).toThrow(new ApiError('api')));
  it.each([{}, null, { ok: true, total: '1', results: [] }, { ok: true, total: -1, results: [] }, { ok: true, total: 1, results: [null] }])('rejects malformed structures', (value) => expect(() => parseApiResponse(value)).toThrow(new ApiError('structure')));
});

describe('fetch failures and cancellation', () => {
  it('uses the fixed same-origin route and preserves encoded API filters', async () => {
    fetchMock.mockResolvedValueOnce(Response.json(empty));
    await fetchCatalog({ ...DEFAULT_QUERY, q: 'html', category: 'Code & Dev Tools', drMin: '30', page: 2 });
    const [input, options] = fetchMock.mock.calls[0];
    const url = new URL(String(input), 'https://app.example/ai-radar/');
    expect(url.origin).toBe('https://app.example');
    expect(url.pathname).toBe(API_ENDPOINT);
    expect(url.searchParams.get('index')).toBe('sites');
    expect(url.searchParams.get('ai_startups')).toBe('1');
    expect(url.searchParams.get('q')).toBe('html');
    expect(url.searchParams.get('ai_categories')).toBe('Code & Dev Tools');
    expect(url.searchParams.get('dr_min')).toBe('30');
    expect(url.searchParams.get('from')).toBe('20');
    expect(options?.credentials).toBe('omit');
  });
  it('distinguishes an HTTP failure', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));
    await expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'http' });
  });
  it('distinguishes ok=false and invalid JSON', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ ok: false })).mockResolvedValueOnce(new Response('<html>'));
    await expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'api' });
    await expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'json' });
  });
  it('distinguishes a network error without exposing its raw message', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Private raw diagnostic'));
    await expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'network' });
    expect(errorMessage(new TypeError('Private raw diagnostic'))).not.toContain('Private');
  });
  it('aborts after 15 seconds and reports a timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const result = expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(15_000);
    await result;
  });
  it('preserves caller cancellation without converting it to a user error', async () => {
    fetchMock.mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const controller = new AbortController();
    const result = expect(fetchCatalog(DEFAULT_QUERY, { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await result;
  });
});

describe('bounded response cache', () => {
  it('caches successful empty results, expires after 5 minutes and supports fresh retry', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => Response.json(empty));
    await fetchCatalog(DEFAULT_QUERY);
    await fetchCatalog(DEFAULT_QUERY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await fetchCatalog(DEFAULT_QUERY, { bypassCache: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({ cache: 'reload' }));
    await vi.advanceTimersByTimeAsync(300_001);
    await fetchCatalog(DEFAULT_QUERY);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it('keys by all filters and evicts the oldest record at 30 entries', async () => {
    fetchMock.mockImplementation(async () => Response.json(valid));
    for (let page = 1; page <= 31; page++) await fetchCatalog({ ...DEFAULT_QUERY, page });
    await fetchCatalog({ ...DEFAULT_QUERY, page: 31 });
    expect(fetchMock).toHaveBeenCalledTimes(31);
    await fetchCatalog(DEFAULT_QUERY);
    expect(fetchMock).toHaveBeenCalledTimes(32);
    await fetchCatalog({ ...DEFAULT_QUERY, category: 'Code & Dev Tools' });
    expect(fetchMock).toHaveBeenCalledTimes(33);
  });
  it('never caches a failed request', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 502 })).mockResolvedValueOnce(Response.json(empty));
    await expect(fetchCatalog(DEFAULT_QUERY)).rejects.toMatchObject({ kind: 'http' });
    await expect(fetchCatalog(DEFAULT_QUERY)).resolves.toEqual({ total: 0, results: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
