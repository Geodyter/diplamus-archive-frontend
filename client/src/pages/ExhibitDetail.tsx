/**
 * DiPlaMus Archive — Exhibit Detail Page
 * Design: Contemporary Museum Digital
 * Features: Media gallery, 3D viewer (GLB), full metadata, CIDOC-compatible fields
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'wouter';
import {
  ArrowLeft, Box, Image as ImageIcon, Video,
  Download, ChevronLeft, ChevronRight, X, FileText, ZoomIn
} from 'lucide-react';
import {
  api, NavigationPoint, MediaFile,
  getTranslation, getImageUrl, getFileUrl, getFileThumbnail, getTaxonomyName
} from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSpinner, ErrorState } from '@/components/LoadingState';
import ModelViewer3D from '@/components/ModelViewer3D';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80';

// ---- Sub-components ----

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-body font-semibold tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
        {label}
      </dt>
      <dd className="text-sm font-body leading-relaxed" style={{ color: 'var(--charcoal)' }}>
        {value}
      </dd>
    </div>
  );
}

function MetaBadgeRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-body font-semibold tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
        {label}
      </dt>
      <dd>
        <span className="meta-badge">{value}</span>
      </dd>
    </div>
  );
}

// ---- Main Component ----

export default function ExhibitDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const [exhibit, setExhibit] = useState<NavigationPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'metadata' | 'description'>('description');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [active3D, setActive3D] = useState<string | null>(null);
  const [activeMainImage, setActiveMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.getNavigationPoint(Number(id))
      .then(res => {
        const data = res.data;
        setExhibit(data);
        // Auto-activate first 3D model if available
        const model = data.files?.find(f => f.file_category === '3d');
        if (model) {
          setActive3D(getFileUrl(model));
        }
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setIsLoading(false));
  }, [id, t]);

  if (isLoading) return <div className="min-h-screen" style={{ background: 'var(--cream)' }}><LoadingSpinner /></div>;
  if (error || !exhibit) return <div className="min-h-screen" style={{ background: 'var(--cream)' }}><ErrorState message={error || undefined} /></div>;

  // ---- Data extraction ----
  const translation = getTranslation(exhibit.translations || [], lang);
  const title = translation?.title || exhibit.title || 'Αδιευκρίνιστο';
  // Description: from translation.text or top-level text
  const description = translation?.text || exhibit.text || '';

  // Files by category
  const photoFiles = exhibit.files?.filter(f => f.file_category === 'photo' || f.file_extension?.match(/^(jpg|jpeg|png|webp|gif)$/i)) || [];
  const videoFiles = exhibit.files?.filter(f => f.file_category === 'video' || f.file_extension?.match(/^(mp4|webm|mov|avi)$/i)) || [];
  const model3DFiles = exhibit.files?.filter(f => f.file_category === '3d' || f.file_extension?.match(/^(glb|gltf|obj|fbx)$/i)) || [];
  const docFiles = exhibit.files?.filter(f => f.file_category === 'document' || f.file_extension?.match(/^(pdf|doc|docx)$/i)) || [];

  // Main image
  const mainImageUrl = getImageUrl(exhibit.image, 'original') || PLACEHOLDER;
  const currentMainImage = activeMainImage || mainImageUrl;

  // All photo URLs for lightbox (main + photo files)
  const allPhotoUrls: string[] = [
    ...(exhibit.image?.uri ? [exhibit.image.uri] : []),
    ...photoFiles.map(f => getFileUrl(f) || '').filter(Boolean),
  ];

  // Metadata fields
  const collectionName = getTaxonomyName(exhibit.period, lang);
  const acquisitionName = getTaxonomyName(exhibit.usage, lang);
  const statusName = getTaxonomyName(exhibit.reservationStatus, lang);
  const primaryLocation = getTaxonomyName(exhibit.firstPlace, lang);
  const secondaryLocation = getTaxonomyName(exhibit.secondPlace, lang);
  // materials is always an array; material (singular) is a legacy single-object field
  const materialsArr = Array.isArray(exhibit.materials) && exhibit.materials.length > 0
    ? exhibit.materials
    : (exhibit.material && !Array.isArray(exhibit.material) ? [exhibit.material] : []);
  const materialNames = materialsArr
    .map((m: any) => getTaxonomyName(m, lang))
    .filter((n: string | null) => n && n !== '—') as string[];
  const materialNamesStr = materialNames.join(', ');

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
          {/* ── LEFT: Media Column ── */}
          <div className="lg:col-span-3">

            {/* Main viewer: 3D or Image */}
            {active3D ? (
              <div style={{ height: '460px', borderRadius: '2px', overflow: 'hidden' }}>
                <ModelViewer3D
                  src={active3D}
                  alt={title}
                  poster={mainImageUrl}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="relative w-full rounded-sm overflow-hidden cursor-zoom-in group"
                style={{ aspectRatio: '4/3', background: '#F0EBE3' }}
                onClick={() => {
                  const idx = allPhotoUrls.indexOf(currentMainImage);
                  setLightboxIndex(idx >= 0 ? idx : 0);
                }}
              >
                <img
                  src={currentMainImage}
                  alt={title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 text-white rounded-full p-1.5">
                    <ZoomIn size={16} />
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            {(allPhotoUrls.length > 1 || model3DFiles.length > 0) && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {/* 3D model thumbnails */}
                {model3DFiles.map((model, i) => {
                  const modelUrl = getFileUrl(model);
                  return (
                    <button
                      key={`3d-${i}`}
                      onClick={() => { setActive3D(modelUrl); setActiveMainImage(null); }}
                      title={model.title || '3D Model'}
                      className={`flex-shrink-0 w-16 h-16 rounded-sm border-2 overflow-hidden flex flex-col items-center justify-center gap-1 transition-colors ${active3D === modelUrl ? 'border-[#B5533C] bg-[#B5533C]/10' : 'border-[#e8e0d8] hover:border-[#B5533C]/50 bg-[#F5F0E8]'}`}
                    >
                      <Box size={18} style={{ color: 'var(--terracotta)' }} />
                      <span className="text-[9px] font-body font-semibold" style={{ color: 'var(--terracotta)' }}>3D</span>
                    </button>
                  );
                })}
                {/* Photo thumbnails */}
                {allPhotoUrls.map((imgUrl, i) => (
                  <button
                    key={`img-${i}`}
                    onClick={() => { setActive3D(null); setActiveMainImage(imgUrl); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-sm border-2 overflow-hidden transition-colors ${!active3D && currentMainImage === imgUrl ? 'border-[#B5533C]' : 'border-[#e8e0d8] hover:border-[#B5533C]/50'}`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            )}

            {/* Videos */}
            {videoFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--charcoal)' }}>
                  {t('exhibit.videos')}
                </h3>
                <div className="space-y-3">
                  {videoFiles.map((video, i) => {
                    const videoUrl = getFileUrl(video);
                    return videoUrl ? (
                      <video key={i} src={videoUrl} controls className="w-full rounded-sm" style={{ maxHeight: 360 }} />
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Info Column ── */}
          <div className="lg:col-span-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="meta-badge">#{exhibit.code || exhibit.id}</span>
              {model3DFiles.length > 0 && <span className="meta-badge flex items-center gap-1"><Box size={10} />3D</span>}
              {videoFiles.length > 0 && <span className="meta-badge flex items-center gap-1"><Video size={10} />Video</span>}
              {exhibit.validated === 1 && <span className="meta-badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>✓ Validated</span>}
            </div>

            {/* Title */}
            <h1 className="font-display font-semibold text-2xl md:text-3xl mb-2 leading-tight" style={{ color: 'var(--charcoal)' }}>
              {title}
            </h1>

            {/* Collection badge */}
            {collectionName !== '—' && (
              <p className="text-sm font-body mb-3" style={{ color: 'var(--terracotta)' }}>
                {collectionName}
              </p>
            )}

            {/* Divider */}
            <div className="divider-terracotta w-12 my-4" />

            {/* Quick meta strip */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {exhibit.monumentName && <MetaRow label={lang === 'el' ? 'Χρονολογία' : 'Date'} value={exhibit.monumentName} />}
              {materialNames.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs font-body font-semibold tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
                    {lang === 'el' ? 'Υλικό' : 'Material'}
                  </dt>
                  <dd className="flex flex-wrap gap-1">
                    {materialNames.map((name, i) => (
                      <span key={i} className="meta-badge">{name}</span>
                    ))}
                  </dd>
                </div>
              )}
              {exhibit.registration_number && <MetaRow label={lang === 'el' ? 'Κατασκευαστής' : 'Manufacturer'} value={exhibit.registration_number} />}
              {statusName !== '—' && <MetaRow label={lang === 'el' ? 'Κατάσταση' : 'Condition'} value={statusName} />}
            </div>

            {/* Tabs */}
            <div className="border-b border-[#e8e0d8] mb-5">
              <div className="flex gap-0">
                {[
                  { key: 'description', label: lang === 'el' ? 'Περιγραφή' : 'Description' },
                  { key: 'media', label: t('exhibit.media') },
                  { key: 'metadata', label: t('exhibit.metadata') },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'media' | 'metadata' | 'description')}
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

            {/* ── Tab: Description ── */}
            {activeTab === 'description' && (
              <div>
                {description ? (
                  <div
                    className="text-sm font-body leading-relaxed whitespace-pre-line"
                    style={{ color: '#4a4540' }}
                    dangerouslySetInnerHTML={{ __html: description.replace(/\r\n/g, '<br/>') }}
                  />
                ) : (
                  <p className="text-sm font-body italic" style={{ color: 'var(--muted-foreground)' }}>
                    {lang === 'el' ? 'Δεν υπάρχει περιγραφή.' : 'No description available.'}
                  </p>
                )}
                {exhibit.inscription && (
                  <div className="mt-4 p-3 rounded-sm border border-[#e8e0d8]" style={{ background: '#faf7f2' }}>
                    <p className="text-xs font-body font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>
                      {lang === 'el' ? 'Επιγραφή' : 'Inscription'}
                    </p>
                    <p className="text-xs font-body whitespace-pre-line" style={{ color: '#4a4540' }}>{exhibit.inscription}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Media ── */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                {/* Photo count */}
                {photoFiles.length > 0 && (
                  <div>
                    <p className="text-xs font-body font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      {lang === 'el' ? 'Φωτογραφίες' : 'Photos'} ({photoFiles.length + (exhibit.image?.uri ? 1 : 0)})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Main image thumbnail */}
                      {exhibit.image?.uri && (
                        <button
                          onClick={() => { setActive3D(null); setActiveMainImage(exhibit.image!.uri!); }}
                          className="aspect-square rounded-sm overflow-hidden border-2 border-[#e8e0d8] hover:border-[#B5533C] transition-colors"
                        >
                          <img src={exhibit.image.uri} alt={title} className="w-full h-full object-cover" />
                        </button>
                      )}
                      {photoFiles.map((file, i) => {
                        const thumb = getFileThumbnail(file) || getFileUrl(file);
                        return thumb ? (
                          <button
                            key={i}
                            onClick={() => { setActive3D(null); setActiveMainImage(getFileUrl(file)); }}
                            className="aspect-square rounded-sm overflow-hidden border-2 border-[#e8e0d8] hover:border-[#B5533C] transition-colors"
                            title={file.title}
                          >
                            <img src={thumb} alt={file.title} className="w-full h-full object-cover" />
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* 3D Models */}
                {model3DFiles.length > 0 && (
                  <div>
                    <p className="text-xs font-body font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      {lang === 'el' ? 'Τρισδιάστατα Μοντέλα' : '3D Models'} ({model3DFiles.length})
                    </p>
                    <div className="space-y-2">
                      {model3DFiles.map((model, i) => {
                        const modelUrl = getFileUrl(model);
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-sm border border-[#e8e0d8]" style={{ background: '#faf7f2' }}>
                            <div className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: '#B5533C20' }}>
                              <Box size={18} style={{ color: 'var(--terracotta)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-body font-medium truncate" style={{ color: 'var(--charcoal)' }}>{model.title}</p>
                              <p className="text-xs font-body" style={{ color: 'var(--muted-foreground)' }}>
                                {model.file_extension?.toUpperCase()} · {model.file_size ? `${(Number(model.file_size) / 1024 / 1024).toFixed(1)} MB` : ''}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {modelUrl && (
                                <button
                                  onClick={() => setActive3D(modelUrl)}
                                  className="text-xs px-2 py-1 rounded-sm font-body font-medium transition-colors"
                                  style={{ background: 'var(--terracotta)', color: 'white' }}
                                >
                                  {lang === 'el' ? 'Προβολή' : 'View'}
                                </button>
                              )}
                              {modelUrl && (
                                <a
                                  href={modelUrl}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs px-2 py-1 rounded-sm font-body font-medium border border-[#e8e0d8] hover:border-[#B5533C] transition-colors"
                                  style={{ color: 'var(--charcoal)' }}
                                >
                                  <Download size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {docFiles.length > 0 && (
                  <div>
                    <p className="text-xs font-body font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                      {lang === 'el' ? 'Έγγραφα' : 'Documents'} ({docFiles.length})
                    </p>
                    {docFiles.map((doc, i) => {
                      const docUrl = getFileUrl(doc);
                      return docUrl ? (
                        <a
                          key={i}
                          href={docUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-body font-medium px-3 py-2 rounded-sm border border-[#e8e0d8] hover:border-[#B5533C] hover:text-[#B5533C] transition-colors mb-2"
                          style={{ color: 'var(--charcoal)' }}
                        >
                          <FileText size={14} />
                          {doc.title || doc.file_name}
                        </a>
                      ) : null;
                    })}
                  </div>
                )}

                {!photoFiles.length && !model3DFiles.length && !videoFiles.length && !docFiles.length && !exhibit.image?.uri && (
                  <p className="text-sm font-body italic" style={{ color: 'var(--muted-foreground)' }}>
                    {lang === 'el' ? 'Δεν υπάρχουν πολυμέσα.' : 'No media available.'}
                  </p>
                )}
              </div>
            )}

            {/* ── Tab: Metadata ── */}
            {activeTab === 'metadata' && (
              <div className="space-y-3">
                <MetaRow label={lang === 'el' ? 'Κωδικός' : 'Code'} value={exhibit.code} />
                <MetaRow label={lang === 'el' ? 'Κατασκευαστής / Δημιουργός' : 'Manufacturer / Creator'} value={exhibit.registration_number} />
                <MetaRow label={lang === 'el' ? 'Χρονολογία' : 'Date / Era'} value={exhibit.monumentName} />
                <MetaBadgeRow label={lang === 'el' ? 'Συλλογή' : 'Collection'} value={collectionName !== '—' ? collectionName : undefined} />
                <MetaBadgeRow label={lang === 'el' ? 'Τρόπος Απόκτησης' : 'Acquisition'} value={acquisitionName !== '—' ? acquisitionName : undefined} />
                <MetaBadgeRow label={lang === 'el' ? 'Κατάσταση Διατήρησης' : 'Condition'} value={statusName !== '—' ? statusName : undefined} />
                {materialNames.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-body font-semibold tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>
                      {lang === 'el' ? 'Υλικό' : 'Material'}
                    </dt>
                    <dd className="flex flex-wrap gap-1">
                      {materialNames.map((name, i) => (
                        <span key={i} className="meta-badge">{name}</span>
                      ))}
                    </dd>
                  </div>
                )}
                <MetaRow label={lang === 'el' ? 'Πρωτεύουσα Τοποθεσία' : 'Primary Location'} value={primaryLocation !== '—' ? primaryLocation : undefined} />
                <MetaRow label={lang === 'el' ? 'Δευτερεύουσα Τοποθεσία' : 'Secondary Location'} value={secondaryLocation !== '—' ? secondaryLocation : undefined} />
                {(exhibit.height || exhibit.width || exhibit.length) && (
                  <MetaRow
                    label={lang === 'el' ? 'Διαστάσεις (Υ×Π×Μ cm)' : 'Dimensions (H×W×L cm)'}
                    value={[exhibit.height, exhibit.width, exhibit.length].filter(Boolean).join(' × ')}
                  />
                )}
                <MetaRow label={lang === 'el' ? 'Σχόλια Διαστάσεων' : 'Dimension Notes'} value={exhibit.dimensionComments} />
                <MetaRow label={lang === 'el' ? 'Χώρα Προέλευσης' : 'Country of Origin'} value={exhibit.location} />
                <MetaRow label={lang === 'el' ? 'Άδεια / Πνευματικά' : 'License / Copyright'} value={exhibit.conservation} />
                {exhibit.publications && <MetaRow label={lang === 'el' ? 'Δημοσιεύσεις' : 'Publications'} value={exhibit.publications} />}
                {exhibit.otherObservations && <MetaRow label={lang === 'el' ? 'Άλλες Παρατηρήσεις' : 'Other Observations'} value={exhibit.otherObservations} />}
                <div className="pt-2 border-t border-[#e8e0d8]">
                  <MetaRow label={lang === 'el' ? 'Αίθουσα' : 'Hall'} value={exhibit.hall ? (getTranslation(exhibit.hall.translations || [], lang)?.title || exhibit.hall.title || '—') : '—'} />
                  <MetaRow label="ID" value={String(exhibit.id)} />
                  <MetaRow label={lang === 'el' ? 'Δημιουργήθηκε' : 'Created'} value={exhibit.createdAt?.split(' ')[0]} />
                  <MetaRow label={lang === 'el' ? 'Ενημερώθηκε' : 'Updated'} value={exhibit.updatedAt?.split(' ')[0]} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && allPhotoUrls.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={28} />
          </button>
          {allPhotoUrls.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 p-2"
                onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + allPhotoUrls.length) % allPhotoUrls.length); }}
              >
                <ChevronLeft size={36} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 p-2"
                onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % allPhotoUrls.length); }}
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}
          <img
            src={allPhotoUrls[lightboxIndex]}
            alt={title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-body">
            {lightboxIndex + 1} / {allPhotoUrls.length}
          </div>
        </div>
      )}
    </div>
  );
}
