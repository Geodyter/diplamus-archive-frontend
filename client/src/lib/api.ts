/**
 * DiPlaMus Archive API Client
 * Base URL: https://archive.diplamus.app-host.eu/api/v1
 * Auth: X-API-Authorization header
 * All calls go through /api/diplamus-proxy to avoid CORS.
 */

const BASE_URL = '/api/diplamus-proxy';

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(`${window.location.origin}${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
  });
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
  // Navigation points use 'title' + 'text' for name + description
  title?: string;
  text?: string;
  // Taxonomy items use 'name'
  name?: string;
  description?: string;
  shortDescription?: string;
}

export interface ImageAsset {
  uri?: string;
  width?: number | null;
  height?: number | null;
  thumbnails?: string | {
    medium?: { uri: string; width: number; height: number };
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
  title?: string;
  name?: string;
  description?: string;
  image: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  tour?: Tour;
  navigationPoints?: NavigationPoint[];
}

/**
 * MediaFile — actual API response shape from navigation_points/:id
 * The API returns:
 *   file_category: '3d' | 'photo' | 'video' | 'document'
 *   file_path: full URL to the file
 *   image: { uri, width, height, thumbnails } for photos
 */
export interface MediaFile {
  id: number;
  title: string;
  file_name: string;
  file_path: string;        // URL for 3D/document files
  file_type: string;        // 'file' | 'image' etc
  file_category: string;    // '3d' | 'photo' | 'video' | 'document'
  file_extension: string;   // 'glb', 'jpg', 'mp4' etc
  file_size: string;
  image?: ImageAsset;       // populated for photo files
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export interface TaxonomyItem {
  id: number;
  name: string;
  image: ImageAsset;
  status: string;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
}

export type Material = TaxonomyItem;
export type Period = TaxonomyItem;
export type Place = TaxonomyItem;
export type Usage = TaxonomyItem;
export type ReservationStatus = TaxonomyItem;

/**
 * NavigationPointCategory — hierarchical category from /navigation_point_categories
 * Top-level categories have children (subcategories / "Είδος αντικειμένου")
 */
export interface NavigationPointCategory {
  id: number;
  name: string;
  image: ImageAsset;
  status: string;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  children?: NavigationPointCategory[];
  parent?: NavigationPointCategory | null;
}

/**
 * NavigationPoint — actual API response shape from navigation_points/:id
 */
export interface NavigationPoint {
  id: number;
  title: string;
  text?: string;                      // main description (top-level)
  code?: string;                      // inventory code e.g. "Μ.Γ.11"
  registration_number?: string;       // manufacturer/creator
  height?: string;
  width?: string;
  length?: string;
  monumentName?: string;              // date/era e.g. "Δεκαετία 1970"
  firstPlace?: TaxonomyItem | null;   // primary location
  secondPlace?: TaxonomyItem | null;  // secondary location (room)
  place?: TaxonomyItem[];
  placeText?: string | null;
  commentPlace?: string;
  city?: TaxonomyItem[];
  location?: string;                  // country of origin
  specialLocation?: string;           // language of origin
  material?: TaxonomyItem[];
  description?: string;               // CIDOC description
  dimensionComments?: string;
  reservationStatus?: TaxonomyItem | null;
  period?: TaxonomyItem | null;       // collection
  inscription?: string;
  publications?: string;
  otherObservations?: string;
  conservation?: string;              // copyright/license
  usage?: TaxonomyItem | null;        // acquisition method
  validated?: number;
  sendOPS?: number;
  image?: ImageAsset;
  createdAt: string;
  updatedAt: string;
  translations: Translation[];
  hall?: Hall;
  files?: MediaFile[];
  // Legacy fields (kept for backwards compat)
  materials?: TaxonomyItem[];
  periods?: TaxonomyItem[];
  places?: TaxonomyItem[];
  usages?: TaxonomyItem[];
}

export interface Language {
  id: number;
  name: string;
  code: string;
  image: ImageAsset;
}

// ---- API Functions ----

export interface ListParams {
  page?: number;
  pageSize?: number;
  content?: string;
  sort?: string;
  send_ops?: number;
  // Filter params
  period_id?: number | string;
  /** Single material filter (exact match) */
  material_id?: number | string;
  /** Multi-material filter: comma-separated IDs e.g. "1,2,3" */
  materials?: string;
  place_id?: number | string;
  usage_id?: number | string;
  /** Filter by category (top-level or subcategory) */
  category_id?: number | string;
}

export const api = {
  getTours: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Tour>>('/tours', params as Record<string, string | number | boolean>),
  getTour: (id: number) =>
    apiFetch<SingleResponse<Tour>>(`/tours/${id}`),

  getHalls: (params?: ListParams) =>
    apiFetch<PaginatedResponse<Hall>>('/halls', params as Record<string, string | number | boolean>),
  getHall: (id: number) =>
    apiFetch<SingleResponse<Hall>>(`/halls/${id}`),

  getNavigationPoints: (params?: ListParams) =>
    apiFetch<PaginatedResponse<NavigationPoint>>('/navigation_points', params as Record<string, string | number | boolean>),
  getNavigationPoint: (id: number) =>
    apiFetch<SingleResponse<NavigationPoint>>(`/navigation_points/${id}`),

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
  /** Get all categories (hierarchical: top-level have children = subcategories) */
  getCategories: (params?: ListParams) =>
    apiFetch<PaginatedResponse<NavigationPointCategory>>('/navigation_point_categories', params as Record<string, string | number | boolean>),
  /** Get a single category with its children */
  getCategory: (id: number) =>
    apiFetch<SingleResponse<NavigationPointCategory>>(`/navigation_point_categories/${id}`),
};

// ---- Helpers ----

export function getTranslation(translations: Translation[] | null | undefined, langCode: string): Translation | undefined {
  const arr = Array.isArray(translations) ? translations : [];
  return arr.find(t => t.languageCode === langCode) || arr[0];
}

/**
 * Get the direct storage URL — CORS is now enabled on the upstream server
 * so we can use the original URLs directly without a proxy.
 */
export function getDirectStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url;
}

/**
 * Kept for backwards compatibility — now returns the URL directly (no proxy needed).
 */
export function proxyStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url;
}

export function getImageUrl(image: ImageAsset | undefined, size: 'original' | 'medium' | 'large' = 'original'): string | null {
  if (!image || typeof image !== 'object') return null;
  if (size === 'medium' && image.thumbnails && typeof image.thumbnails === 'object') {
    const th = image.thumbnails as { medium?: { uri: string } };
    if (th.medium?.uri) return th.medium.uri;
  }
  if (size === 'large' && image.thumbnails && typeof image.thumbnails === 'object') {
    const th = image.thumbnails as { 'ls-large'?: { uri: string } };
    if (th['ls-large']?.uri) return th['ls-large']?.uri;
  }
  return image.uri || null;
}

/** Get the display URL for a MediaFile (direct, CORS enabled) */
export function getFileUrl(file: MediaFile): string | null {
  // For 3D/documents: use file_path
  if (file.file_category === '3d' || file.file_type === 'file') {
    return file.file_path || null;
  }
  // For photos: prefer image.uri
  if (file.image?.uri) return file.image.uri;
  // Fallback to file_path
  return file.file_path || null;
}

/** Get thumbnail URL for a MediaFile (direct, CORS enabled) */
export function getFileThumbnail(file: MediaFile): string | null {
  if (file.image?.thumbnails && typeof file.image.thumbnails === 'object') {
    const th = file.image.thumbnails as { medium?: { uri: string }; 'ls-large'?: { uri: string } };
    return th.medium?.uri || th['ls-large']?.uri || file.image.uri || null;
  }
  return file.image?.uri || null;
}

/** Get the display name of a taxonomy item in the given language */
export function getTaxonomyName(item: TaxonomyItem | null | undefined, langCode: string): string {
  if (!item) return '—';
  const translations = Array.isArray(item.translations) ? item.translations : [];
  const tr = getTranslation(translations, langCode);
  return tr?.name || item.name || '—';
}
