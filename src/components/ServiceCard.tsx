import { ArrowUpRight, CalendarDays, ChevronRight } from 'lucide-react';
import { categoryLabel, DR_EXPLANATION } from '../config';
import { formatDate } from '../utils/normalize';
import type { Service } from '../types';
import { FavoriteButton } from './FavoriteButton';

export function ServiceAvatar({ service }: { service: Service }) {
  return <span className="service-avatar" aria-hidden="true">{service.domain.charAt(0).toUpperCase()}</span>;
}

export function CategoryTags({ categories, all = false }: { categories: string[]; all?: boolean }) {
  return <div className="category-tags">{categories.length ? <>
    {(all ? categories : categories.slice(0, 2)).map((value) => <span className="category-tag" key={value} title={value}>{categoryLabel(value)}</span>)}
    {!all && categories.length > 2 && <span className="category-tag more-tag">+{categories.length - 2}</span>}
  </> : <span className="category-tag">Без категорії</span>}</div>;
}

export function ServiceCard({ service, onDetails }: { service: Service; onDetails: (service: Service) => void }) {
  return <article className="service-card">
    <div className="card-top"><ServiceAvatar service={service} /><FavoriteButton service={service} /></div>
    <div className="card-heading"><h2 title={service.title}>{service.title}</h2><span className="service-domain" title={service.domain}>{service.domain}</span></div>
    <p className="card-description">{service.summary}</p>
    <CategoryTags categories={service.categories} />
    <div className="card-meta">
      <span className="dr-value" title={DR_EXPLANATION}>DR <strong>{service.dr ?? 'Немає даних'}</strong>{service.dr !== null && <span className="dr-meter" aria-hidden="true"><i style={{ width: `${service.dr}%` }} /></span>}</span>
      {service.wentLive && <span className="date-value"><CalendarDays size={12} aria-hidden="true" /><span>Виявлено онлайн<br /><time dateTime={service.wentLive}>{formatDate(service.wentLive)}</time></span></span>}
    </div>
    <div className="card-actions"><button type="button" className="card-details" aria-label={`Детальніше про ${service.title}`} onClick={() => onDetails(service)}>Детальніше<ChevronRight size={15} aria-hidden="true" /></button>
      {service.url ? <a className="card-website" href={service.url} target="_blank" rel="noopener noreferrer" aria-label={`Відкрити сайт ${service.domain} у новій вкладці`}>Відкрити сайт<ArrowUpRight size={15} aria-hidden="true" /></a> : <span className="unavailable-url">Сайт недоступний</span>}
    </div>
  </article>;
}
