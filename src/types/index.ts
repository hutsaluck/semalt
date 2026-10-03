export interface Service {
  domain: string;
  url: string | null;
  title: string;
  summary: string;
  categories: string[];
  dr: number | null;
  wentLive: string | null;
}

export type Sort = 'dr' | 'went_live' | 'relevance';
export type MinDR = '' | '10' | '30' | '50';

export interface CatalogQuery {
  q: string;
  category: string;
  drMin: MinDR;
  sort: Sort;
  page: number;
}

export interface CatalogResponse {
  results: Service[];
  total: number;
}
