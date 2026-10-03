import type { Service } from '../types';
import { normalizeSnapshot } from './normalize';

export const FAVORITES_KEY = 'ai-radar:favorites:v1';
export interface FavoriteStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export interface FavoritesState { items: Service[]; warning: string | null }

export function sanitizeFavorites(values: unknown): Service[] {
  if (!Array.isArray(values)) return [];
  return [...new Map(values.map(normalizeSnapshot).filter((item) => item !== null).map((item) => [item.domain, item])).values()];
}

export function readFavorites(storage: FavoriteStorage): FavoritesState {
  try {
    const raw = storage.getItem(FAVORITES_KEY);
    if (!raw) return { items: [], warning: null };
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) throw new Error('Invalid favorites');
    const items = sanitizeFavorites(value);
    return { items, warning: items.length < value.length ? 'Деякі збережені записи були пошкоджені або дублювалися й не відображаються.' : null };
  } catch {
    return { items: [], warning: 'Не вдалося прочитати обране. Сховище недоступне або збережені дані пошкоджені.' };
  }
}

export function writeFavorites(storage: FavoriteStorage, items: Service[]): string | null {
  try { storage.setItem(FAVORITES_KEY, JSON.stringify(items)); return null; }
  catch { return 'Браузер не дозволив зберегти зміни. Обране працює зараз, але може зникнути після перезавантаження.'; }
}

export function toggleFavorite(items: Service[], service: Service): Service[] {
  const normalized = normalizeSnapshot(service);
  const unique = sanitizeFavorites(items);
  if (!normalized) return unique;
  return unique.some((item) => item.domain === normalized.domain)
    ? unique.filter((item) => item.domain !== normalized.domain)
    : [...unique, normalized];
}
