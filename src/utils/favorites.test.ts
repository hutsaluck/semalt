import { describe, expect, it } from 'vitest';
import { FAVORITES_KEY, readFavorites, sanitizeFavorites, toggleFavorite, writeFavorites, type FavoriteStorage } from './favorites';
import { normalizeService } from './normalize';

const service = normalizeService({ domain: 'example.ai', title: 'Example', ai_summary: 'Saved description', dr: 0 })!;
function memoryStorage(): FavoriteStorage {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

describe('local favorites', () => {
  it('reads an empty collection', () => expect(readFavorites(memoryStorage())).toEqual({ items: [], warning: null }));
  it('writes and reads the complete minimal snapshot, including DR=0', () => {
    const storage = memoryStorage();
    expect(writeFavorites(storage, [service])).toBeNull();
    expect(readFavorites(storage).items).toEqual([service]);
  });
  it('deduplicates normalized domains and removes a saved item on toggle', () => {
    expect(sanitizeFavorites([service, { ...service, domain: 'WWW.EXAMPLE.AI' }])).toHaveLength(1);
    const added = toggleFavorite([], service);
    expect(toggleFavorite(added, { ...service, domain: 'WWW.EXAMPLE.AI' })).toEqual([]);
  });
  it('ignores invalid records and reports damaged storage', () => {
    const storage = memoryStorage();
    storage.setItem(FAVORITES_KEY, JSON.stringify([service, { domain: 'bad' }]));
    expect(readFavorites(storage).items).toEqual([service]);
    expect(readFavorites(storage).warning).toBeTruthy();
    storage.setItem(FAVORITES_KEY, '{broken');
    expect(readFavorites(storage).items).toEqual([]);
    expect(readFavorites(storage).warning).toBeTruthy();
  });
  it('reports unavailable storage and failed persistence', () => {
    const blocked = { getItem: () => { throw new Error('Blocked'); }, setItem: () => { throw new Error('Full'); } };
    expect(readFavorites(blocked).warning).toBeTruthy();
    expect(writeFavorites(blocked, [service])).toContain('може зникнути');
  });
});
