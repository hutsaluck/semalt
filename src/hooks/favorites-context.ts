import { createContext, useContext } from 'react';
import type { Service } from '../types';

export interface FavoritesContextValue {
  items: Service[];
  warning: string | null;
  toggle: (service: Service) => void;
  isSaved: (domain: string) => boolean;
}
export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('FavoritesProvider is required');
  return context;
}
