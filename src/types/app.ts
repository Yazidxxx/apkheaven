export interface AppDetails {
  id: string;
  name: string;
  description: string;
  icon: string;
  developer: {
    name: string;
    url: string;
  };
  category: string;
  rating: number;
  reviews: number;
  size: string;
  version: string;
  lastUpdated: string;
  installs: string;
  screenshots: string[];
  playStoreUrl: string;
}

export interface SearchParams {
  query?: string;
  category?: string;
  page: number;
  perPage: number;
}

export interface SearchResponse {
  apps: AppDetails[];
  totalApps: number;
  currentPage: number;
  totalPages: number;
}