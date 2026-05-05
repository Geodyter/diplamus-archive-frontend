/**
 * DiPlaMus Archive — Home Page
 * Design: Contemporary Museum Digital
 * Sections: Hero, Stats, Collections, Materials
 */
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Box, Image as ImageIcon, BookOpen, MapPin } from 'lucide-react';
import { api, Material, Period, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const HERO_IMAGE = '/manus-storage/hero-archive_6dc18aa3.jpg';

/**
 * Fetch all pages of a paginated endpoint and return combined data array.
 * The API returns 10 items per page regardless of limit parameter.
 */
async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<{ data: T[]; meta: { last_page: number; total: number } }>
): Promise<{ data: T[]; total: number }> {
  const first = await fetcher(1);
  const lastPage = first.meta?.last_page ?? 1;
  const total = first.meta?.total ?? first.data.length;

  if (lastPage <= 1) {
    return { data: first.data, total };
  }

  // Fetch remaining pages in parallel
  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) => fetcher(i + 2))
  );

  return {
    data: [...first.data, ...rest.flatMap(r => r.data)],
    total,
  };
}

export default function Home() {
  const { lang, t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [stats, setStats] = useState({ materials: 0, periods: 0, exhibits: 0, categories: 13 });

  useEffect(() => {
    async function load() {
      // Use allSettled so a single 502/timeout doesn't crash the whole page
      const [matsResult, persResult, exhibitsResult] = await Promise.allSettled([
        // Fetch ALL materials across all pages (API returns 10 per page)
        fetchAllPages(page => api.getMaterials({ page } as any)),
        api.getPeriods({ limit: 100 }),
        api.getNavigationPoints({ limit: 1, send_ops: 1 } as any),
      ]);

      if (matsResult.status === 'fulfilled') {
        setMaterials(matsResult.value.data);
        setStats(prev => ({ ...prev, materials: matsResult.value.total }));
      } else {
        console.warn('Home: materials load failed', matsResult.reason);
      }

      if (persResult.status === 'fulfilled') {
        setPeriods(persResult.value.data);
        setStats(prev => ({ ...prev, periods: persResult.value.meta.total }));
      } else {
        console.warn('Home: periods load failed', persResult.reason);
      }

      if (exhibitsResult.status === 'fulfilled') {
        setStats(prev => ({ ...prev, exhibits: exhibitsResult.value.meta.total }));
      } else {
        console.warn('Home: exhibits count load failed', exhibitsResult.reason);
      }
    }
    load();
  }, []);

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="DiPlaMus Archive" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(250,247,242,0.97) 0%, rgba(250,247,242,0.92) 40%, rgba(250,247,242,0.5) 70%, rgba(250,247,242,0.1) 100%)' }} />
        </div>
        <div className="relative container flex items-center" style={{ minHeight: '85vh' }}>
          <div className="max-w-xl py-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8" style={{ background: 'var(--terracotta)' }} />
              <span className="text-xs font-body font-semibold tracking-widest uppercase" style={{ color: 'var(--terracotta)', letterSpacing: '0.14em' }}>
                CIDOC-CRM Documentation
              </span>
            </div>
            <h1 className="font-display font-semibold leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--charcoal)' }}>
              {t('home.hero.title')}
              <br />
              <span style={{ color: 'var(--terracotta)' }}>DiPlaMus</span>
            </h1>
            <p className="text-base md:text-lg font-body mb-8 leading-relaxed" style={{ color: '#4a4540', maxWidth: '480px' }}>
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/explore">
                <button className="flex items-center gap-2 px-6 py-3 text-sm font-body font-semibold rounded-sm text-white transition-all hover:opacity-90 active:scale-95" style={{ background: 'var(--terracotta)' }}>
                  {t('home.hero.cta')} <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/collections">
                <button className="flex items-center gap-2 px-6 py-3 text-sm font-body font-medium rounded-sm border transition-all hover:border-[#B5533C] hover:text-[#B5533C]" style={{ borderColor: '#c8c0b8', color: 'var(--charcoal)', background: 'white' }}>
                  {t('nav.collections')} <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#e8e0d8]" style={{ background: 'white' }}>
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#e8e0d8]">
            {[
              { icon: <BookOpen size={20} />, value: stats.exhibits || '—', label: t('home.stats.exhibits') },
              { icon: <ImageIcon size={20} />, value: stats.periods || '—', label: t('home.stats.collections') },
              { icon: <MapPin size={20} />, value: stats.categories, label: 'Κατηγορίες' },
              { icon: <Box size={20} />, value: stats.materials || '—', label: t('home.stats.materials') },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center md:items-start gap-1 md:px-8 first:pl-0">
                <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--terracotta)' }}>{stat.icon}</div>
                <div className="font-display font-semibold text-3xl" style={{ color: 'var(--charcoal)' }}>{stat.value}</div>
                <div className="text-xs font-body font-medium tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS (PERIODS) ── */}
      {periods.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="divider-terracotta w-10 mb-3" />
                <h2 className="font-display font-semibold text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>{t('home.collections.title')}</h2>
                <p className="mt-1 text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>{t('home.collections.subtitle')}</p>
              </div>
              <Link href="/collections">
                <span className="text-sm font-body font-medium flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--terracotta)' }}>
                  {t('common.view_all')} <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 card-stagger">
              {periods.map(period => {
                const name = getTranslation(period.translations, lang)?.name || period.name;
                const img = getImageUrl(period.image, 'large');
                return (
                  <Link key={period.id} href={`/explore?period=${period.id}`}>
                    <article className="exhibit-card relative overflow-hidden rounded-sm cursor-pointer group" style={{ aspectRatio: '16/9', background: '#e8e0d8' }}>
                      {img ? (
                        <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cream-dark), var(--terracotta-light))' }}>
                          <BookOpen size={40} className="opacity-30 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.75) 0%, transparent 60%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-display font-semibold text-lg text-white leading-tight">{name}</h3>
                        <div className="flex items-center gap-1 mt-1 text-white/70 text-xs font-body">
                          <span>{t('common.view_all')}</span> <ArrowRight size={12} />
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── MATERIALS GRID ── */}
      {materials.length > 0 && (
        <section className="py-16 md:py-20 border-t border-[#e8e0d8]" style={{ background: 'white' }}>
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="divider-terracotta w-10 mb-3" />
                <h2 className="font-display font-semibold text-2xl md:text-3xl" style={{ color: 'var(--charcoal)' }}>{t('home.materials.title')}</h2>
                <p className="mt-1 text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>{t('home.materials.subtitle')}</p>
              </div>
              <Link href="/explore">
                <span className="text-sm font-body font-medium flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--terracotta)' }}>
                  {t('common.view_all')} <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 card-stagger">
              {materials.map(mat => {
                const name = getTranslation(mat.translations, lang)?.name || mat.name;
                return (
                  <Link key={mat.id} href={`/explore?material=${mat.id}`}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[#e8e0d8] text-sm font-body font-medium cursor-pointer transition-all hover:border-[#B5533C] hover:text-[#B5533C] hover:bg-[#FAF7F2]" style={{ color: 'var(--charcoal)' }}>
                      {name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
