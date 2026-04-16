/**
 * DiPlaMus Archive — Header Component
 * Design: Contemporary Museum Digital
 * Sticky header with logo, nav, language switcher, search
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/explore', label: t('nav.explore') },
    { href: '/collections', label: t('nav.collections') },
    { href: '/halls', label: t('nav.halls') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e8e0d8]'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/106430101/F3kxnRmej5pvuShZNciPcy/diplamus-logo-official_b35ca23f.png"
                alt="DiPlaMus Archive"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-body font-medium rounded-sm transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-[#B5533C] bg-[#FAF7F2]'
                      : 'text-[#2C2C2C] hover:text-[#B5533C] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-sm text-[#2C2C2C] hover:text-[#B5533C] hover:bg-[#FAF7F2] transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* Language switcher */}
              <button
                onClick={() => setLang(lang === 'el' ? 'en' : 'el')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-body font-medium border border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C] transition-all"
                style={{ color: 'var(--charcoal)' }}
              >
                <Globe size={14} />
                <span>{lang === 'el' ? 'EN' : 'ΕΛ'}</span>
              </button>

              {/* Mobile menu */}
              <button
                className="md:hidden p-2 rounded-sm text-[#2C2C2C] hover:text-[#B5533C] transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar (expandable) */}
          {searchOpen && (
            <div className="pb-3 border-t border-[#e8e0d8] pt-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('explore.search.placeholder')}
                  autoFocus
                  className="flex-1 px-4 py-2 text-sm border border-[#e8e0d8] rounded-sm bg-[#FAF7F2] focus:outline-none focus:border-[#B5533C] font-body"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#B5533C] hover:bg-[#9a4432] text-white font-body"
                >
                  {t('explore.search.button')}
                </Button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-[#2C2C2C] hover:text-[#B5533C]"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-16 left-0 right-0 bg-white border-b border-[#e8e0d8] shadow-lg">
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 text-sm font-body font-medium rounded-sm transition-colors ${
                    isActive(link.href)
                      ? 'text-[#B5533C] bg-[#FAF7F2]'
                      : 'text-[#2C2C2C] hover:text-[#B5533C] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />
    </>
  );
}
