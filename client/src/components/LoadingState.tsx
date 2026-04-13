/**
 * DiPlaMus Archive — Loading & Error State Components
 */
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LoadingSpinner({ message }: { message?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--terracotta)' }} />
      <p className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
        {message || t('common.loading')}
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle size={32} style={{ color: 'var(--terracotta)' }} />
      <p className="text-sm font-body text-center max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
        {message || t('common.error')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-body font-medium rounded-sm border border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C] transition-colors"
        >
          <RefreshCw size={14} />
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      {icon && <div style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>{icon}</div>}
      <h3 className="font-display font-semibold text-xl" style={{ color: 'var(--charcoal)' }}>{title}</h3>
      {description && (
        <p className="text-sm font-body max-w-xs" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="divider-terracotta w-12 mb-4" />
      <h1 className="font-display font-semibold text-3xl md:text-4xl" style={{ color: 'var(--charcoal)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base font-body" style={{ color: 'var(--muted-foreground)' }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export function Pagination({
  currentPage,
  lastPage,
  onPage,
}: {
  currentPage: number;
  lastPage: number;
  onPage: (page: number) => void;
}) {
  const { t } = useLanguage();
  if (lastPage <= 1) return null;

  const pages: (number | '...')[] = [];
  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < lastPage - 2) pages.push('...');
    pages.push(lastPage);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-body border border-[#e8e0d8] rounded-sm disabled:opacity-40 hover:border-[#B5533C] hover:text-[#B5533C] transition-colors disabled:cursor-not-allowed"
      >
        {t('common.prev')}
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#a09890]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`w-9 h-9 text-sm font-body rounded-sm border transition-colors ${
              p === currentPage
                ? 'bg-[#B5533C] text-white border-[#B5533C]'
                : 'border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C]'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="px-3 py-2 text-sm font-body border border-[#e8e0d8] rounded-sm disabled:opacity-40 hover:border-[#B5533C] hover:text-[#B5533C] transition-colors disabled:cursor-not-allowed"
      >
        {t('common.next')}
      </button>
    </div>
  );
}
