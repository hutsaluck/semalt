import { CircleAlert, SearchX } from 'lucide-react';

export function LoadingState() {
  return <div role="status" aria-live="polite"><span className="sr-only">Завантаження сервісів…</span><div className="service-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div className="service-card skeleton-card" key={i}><div className="skeleton skeleton-avatar" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-domain" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-tags" /><div className="skeleton skeleton-actions" /></div>)}</div></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="empty-state" role="alert"><span className="state-icon"><CircleAlert size={28} aria-hidden="true" /></span><h2>Не вдалося завантажити сервіси</h2><p>{message}</p><button className="button button-primary" onClick={onRetry}>Спробувати ще раз</button></div>;
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="empty-state" role="status"><span className="state-icon"><SearchX size={29} aria-hidden="true" /></span><h2>За цим запитом нічого не знайдено</h2><p>Спробуйте інші слова або виберіть ширшу категорію.<br />Англійський запит може дати більше результатів.</p><button className="button button-primary" onClick={onReset}>Скинути фільтри</button></div>;
}
