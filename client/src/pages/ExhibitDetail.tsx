/**
 * DiPlaMus Archive — Exhibit Detail Page
 * Design: Contemporary Museum Digital
 * Features: Media gallery, 3D viewer, metadata, CIDOC data
 */
import { useState, useEffect } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Box, Image as ImageIcon, Video, FileText, Download, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api, NavigationPoint, MediaFile, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner, ErrorState } from '@/components/LoadingState';
import ModelViewer3D from '@/components/ModelViewer3D';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80';

export default function ExhibitDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const [exhibit, setExhibit] = useState<NavigationPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'metadata' | 'cidoc'>('media');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [active3D, setActive3D] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getNavigationPoint(Number(id))
      .then(res => {
        setExhibit(res.data);
        // Auto-activate first 3D model if available
        const model = res.data.files?.find(f => f.type === '3d');
        if (model) setActive3D(model.uri);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) return <div className="min-h-screen" style={{ background: 'var(--cream)' }}><LoadingSpinner /></div>;
  if (error || !exhibit) return <div className="min-h-screen" style={{ background: 'var(--cream)' }}><ErrorState message={error || undefined} /></div>;

  const translation = getTranslation(exhibit.translations, lang);
  const title = translation?.name || exhibit.title || 'Αδιευκρίνιστο';
  const description = translation?.description || '';
  const shortDesc = translation?.shortDescription || '';

  const images = exhibit.files?.filter(f => f.type === 'image') || [];
  const videos = exhibit.files?.filter(f => f.type === 'video') || [];
  const models3D = exhibit.files?.filter(f => f.type === '3d') || [];
  const mainImage = getImageUrl(exhibit.image, 'original') || (images[0]?.uri) || PLACEHOLDER;

  const allImages = [
    ...(exhibit.image?.uri ? [exhibit.image.uri] : []),
    ...images.map(f => f.uri),
  ].filter(Boolean);

  const metaItems = [
    { label: t('exhibit.material'), values: exhibit.materials?.map(m => getTranslation(m.translations, lang)?.name || m.name) },
    { label: t('exhibit.period'), values: exhibit.periods?.map(p => getTranslation(p.translations, lang)?.name || p.name) },
    { label: t('exhibit.place'), values: exhibit.places?.map(p => getTranslation(p.translations, lang)?.name || p.name) },
    { label: t('exhibit.usage'), values: exhibit.usages?.map(u => getTranslation(u.translations, lang)?.name || u.name) },
  ].filter(item => item.values && item.values.length > 0);

  return (
    <div className="page-enter min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="container py-8">
        {/* Breadcrumb */}
        <Link href="/explore">
          <button className="flex items-center gap-2 text-sm font-body mb-8 hover:text-[#B5533C] transition-colors" style={{ color: 'var(--muted-foreground)' }}>
            <ArrowLeft size={16} />
            {t('exhibit.back')}
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Media */}
          <div className="lg:col-span-3">
            {/* Main image / 3D viewer */}
            {active3D ? (
              <div style={{ height: '420px' }}>
                <ModelViewer3D
                  src={active3D}
                  alt={title}
                  poster={mainImage}
                  className="w-full h-full rounded-sm"
                />
              </div>
            ) : (
              <div
                className="relative w-full rounded-sm overflow-hidden bg-[#F5F0E8] cursor-zoom-in"
                style={{ aspectRatio: '4/3' }}
                onClick={() => setLightboxIndex(0)}
              >
                <img
                  src={mainImage}
                  alt={title}
                  className="w-full h-full object-contain"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </div>
            )}

            {/* Thumbnails */}
            {(allImages.length > 1 || models3D.length > 0) && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {/* 3D model thumbnails */}
                {models3D.map((model, i) => (
                  <button
                    key={`3d-${i}`}
                    onClick={() => { setActive3D(model.uri); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm border-2 overflow-hidden flex items-center justify-center transition-colors ${active3D === model.uri ? 'border-[#B5533C]' : 'border-[#e8e0d8] hover:border-[#B5533C]/50'}`}
                    style={{ background: '#F5F0E8' }}
                  >
                    <Box size={20} style={{ color: 'var(--terracotta)' }} />
                  </button>
                ))}
                {/* Image thumbnails */}
                {allImages.map((imgUrl, i) => (
                  <button
                    key={`img-${i}`}
                    onClick={() => { setActive3D(null); setLightboxIndex(i); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm border-2 overflow-hidden transition-colors ${!active3D && lightboxIndex === i ? 'border-[#B5533C]' : 'border-[#e8e0d8] hover:border-[#B5533C]/50'}`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--charcoal)' }}>
                  {t('exhibit.videos')}
                </h3>
                <div className="space-y-3">
                  {videos.map((video, i) => (
                    <video
                      key={i}
                      src={video.uri}
                      controls
                      className="w-full rounded-sm"
                      style={{ maxHeight: 360 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-2">
            {/* ID badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="meta-badge">#{exhibit.id}</span>
              {models3D.length > 0 && <span className="meta-badge flex items-center gap-1"><Box size={10} />3D</span>}
              {videos.length > 0 && <span className="meta-badge flex items-center gap-1"><Video size={10} />Video</span>}
            </div>

            {/* Title */}
            <h1 className="font-display font-semibold text-2xl md:text-3xl mb-3 leading-tight" style={{ color: 'var(--charcoal)' }}>
              {title}
            </h1>

            {/* Short description */}
            {shortDesc && (
              <p className="text-base font-body leading-relaxed mb-4" style={{ color: '#4a4540' }}>
                {shortDesc}
              </p>
            )}

            {/* Divider */}
            <div className="divider-terracotta w-12 my-5" />

            {/* Metadata */}
            {metaItems.length > 0 && (
              <div className="space-y-4 mb-6">
                {metaItems.map(item => (
                  <div key={item.label}>
                    <dt className="text-xs font-body font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
                      {item.label}
                    </dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {item.values!.map((v, i) => (
                        <span key={i} className="meta-badge">{v}</span>
                      ))}
                    </dd>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-[#e8e0d8] mb-5">
              <div className="flex gap-0">
                {[
                  { key: 'media', label: t('exhibit.media') },
                  { key: 'metadata', label: t('exhibit.metadata') },
                  ...(exhibit.cidoc ? [{ key: 'cidoc', label: t('exhibit.cidoc') }] : []),
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 text-sm font-body font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-[#B5533C] text-[#B5533C]'
                        : 'border-transparent text-[#6b6560] hover:text-[#B5533C]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'media' && (
              <div className="space-y-3">
                <div className="text-sm font-body" style={{ color: 'var(--muted-foreground)' }}>
                  {images.length > 0 && <p>{images.length} {t('exhibit.photos')}</p>}
                  {videos.length > 0 && <p>{videos.length} {t('exhibit.videos')}</p>}
                  {models3D.length > 0 && <p>{models3D.length} {t('exhibit.model3d')}</p>}
                  {images.length === 0 && videos.length === 0 && models3D.length === 0 && (
                    <p>—</p>
                  )}
                </div>
                {/* Download links for 3D models */}
                {models3D.map((model, i) => (
                  <a
                    key={i}
                    href={model.uri}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-body font-medium px-4 py-2 rounded-sm border border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C] transition-colors"
                    style={{ color: 'var(--charcoal)' }}
                  >
                    <Download size={14} />
                    {t('exhibit.download')} 3D Model ({i + 1})
                  </a>
                ))}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div className="space-y-3">
                <MetaRow label="ID" value={String(exhibit.id)} />
                <MetaRow label={t('exhibit.hall')} value={exhibit.hall ? getTranslation(exhibit.hall.translations || [], lang)?.name || '—' : '—'} />
                <MetaRow label="Created" value={exhibit.createdAt?.split(' ')[0] || '—'} />
                <MetaRow label="Updated" value={exhibit.updatedAt?.split(' ')[0] || '—'} />
                {description && (
                  <div>
                    <dt className="text-xs font-body font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
                      Description
                    </dt>
                    <dd className="text-sm font-body leading-relaxed" style={{ color: 'var(--charcoal)' }}>
                      {description}
                    </dd>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cidoc' && exhibit.cidoc && (
              <div className="bg-[#F5F0E8] rounded-sm p-4 overflow-auto max-h-80">
                <pre className="text-xs font-mono" style={{ color: 'var(--charcoal)' }}>
                  {JSON.stringify(exhibit.cidoc, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={24} />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          <img
            src={allImages[lightboxIndex]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightboxIndex < allImages.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight size={32} />
            </button>
          )}
          <div className="absolute bottom-4 text-white/50 text-sm font-body">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="text-xs font-body font-semibold tracking-wider uppercase flex-shrink-0 w-24 pt-0.5" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
        {label}
      </dt>
      <dd className="text-sm font-body" style={{ color: 'var(--charcoal)' }}>{value}</dd>
    </div>
  );
}
