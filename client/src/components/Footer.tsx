/**
 * DiPlaMus Archive — Footer Component
 * Design: Contemporary Museum Digital
 */
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#e8e0d8]" style={{ background: 'var(--charcoal)', color: '#d4cfc9' }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: 'var(--terracotta)' }}>
                <span className="text-white font-display font-bold text-sm">D</span>
              </div>
              <div>
                <div className="font-display font-semibold text-lg text-white leading-tight">DiPlaMus</div>
                <div className="text-xs font-body tracking-widest uppercase" style={{ color: 'var(--terracotta-light)', letterSpacing: '0.12em' }}>Archive</div>
              </div>
            </div>
            <p className="text-sm font-body leading-relaxed" style={{ color: '#a09890' }}>
              Ψηφιακό αρχείο τεκμηρίωσης μουσειακών εκθεμάτων βασισμένο στο πρότυπο CIDOC-CRM.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-base">Πλοήγηση</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: t('nav.home') },
                { href: '/explore', label: t('nav.explore') },
                { href: '/collections', label: t('nav.collections') },
                { href: '/tours', label: t('nav.tours') },
                { href: '/halls', label: t('nav.halls') },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-body transition-colors hover:text-white"
                    style={{ color: '#a09890' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-base">Πληροφορίες</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://diplamus.app-host.eu" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-body transition-colors hover:text-white"
                  style={{ color: '#a09890' }}
                >
                  diplamus.app-host.eu
                </a>
              </li>
              <li>
                <span className="text-sm font-body" style={{ color: '#a09890' }}>
                  CIDOC-CRM Standard
                </span>
              </li>
              <li>
                <span className="text-sm font-body" style={{ color: '#a09890' }}>
                  API v1.11.0
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body" style={{ color: '#6b6560' }}>
            © {year} DiPlaMus. {t('footer.rights')}.
          </p>
          <p className="text-xs font-body" style={{ color: '#6b6560' }}>
            {t('footer.powered')}
          </p>
        </div>
      </div>
    </footer>
  );
}
