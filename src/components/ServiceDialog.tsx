import { useEffect, useRef } from 'react';
import { ArrowUpRight, CalendarDays, Info, X } from 'lucide-react';
import { DR_EXPLANATION } from '../config';
import { formatDate } from '../utils/normalize';
import type { Service } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { CategoryTags, ServiceAvatar } from './ServiceCard';

export function ServiceDialog({ service, onClose }: { service: Service; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; opener?.focus(); };
  }, []);

  return <dialog className="service-dialog" ref={ref} aria-labelledby="service-dialog-title" onClose={(event) => {
    // StrictMode runs effect cleanup/setup twice. Ignore the queued close from cleanup if reopened.
    if (!event.currentTarget.open) onClose();
  }} onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <div className="dialog-header"><ServiceAvatar service={service} /><button type="button" className="icon-button" autoFocus aria-label="Закрити деталі" onClick={onClose}><X size={21} aria-hidden="true" /></button></div>
    <h2 id="service-dialog-title">{service.title}</h2><p className="dialog-domain">{service.domain}</p>
    <CategoryTags categories={service.categories} all />
    <p className="dialog-description">{service.summary}</p>
    <div className="dialog-meta"><div><span>Domain Rating</span><strong>{service.dr !== null ? `${service.dr} / 100` : 'Немає даних'}</strong></div>{service.wentLive && <div><span><CalendarDays size={14} aria-hidden="true" />Виявлено онлайн</span><strong><time dateTime={service.wentLive}>{formatDate(service.wentLive)}</time></strong></div>}</div>
    <p className="dialog-source"><Info size={16} aria-hidden="true" /><span>Опис і категорії надані FreeSerp та можуть містити неточності. {DR_EXPLANATION} Дата — перше підтвердження доступності, а не запуск продукту.</span></p>
    <div className="dialog-actions">{service.url && <a className="button button-primary" href={service.url} target="_blank" rel="noopener noreferrer">Відкрити сайт<ArrowUpRight size={17} aria-hidden="true" /></a>}<FavoriteButton service={service} expanded /></div>
  </dialog>;
}
