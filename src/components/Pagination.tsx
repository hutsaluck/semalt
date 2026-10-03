import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MAX_RESULTS, PAGE_SIZE } from '../config';
import { pageCount } from '../utils/query';

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const count = pageCount(total);
  return <div className="pagination-section"><nav className="pagination" aria-label="Сторінки каталогу"><button className="button button-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}><ArrowLeft size={16} aria-hidden="true" /><span>Попередня</span></button><div className="page-indicator" aria-current="page">Сторінка <strong>{page}</strong> з {count}<span>До {PAGE_SIZE} сервісів на сторінці</span></div><button className="button button-secondary" disabled={page >= count} onClick={() => onChange(page + 1)}><span>Наступна</span><ArrowRight size={16} aria-hidden="true" /></button></nav>{total > MAX_RESULTS && <p className="pagination-limit">Доступні перші {MAX_RESULTS.toLocaleString('uk-UA')} результатів. Звузьте пошук або додайте фільтри, щоб знайти потрібний сервіс.</p>}</div>;
}
