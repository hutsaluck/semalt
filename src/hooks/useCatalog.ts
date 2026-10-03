import { useEffect, useMemo, useState } from 'react';
import { errorMessage, fetchCatalog } from '../api/freeserp';
import { buildApiQuery } from '../utils/query';
import type { CatalogQuery, CatalogResponse } from '../types';

type RequestState = { key: string; status: 'success'; data: CatalogResponse } | { key: string; status: 'error'; error: string };

export function useCatalog(query: CatalogQuery) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<RequestState | null>(null);
  const { q, category, drMin, sort, page } = query;
  const stableQuery = useMemo(() => ({ q, category, drMin, sort, page }), [q, category, drMin, sort, page]);
  const apiKey = buildApiQuery(stableQuery).toString();
  const requestKey = `${apiKey}|${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    fetchCatalog(stableQuery, { signal: controller.signal, bypassCache: attempt > 0 })
      .then((data) => { if (current) setState({ key: requestKey, status: 'success', data }); })
      .catch((error: unknown) => {
        if (current && !controller.signal.aborted) setState({ key: requestKey, status: 'error', error: errorMessage(error) });
      });
    return () => { current = false; controller.abort(); };
  }, [stableQuery, requestKey, attempt]);

  return {
    status: state?.key === requestKey ? state.status : 'loading',
    data: state?.key === requestKey && state.status === 'success' ? state.data : null,
    error: state?.key === requestKey && state.status === 'error' ? state.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
