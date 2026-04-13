/**
 * DiPlaMus Archive — Collections Page (Periods)
 * Design: Contemporary Museum Digital
 */
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, BookOpen } from 'lucide-react';
import { api, Period, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner, ErrorState, EmptyState, PageHeader } from '@/components/LoadingState';

export default function Collections() {
  const { lang, t } = useLanguage();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPeriods({ pageSize: 100 })
      .then(res => setPeriods(res.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-10">
        <PageHeader title={t('home.collections.title')} subtitle={t('home.collections.subtitle')} />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : periods.length === 0 ? (
          <EmptyState
            title="Δεν υπάρχουν συλλογές ακόμα"
            icon={<BookOpen size={48} />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 card-stagger">
            {periods.map(period => {
              const name = getTranslation(period.translations, lang)?.name || period.name;
              const img = getImageUrl(period.image, 'large');
              return (
                <Link key={period.id} href={`/explore?period=${period.id}`}>
                  <article className="exhibit-card relative overflow-hidden rounded-sm cursor-pointer group bg-[#e8e0d8]" style={{ aspectRatio: '4/3' }}>
                    {img ? (
                      <img
                        src={img}
                        alt={name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--cream-dark), var(--terracotta-light))' }}>
                        <BookOpen size={48} className="opacity-20 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.75) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-display font-semibold text-xl text-white leading-tight mb-2">{name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-sm font-body">
                        {t('common.view_all')} <ArrowRight size={14} />
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
