/**
 * DiPlaMus Archive — Halls Page
 * Design: Contemporary Museum Digital
 */
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { api, Hall, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner, ErrorState, EmptyState, PageHeader } from '@/components/LoadingState';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80';

export default function Halls() {
  const { lang, t } = useLanguage();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getHalls({ pageSize: 50 })
      .then(res => setHalls(res.data))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-10">
        <PageHeader title={t('halls.title')} subtitle={t('halls.subtitle')} />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : halls.length === 0 ? (
          <EmptyState
            title={t('halls.empty')}
            icon={<LayoutGrid size={48} />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 card-stagger">
            {halls.map(hall => {
              const name = getTranslation(hall.translations, lang)?.name || hall.name;
              const img = getImageUrl(hall.image, 'large') || PLACEHOLDER;
              const npCount = hall.navigationPoints?.length || 0;
              return (
                <Link key={hall.id} href={`/halls/${hall.id}`}>
                  <article className="exhibit-card bg-white rounded-sm border border-[#e8e0d8] overflow-hidden cursor-pointer group">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.5) 0%, transparent 60%)' }} />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--charcoal)' }}>{name}</h3>
                      {npCount > 0 && (
                        <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                          {npCount} {t('halls.exhibits')}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-sm font-body font-medium" style={{ color: 'var(--terracotta)' }}>
                        {t('halls.view')} <ArrowRight size={14} />
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
