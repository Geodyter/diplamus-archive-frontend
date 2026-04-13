/**
 * DiPlaMus Archive — Tours Page
 * Design: Contemporary Museum Digital
 */
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, MapPin, Layers } from 'lucide-react';
import { api, Tour, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner, ErrorState, EmptyState, PageHeader } from '@/components/LoadingState';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80';

export default function Tours() {
  const { lang, t } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTours({ pageSize: 50 })
      .then(res => setTours(res.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-10">
        <PageHeader title={t('tours.title')} subtitle={t('tours.subtitle')} />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : tours.length === 0 ? (
          <EmptyState
            title={t('tours.empty')}
            icon={<MapPin size={48} />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 card-stagger">
            {tours.map(tour => {
              const name = getTranslation(tour.translations, lang)?.name || tour.name;
              const img = getImageUrl(tour.image, 'large') || PLACEHOLDER;
              const hallCount = tour.halls?.length || 0;
              return (
                <Link key={tour.id} href={`/tours/${tour.id}`}>
                  <article className="exhibit-card bg-white rounded-sm border border-[#e8e0d8] overflow-hidden cursor-pointer group">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.6) 0%, transparent 60%)' }} />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-xl mb-2" style={{ color: 'var(--charcoal)' }}>{name}</h3>
                      <div className="flex items-center gap-4 text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                        {hallCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers size={14} />
                            {hallCount} {t('tours.halls')}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-sm font-body font-medium" style={{ color: 'var(--terracotta)' }}>
                        {t('tours.start')} <ArrowRight size={14} />
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
