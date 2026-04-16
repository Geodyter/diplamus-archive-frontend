/**
 * DiPlaMus Archive — Explore/Search Page
 * Design: Contemporary Museum Digital
 * Features: Faceted search (server-side), grid/list view, pagination, sort
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Grid3X3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { api, NavigationPoint, Material, Period, Place, Usage, getTranslation } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import ExhibitCard from '@/components/ExhibitCard';
import { LoadingSpinner, ErrorState, EmptyState, PageHeader, Pagination } from '@/components/LoadingState';

export default function Explore() {
  const { lang, t } = useLanguage();
  const [location] = useLocation();

  // Parse URL params — use window.location.search for the full query string
  // (wouter's useLocation only returns the pathname, not the query string)
  const params = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  }, [location]);

  const initialQuery = params.get('q') || '';
  const initialMaterial = params.get('material') || '';
  const initialPeriod = params.get('period') || '';
  const initialPlace = params.get('place') || '';
  const initialUsage = params.get('usage') || '';

  // State
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('title');
  const [page, setPage] = useState(1);
  const [filterMaterial, setFilterMaterial] = useState(initialMaterial);
  const [filterPeriod, setFilterPeriod] = useState(initialPeriod);
  const [filterPlace, setFilterPlace] = useState(initialPlace);
  const [filterUsage, setFilterUsage] = useState(initialUsage);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data
  const [exhibits, setExhibits] = useState<NavigationPoint[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Taxonomy
  const [materials, setMaterials] = useState<Material[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [usages, setUsages] = useState<Usage[]>([]);

  // Load taxonomy once
  useEffect(() => {
    Promise.all([
      api.getMaterials({ pageSize: 100 }),
      api.getPeriods({ pageSize: 100 }),
      api.getPlaces({ pageSize: 100 }),
      api.getUsages({ pageSize: 100 }),
    ]).then(([m, p, pl, u]) => {
      setMaterials(m.data);
      setPeriods(p.data);
      setPlaces(pl.data);
      setUsages(u.data);
    }).catch(console.error);
  }, []);

  // Load exhibits with server-side filtering
  const loadExhibits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams: Record<string, string | number> = {
        page,
        pageSize: 12,
        send_ops: 1,
        sort,
      };
      if (query) apiParams.content = query;
      if (filterMaterial) apiParams.material_id = filterMaterial;
      if (filterPeriod) apiParams.period_id = filterPeriod;
      if (filterPlace) apiParams.place_id = filterPlace;
      if (filterUsage) apiParams.usage_id = filterUsage;

      const res = await api.getNavigationPoints(apiParams as any);
      setExhibits(res.data);
      setTotalPages(res.meta.last_page);
      setTotalItems(res.meta.total);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, query, sort, filterMaterial, filterPeriod, filterPlace, filterUsage, t]);

  useEffect(() => {
    loadExhibits();
  }, [loadExhibits]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterMaterial('');
    setFilterPeriod('');
    setFilterPlace('');
    setFilterUsage('');
    setQuery('');
    setInputValue('');
    setPage(1);
  };

  const hasActiveFilters = filterMaterial || filterPeriod || filterPlace || filterUsage || query;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm font-body font-medium w-full py-2 px-3 rounded-sm border border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C] transition-colors"
          style={{ color: 'var(--charcoal)' }}
        >
          <X size={14} />
          {t('explore.filters.clear')}
        </button>
      )}

      {/* Collections / Periods */}
      {periods.length > 0 && (
        <FilterGroup
          label={t('explore.filters.collection')}
          options={periods.map(p => ({ value: String(p.id), label: getTranslation(p.translations, lang)?.name || p.name }))}
          value={filterPeriod}
          onChange={v => { setFilterPeriod(v); setPage(1); }}
        />
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <FilterGroup
          label={t('explore.filters.material')}
          options={materials.map(m => ({ value: String(m.id), label: getTranslation(m.translations, lang)?.name || m.name }))}
          value={filterMaterial}
          onChange={v => { setFilterMaterial(v); setPage(1); }}
        />
      )}

      {/* Places / Τοποθεσία */}
      {places.length > 0 && (
        <FilterGroup
          label={t('explore.filters.place')}
          options={places.map(p => ({ value: String(p.id), label: getTranslation(p.translations, lang)?.name || p.name }))}
          value={filterPlace}
          onChange={v => { setFilterPlace(v); setPage(1); }}
        />
      )}

      {/* Usages / Τρόπος Απόκτησης */}
      {usages.length > 0 && (
        <FilterGroup
          label={t('explore.filters.usage')}
          options={usages.map(u => ({ value: String(u.id), label: getTranslation(u.translations, lang)?.name || u.name }))}
          value={filterUsage}
          onChange={v => { setFilterUsage(v); setPage(1); }}
        />
      )}
    </div>
  );

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-10">
        <PageHeader title={t('explore.title')} subtitle={t('explore.subtitle')} />

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09890]" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={t('explore.search.placeholder')}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#e8e0d8] rounded-sm bg-white focus:outline-none focus:border-[#B5533C] font-body transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-body font-semibold rounded-sm text-white transition-all hover:opacity-90"
            style={{ background: 'var(--terracotta)' }}
          >
            {t('explore.search.button')}
          </button>
          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-3 text-sm font-body border border-[#e8e0d8] rounded-sm hover:border-[#B5533C] transition-colors"
          >
            <SlidersHorizontal size={16} />
          </button>
        </form>

        <div className="flex gap-8">
          {/* Sidebar Filters — Desktop */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-display font-semibold text-base mb-4" style={{ color: 'var(--charcoal)' }}>
                {t('explore.filters.title')}
              </h3>
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                {!loading && (
                  <span>
                    <strong style={{ color: 'var(--charcoal)' }}>{totalItems}</strong> {t('explore.results')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => { setSort(e.target.value); setPage(1); }}
                    className="appearance-none pl-3 pr-8 py-2 text-xs font-body border border-[#e8e0d8] rounded-sm bg-white focus:outline-none focus:border-[#B5533C] cursor-pointer"
                  >
                    <option value="title">{t('explore.sort.title_asc')}</option>
                    <option value="-title">{t('explore.sort.title_desc')}</option>
                    <option value="-created_at">{t('explore.sort.date_desc')}</option>
                    <option value="created_at">{t('explore.sort.date_asc')}</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#a09890]" />
                </div>
                {/* View toggle */}
                <div className="flex border border-[#e8e0d8] rounded-sm overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 transition-colors ${view === 'grid' ? 'bg-[#B5533C] text-white' : 'bg-white text-[#a09890] hover:text-[#B5533C]'}`}
                  >
                    <Grid3X3 size={15} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 transition-colors ${view === 'list' ? 'bg-[#B5533C] text-white' : 'bg-white text-[#a09890] hover:text-[#B5533C]'}`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile filters panel */}
            {mobileFiltersOpen && (
              <div className="md:hidden mb-6 p-4 bg-white rounded-sm border border-[#e8e0d8]">
                <FilterPanel />
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {query && (
                  <FilterChip label={`"${query}"`} onRemove={() => { setQuery(''); setInputValue(''); setPage(1); }} />
                )}
                {filterPeriod && (
                  <FilterChip
                    label={getTranslation(periods.find(p => String(p.id) === filterPeriod)?.translations || [], lang)?.name || filterPeriod}
                    onRemove={() => { setFilterPeriod(''); setPage(1); }}
                  />
                )}
                {filterMaterial && (
                  <FilterChip
                    label={getTranslation(materials.find(m => String(m.id) === filterMaterial)?.translations || [], lang)?.name || filterMaterial}
                    onRemove={() => { setFilterMaterial(''); setPage(1); }}
                  />
                )}
                {filterPlace && (
                  <FilterChip
                    label={getTranslation(places.find(p => String(p.id) === filterPlace)?.translations || [], lang)?.name || filterPlace}
                    onRemove={() => { setFilterPlace(''); setPage(1); }}
                  />
                )}
                {filterUsage && (
                  <FilterChip
                    label={getTranslation(usages.find(u => String(u.id) === filterUsage)?.translations || [], lang)?.name || filterUsage}
                    onRemove={() => { setFilterUsage(''); setPage(1); }}
                  />
                )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <LoadingSpinner message={t('explore.loading')} />
            ) : error ? (
              <ErrorState message={error} onRetry={loadExhibits} />
            ) : exhibits.length === 0 ? (
              <EmptyState
                title={t('explore.no_results')}
                description={t('explore.no_results.desc')}
              />
            ) : (
              <>
                <div className={view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 card-stagger'
                  : 'flex flex-col gap-3 card-stagger'
                }>
                  {exhibits.map(exhibit => (
                    <ExhibitCard key={exhibit.id} exhibit={exhibit} view={view} />
                  ))}
                </div>
                <Pagination currentPage={page} lastPage={totalPages} onPage={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-body font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
        {label}
      </h4>
      <div className="space-y-1">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={label}
            value=""
            checked={value === ''}
            onChange={() => onChange('')}
            className="accent-[#B5533C]"
          />
          <span className="text-sm font-body group-hover:text-[#B5533C] transition-colors" style={{ color: value === '' ? 'var(--terracotta)' : 'var(--charcoal)' }}>
            Όλα
          </span>
        </label>
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[#B5533C]"
            />
            <span className="text-sm font-body group-hover:text-[#B5533C] transition-colors" style={{ color: value === opt.value ? 'var(--terracotta)' : 'var(--charcoal)' }}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-body font-medium rounded-sm border border-[#B5533C]/40 bg-[#FAF7F2]" style={{ color: 'var(--terracotta)' }}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X size={12} />
      </button>
    </span>
  );
}
