/**
 * DiPlaMus Archive API Client
 * Base URL: https://archive.diplamus.app-host.eu/api/v1
 * Auth: X-API-Authorization header
 */

const BASE_URL = 'https://archive.diplamus.app-host.eu/api/v1';
const API_KEY = 'uinFayPObwYkqt8t8YTIDceq/1sMFnHbi08mavaS3W0=';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-API-Authorization': API_KEY,
};

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString(), { headers: defaultHeaders });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ---- Types ----

export interface Translation {
  languageId: number;
  languageCode: string;
  languageName: string;
  name: string;
  description?: string;
  shortDescription?: string;
}

export interface ImageAsset {
  uri?: string;
  width?: number;
  height?: number;
  thumbnails?: {
    medium?: string;
    'ls-large'?: { uri: string; width: number; height: number };
    'pt-large'?: { uri: string; width: number; height: number };
  };
}

export interface PaginatedResponse<T> {
  error: boolean;
  status: number;
  message: string;
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: string;
    to: number;
    total: number;
  };
}

export interface SingleResponse<T> {
  error: boolean;
  status: number;
  message: string;
  data: T;
}

export interface Tour {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  halls?: Hall[];
}

export interface Hall {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  tour?: Tour;
  navigationPoints?: NavigationPoint[];
}

export interface NavigationPoint {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  image?: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  hall?: Hall;
  files?: MediaFile[];
  materials?: Material[];
  periods?: Period[];
  places?: Place[];
  usages?: Usage[];
  cidoc?: CidocData;
}

export interface MediaFile {
  id: number;
  type: 'image' | 'video' | '3d' | 'audio' | 'document';
  uri: string;
  name?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  thumbnails?: Record<string, string | { uri: string }>;
}

export interface Material {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface Period {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface Place {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface Usage {
  id: number;
  name: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface Language {
  id: number;
  name: string;
  code: string;
  image: ImageAsset;
}

export interface CidocData {
  [key: string]: unknown;
}

// ---- API Functions ----

export interface ListParams {
  page?: number;
  pageSize?: number;
  content?: string;
  sort?: string;
  send_ops?: number;
}

export const api = {
  // Tours
  getTours: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Tour>>('/tours', params as Record<string, string | number | boolean>),
  getTour: (id: number) =>
    apiFetch<SingleResponse<Tour>>(`/tours/${id}`),

  // Halls
  getHalls: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Hall>>('/halls', params as Record<string, string | number | boolean>),
  getHall: (id: number) =>
    apiFetch<SingleResponse<Hall>>(`/halls/${id}`),

  // Navigation Points (Exhibits)
  getNavigationPoints: (params?: ListParams) =>
    apiFetch<PaginatedResponse<NavigationPoint>>('/navigation_points', params as Record<string, string | number | boolean>),
  getNavigationPoint: (id: number) =>
    apiFetch<SingleResponse<NavigationPoint>>(`/navigation_points/${id}`),

  // Taxonomy
  getMaterials: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Material>>('/materials', params as Record<string, string | number | boolean>),
  getPeriods: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Period>>('/periods', params as Record<string, string | number | boolean>),
  getPlaces: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Place>>('/places', params as Record<string, string | number | boolean>),
  getUsages: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Usage>>('/usages', params as Record<string, string | number | boolean>),
  getLanguages: () =>
    apiFetch<PaginatedResponse<Language>>('/languages'),
};

// ---- Helpers ----

export function getTranslation(translations: Translation[], langCode: string): Translation | undefined {
  return translations.find(t => t.languageCode === langCode) || translations[0];
}

export function getImageUrl(image: ImageAsset | undefined, size: 'original' | 'medium' | 'large' = 'original'): string | null {
  if (!image) return null;
  if (size === 'medium' && image.thumbnails?.medium) return image.thumbnails.medium;
  if (size === 'large') {
    const ls = image.thumbnails?.['ls-large'];
    if (ls && typeof ls === 'object') return ls.uri;
  }
  return image.uri || null;
}
