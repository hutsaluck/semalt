import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Database, Info } from 'lucide-react';
import { Hero } from '../components/Hero';
import { SearchPanel } from '../components/SearchPanel';
import { ServiceGrid } from '../components/ServiceGrid';
import { EmptyState, ErrorState, LoadingState } from '../components/RequestStates';
import { Pagination } from '../components/Pagination';
import { useCatalog } from '../hooks/useCatalog';
import { buildRouteQuery, DEFAULT_QUERY, normalizeQuery, pageCount, parseRouteQuery } from '../utils/query';
import { DR_EXPLANATION } from '../config';
import type { CatalogQuery } from '../types';

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseRouteQuery(params), [params]);
  const canonical = buildRouteQuery(query).toString();
  useEffect(() => {
    if (params.toString() !== canonical) setParams(canonical, { replace: true });
  }, [params, canonical, setParams]);

  const change = useCallback((changes: Partial<CatalogQuery>) => {
    const next = normalizeQuery({
      ...query, ...changes,
      sort: changes.q !== undefined && !changes.q.trim() ? 'dr' : changes.sort ?? query.sort,
      page: changes.page ?? 1,
    });
    setParams(buildRouteQuery(next));
  }, [query, setParams]);
  const reset = useCallback(() => setParams(buildRouteQuery(DEFAULT_QUERY)), [setParams]);
  const { status, data, error, retry } = useCatalog(query);
  const resultsRef = useRef<HTMLDivElement>(null);
  const outsidePages = data !== null && query.page > pageCount(data.total);
  useEffect(() => {
    // Page 1 is always valid, even if total changes again, so correction cannot loop.
    if (outsidePages) {
      setParams(buildRouteQuery({ ...query, page: 1 }), { replace: true });
    }
  }, [outsidePages, query, setParams]);

  const updatePage = (page: number) => {
    change({ page });
    resultsRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    resultsRef.current?.focus({ preventScroll: true });
  };
  const loading = status === 'loading' || outsidePages;
  return <>
    <Hero />
    <SearchPanel query={query} onChange={change} onReset={reset} />
    <section className="catalog-results" aria-label="Результати пошуку" aria-busy={loading}>
      <div className="results-heading" ref={resultsRef} tabIndex={-1}><div><h2 aria-live="polite">{loading ? 'Шукаємо інструменти…' : data ? <>Знайдено <span>{data.total.toLocaleString('uk-UA')}</span> сервісів</> : 'Каталог сервісів'}</h2><p>Ваш наступний інструмент — десь тут</p></div><span className="data-source"><Database size={14} aria-hidden="true" />Дані FreeSerp</span></div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={retry} /> : data && data.results.length ? <><ServiceGrid key={canonical} services={data.results} /><Pagination page={query.page} total={data.total} onChange={updatePage} /></> : <EmptyState onReset={reset} />}
    </section>
    <div className="catalog-note"><Info size={16} aria-hidden="true" /><p>{DR_EXPLANATION} Описи та категорії надані FreeSerp; перевіряйте актуальні можливості на сайті сервісу.</p></div>
  </>;
}
