import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Search, X, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../config';
import type { CatalogQuery, MinDR, Sort } from '../types';

interface Props {
  query: CatalogQuery;
  onChange: (changes: Partial<CatalogQuery>) => void;
  onReset: () => void;
}

function SearchField({ value, onSearch }: { value: string; onSearch: (value: string) => void }) {
  const [state, setState] = useState({ source: value, draft: value });
  if (state.source !== value) setState({ source: value, draft: value });
  const draft = state.source === value ? state.draft : value;
  const setDraft = (next: string) => setState({ source: value, draft: next });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (draft.trim() === value) return;
    timer.current = setTimeout(() => onSearch(draft), 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, value, onSearch]);

  const submit = (next: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (next.trim() !== value) onSearch(next);
  };
  return <form className="search-form" role="search" onSubmit={(event) => { event.preventDefault(); submit(draft); }}>
    <label htmlFor="catalog-search" className="sr-only">Пошук AI-інструментів за задачею</label>
    <Search size={22} className="search-icon" aria-hidden="true" />
    <input id="catalog-search" type="search" autoComplete="off" maxLength={200} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Що хочете створити? video editor, coding assistant, automation" />
    {draft && <button className="icon-button clear-search" type="button" aria-label="Очистити пошук" onClick={() => { setDraft(''); submit(''); }}><X size={19} aria-hidden="true" /></button>}
    <button className="button button-primary search-submit" type="submit" aria-label="Знайти"><Search size={16} aria-hidden="true" /><span>Знайти</span></button>
  </form>;
}

export function SearchPanel({ query, onChange, onReset }: Props) {
  return <section className="search-panel" aria-label="Пошук та фільтри">
    <SearchField value={query.q} onSearch={(q) => onChange({ q })} />
    <div className="filter-row">
      <span className="filter-intro"><SlidersHorizontal size={16} aria-hidden="true" />Фільтри</span>
      <div className="filter-field category-filter"><label htmlFor="category">Категорія</label><select id="category" value={query.category} onChange={(event) => onChange({ category: event.target.value })}><option value="">Усі категорії</option>{CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
      <div className="filter-field"><label htmlFor="min-dr">Мінімальний DR</label><select id="min-dr" value={query.drMin} onChange={(event) => onChange({ drMin: event.target.value as MinDR })}><option value="">Будь-який</option><option value="10">10+</option><option value="30">30+</option><option value="50">50+</option></select></div>
      <div className="filter-field sort-filter"><label htmlFor="sort">Сортування</label><select id="sort" value={query.sort} onChange={(event) => onChange({ sort: event.target.value as Sort })}><option value="dr">За DR</option><option value="went_live">Нещодавно виявлені</option><option value="relevance" disabled={!query.q}>За релевантністю</option></select></div>
      <button className="reset-button" type="button" onClick={onReset}><RotateCcw size={14} aria-hidden="true" />Скинути фільтри</button>
    </div>
  </section>;
}
