import { Bookmark, Check } from 'lucide-react';
import { useFavorites } from '../hooks/favorites-context';
import type { Service } from '../types';

export function FavoriteButton({ service, expanded = false }: { service: Service; expanded?: boolean }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(service.domain);
  const label = `${saved ? 'Видалити з обраного' : 'Додати до обраного'}: ${service.title}`;
  return <button type="button" className={`${expanded ? 'button button-secondary' : 'icon-button favorite-button'}${saved ? ' is-saved' : ''}`} aria-label={label} title={label} aria-pressed={saved} onClick={() => toggle(service)}>
    {expanded && saved ? <Check size={17} aria-hidden="true" /> : <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />}
    {expanded && <span>{saved ? 'В обраному' : 'Зберегти в обране'}</span>}
  </button>;
}
