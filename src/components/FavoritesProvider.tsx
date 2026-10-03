import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FavoritesContext } from '../hooks/favorites-context';
import { FAVORITES_KEY, readFavorites, toggleFavorite, writeFavorites, type FavoritesState } from '../utils/favorites';
import type { Service } from '../types';

function initialState(): FavoritesState {
  try { return readFavorites(window.localStorage); }
  catch { return { items: [], warning: 'Локальне сховище недоступне. Зміни можуть не зберегтися після перезавантаження.' }; }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const toggle = useCallback((service: Service) => {
    const items = toggleFavorite(state.items, service);
    let warning: string | null;
    try { warning = writeFavorites(window.localStorage, items); }
    catch { warning = 'Локальне сховище недоступне. Зміни можуть не зберегтися після перезавантаження.'; }
    setState({ items, warning });
  }, [state.items]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === FAVORITES_KEY || event.key === null) setState(initialState());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo(() => ({ ...state, toggle, isSaved: (domain: string) => state.items.some((item) => item.domain === domain) }), [state, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
