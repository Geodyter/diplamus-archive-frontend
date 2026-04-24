/**
 * DiPlaMus Archive — Explore/Search Page
 * Design: Contemporary Museum Digital
 * Features: Faceted search (server-side), grid/list view, pagination, sort
 * Filters: Συλλογή (radio), Υλικό (checkboxes, multi-select), Κατηγορία (radio), Είδος αντικειμένου (radio, depends on Κατηγορία)
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Grid3X3, List, SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react';
import { api, NavigationPoint, Material, Period, NavigationPointCategory, getTranslation } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import ExhibitCard from '@/components/ExhibitCard';
import { LoadingSpinner, ErrorState, EmptyState, PageHeader, Pagination } from '@/components/LoadingState';

export default function Explore() {
  const { lang, t } = useLanguage();
  const [location] = useLocation();

  // Parse URL params — use window.location.search for the full query string
  const params = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  }, [location]);

  const initialQuery = params.get('q') || '';
  // Collections page passes ?period=X — maps to period_id filter
  const initialPeriod = params.get('period') || params.get('period_id') || '';

  // State
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('title');
  const [page, setPage] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState(initialPeriod);
  // Multi-material: set of selected material IDs
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  // Category filter: selected top-level category ID
  const [filterCategory, setFilterCategory] = useState('');
  // Subcategory (Είδος αντικειμένου): selected child category ID
  const [filterSubcategory, setFilterSubcategory] = useState('');
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
  // Categories: full list (top-level items have children = subcategories)
  const [allCategories, setAllCategories] = useState<NavigationPointCategory[]>([]);

  // Load taxonomy once
  useEffect(() => {
    Promise.all([
      api.getMaterials({ limit: 100 }),
      api.getPeriods({ limit: 100 }),
      // Use limit=1000 to get all categories (API uses 'limit', not 'pageSize')
      api.getCategories({ limit: 1000 }),
    ]).then(([m, p, c]) => {
      setMaterials(Array.isArray(m.data) ? m.data : []);
      setPeriods(Array.isArray(p.data) ? p.data : []);
      setAllCategories(Array.isArray(c.data) ? c.data : []);
    }).catch(console.error);
  }, []);

  // Top-level categories (those with children array)
  const topLevelCategories = useMemo(
    () => allCategories.filter(c => c.children && c.children.length > 0),
    [allCategories]
  );

  // Subcategories of the selected top-level category
  const subcategories = useMemo(() => {
    if (!filterCategory) return [];
    const parent = topLevelCategories.find(c => String(c.id) === filterCategory);
    return parent?.children || [];
  }, [filterCategory, topLevelCategories]);

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
      if (filterPeriod) apiParams.period_id = filterPeriod;

      // Multi-material: always use ?materials=X,Y,Z (works for both single and multiple)
      // NOTE: material_id has a backend bug (returns 0 results), always use materials=
      const materialsArr = Array.from(selectedMaterials);
      if (materialsArr.length > 0) {
        apiParams.materials = materialsArr.join(',');
      }

      // Category filter: use sub_category_id for subcategories, category_id for top-level
      if (filterSubcategory) {
        apiParams.sub_category_id = filterSubcategory;
      } else if (filterCategory) {
        apiParams.category_id = filterCategory;
      }

      const res = await api.getNavigationPoints(apiParams as any);
      setExhibits(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.meta?.last_page ?? 1);
      setTotalItems(res.meta?.total ?? 0);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, query, sort, filterPeriod, selectedMaterials, filterCategory, filterSubcategory, t]);

  useEffect(() => {
    loadExhibits();
  }, [loadExhibits]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedMaterials(new Set());
    setFilterPeriod('');
    setFilterCategory('');
    setFilterSubcategory('');
    setQuery('');
    setInputValue('');
    setPage(1);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(1);
  };

  const handleCategoryChange = (id: string) => {
    setFilterCategory(id);
    setFilterSubcategory(''); // reset subcategory when top-level changes
    setPage(1);
  };

  const hasActiveFilters = selectedMaterials.size > 0 || filterPeriod || filterCategory || filterSubcategory || query;

  // Safe helper: get taxonomy name without crashing if translations is not an array
  const safeName = (item: { translations?: any[]; name?: string } | undefined, langCode: string): string => {
    if (!item) return '';
    const translations = Array.isArray(item.translations) ? item.translations : [];
    const tr = getTranslation(translations, langCode);
    return tr?.name || item.name || '';
  };

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

      {/* Collections / Periods — radio */}
      {periods.length > 0 && (
        <FilterGroupRadio
          label={t('explore.filters.collection')}
          options={periods.map(p => ({ value: String(p.id), label: safeName(p, lang) || p.name }))}
          value={filterPeriod}
          onChange={v => { setFilterPeriod(v); setPage(1); }}
        />
      )}

      {/* Materials — checkboxes (multi-select) */}
      {materials.length > 0 && (
        <FilterGroupCheckbox
          label={t('explore.filters.material')}
          options={materials.map(m => ({ value: String(m.id), label: safeName(m, lang) || m.name }))}
          selected={selectedMaterials}
          onToggle={toggleMaterial}
        />
      )}

      {/* Κατηγορία — radio (top-level categories) */}
      {topLevelCategories.length > 0 && (
        <FilterGroupRadio
          label="Κατηγορία"
          options={topLevelCategories.map(c => ({ value: String(c.id), label: safeName(c, lang) || c.name }))}
          value={filterCategory}
          onChange={handleCategoryChange}
        />
      )}

      {/* Είδος αντικειμένου — radio (subcategories of selected category) */}
      {filterCategory && subcategories.length > 0 && (
        <FilterGroupRadio
          label="Είδος αντικειμένου"
          options={subcategories.map(c => ({ value: String(c.id), label: safeName(c, lang) || c.name }))}
          value={filterSubcategory}
          onChange={v => { setFilterSubcategory(v); setPage(1); }}
          indent
        />
      )}

      {/* Placeholder when category selected but no subcategories */}
      {filterCategory && subcategories.length === 0 && (
        <div>
          <h4 className="text-xs font-body font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
            Είδος αντικειμένου
          </h4>
          <p className="text-xs font-body italic" style={{ color: '#c0b8b0' }}>
            Δεν υπάρχουν υποκατηγορίες
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-10">
        <PageHeader title={t('explore.title')} subtitle={t('explore.subtitle')} />

        {/* Search bar — enabled: backend supports ?content= full-text search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09890]" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={lang === 'el' ? 'Αναζήτηση εκθεμάτων...' : 'Search exhibits...'}
              className="w-full pl-10 pr-4 py-3 text-sm border border-[#e8e0d8] rounded-sm bg-white font-body text-[#2C2C2C] focus:outline-none focus:border-[#B5533C] transition-colors"
              style={{ color: 'var(--charcoal)' }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 text-sm font-body font-semibold rounded-sm text-white transition-opacity hover:opacity-90"
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
                  <FilterChip
                    label={`"${query}"`}
                    onRemove={() => { setQuery(''); setInputValue(''); setPage(1); }}
                  />
                )}
                {filterPeriod && (
                  <FilterChip
                    label={safeName(periods.find(p => String(p.id) === filterPeriod), lang) || filterPeriod}
                    onRemove={() => { setFilterPeriod(''); setPage(1); }}
                  />
                )}
                {Array.from(selectedMaterials).map(id => (
                  <FilterChip
                    key={id}
                    label={safeName(materials.find(m => String(m.id) === id), lang) || id}
                    onRemove={() => toggleMaterial(id)}
                  />
                ))}
                {filterSubcategory && (
                  <FilterChip
                    label={safeName(subcategories.find(c => String(c.id) === filterSubcategory), lang) || filterSubcategory}
                    onRemove={() => { setFilterSubcategory(''); setPage(1); }}
                  />
                )}
                {filterCategory && !filterSubcategory && (
                  <FilterChip
                    label={safeName(topLevelCategories.find(c => String(c.id) === filterCategory), lang) || filterCategory}
                    onRemove={() => { setFilterCategory(''); setFilterSubcategory(''); setPage(1); }}
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

/** Radio-button filter group (single selection) */
function FilterGroupRadio({
  label,
  options,
  value,
  onChange,
  indent = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  indent?: boolean;
}) {
  return (
    <div className={indent ? 'pl-3 border-l-2 border-[#e8e0d8]' : ''}>
      <h4 className="text-xs font-body font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
        {indent && <ChevronRight size={12} className="inline mr-1 opacity-50" />}
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

/** Checkbox filter group (multi-selection) */
function FilterGroupCheckbox({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-body font-semibold tracking-wider uppercase mb-2" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
        {label}
      </h4>
      <div className="space-y-1">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              value={opt.value}
              checked={selected.has(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="accent-[#B5533C] rounded"
            />
            <span className="text-sm font-body group-hover:text-[#B5533C] transition-colors" style={{ color: selected.has(opt.value) ? 'var(--terracotta)' : 'var(--charcoal)' }}>
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
