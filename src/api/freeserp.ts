import type { CatalogQuery, CatalogResponse } from '../types';
import { buildApiQuery } from '../utils/query';
import { isRecord, normalizeService } from '../utils/normalize';
import { API_ENDPOINT } from './endpoint';

export { API_ENDPOINT } from './endpoint';
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_LIMIT = 30;
const cache = new Map<string, { expires: number; data: CatalogResponse }>();

export type ApiErrorKind = 'http' | 'api' | 'json' | 'structure' | 'timeout' | 'network';
export class ApiError extends Error {
  constructor(public readonly kind: ApiErrorKind) {
    super(kind);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Не вдалося завантажити каталог. Спробуйте ще раз.';
  switch (error.kind) {
    case 'http': return 'Сервіс даних тимчасово недоступний. Спробуйте повторити запит.';
    case 'api': return 'FreeSerp не зміг виконати пошук. Спробуйте ще раз трохи пізніше.';
    case 'json':
    case 'structure': return 'Сервіс даних повернув некоректну відповідь. Спробуйте ще раз пізніше.';
    case 'timeout': return 'FreeSerp відповідає довше, ніж очікувалося. Повторіть запит.';
    case 'network': return 'Немає зв’язку з FreeSerp. Перевірте інтернет і повторіть запит.';
  }
}

export function parseApiResponse(value: unknown): CatalogResponse {
  if (!isRecord(value)) throw new ApiError('structure');
  if (value.ok === false) throw new ApiError('api');
  if (value.ok !== true || !Array.isArray(value.results) || typeof value.total !== 'number' || !Number.isSafeInteger(value.total) || value.total < 0) {
    throw new ApiError('structure');
  }
  const results = value.results.map(normalizeService).filter((item) => item !== null);
  if (value.results.length && !results.length) throw new ApiError('structure');
  const unique = [...new Map(results.map((item) => [item.domain, item])).values()];
  return { total: value.total, results: unique };
}

export function clearApiCache(): void {
  cache.clear();
}

export async function fetchCatalog(
  query: CatalogQuery,
  options: { signal?: AbortSignal; bypassCache?: boolean } = {},
): Promise<CatalogResponse> {
  const key = buildApiQuery(query).toString();
  options.signal?.throwIfAborted();
  const cached = cache.get(key);
  if (!options.bypassCache && cached && cached.expires > Date.now()) return cached.data;
  cache.delete(key);

  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', abort, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 15_000);

  try {
    const response = await fetch(`${API_ENDPOINT}?${key}`, {
      signal: controller.signal,
      credentials: 'omit',
      cache: options.bypassCache ? 'reload' : 'default',
    });
    if (!response.ok) throw new ApiError('http');
    let value: unknown;
    try { value = await response.json(); }
    catch (error) {
      if (controller.signal.aborted) throw error;
      throw new ApiError('json');
    }
    controller.signal.throwIfAborted();
    const data = parseApiResponse(value);
    const now = Date.now();
    for (const [entryKey, entry] of cache) if (entry.expires <= now) cache.delete(entryKey);
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
    cache.set(key, { data, expires: now + CACHE_TTL });
    return data;
  } catch (error) {
    if (options.signal?.aborted) throw options.signal.reason ?? new DOMException('Aborted', 'AbortError');
    if (timedOut) throw new ApiError('timeout');
    if (error instanceof ApiError) throw error;
    throw new ApiError('network');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
