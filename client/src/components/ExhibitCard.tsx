/**
 * DiPlaMus Archive — ExhibitCard Component
 * Design: Contemporary Museum Digital
 * Shows exhibit thumbnail, title, metadata badges (collection, material, media types)
 */
import { Link } from 'wouter';
import { Box, Image, Video } from 'lucide-react';
import { NavigationPoint, getTranslation, getImageUrl, getTaxonomyName } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExhibitCardProps {
  exhibit: NavigationPoint;
  view?: 'grid' | 'list';
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';

export default function ExhibitCard({ exhibit, view = 'grid' }: ExhibitCardProps) {
  const { lang } = useLanguage();
  const translation = getTranslation(exhibit.translations, lang);
  const title = translation?.title || exhibit.title || 'Αδιευκρίνιστο';
  const description = translation?.text || exhibit.text || '';
  const imageUrl = getImageUrl(exhibit.image, 'medium') || PLACEHOLDER;

  const has3D = exhibit.files?.some(f => f.file_category === '3d' || f.file_extension?.match(/^(glb|gltf)$/i));
  const hasVideo = exhibit.files?.some(f => f.file_category === 'video' || f.file_extension?.match(/^(mp4|webm|mov)$/i));
  const hasImages = exhibit.files?.some(f => f.file_category === 'photo') || exhibit.image?.uri;

  // All materials from materials array (each exhibit can have multiple)
  const materialArr = Array.isArray(exhibit.materials) && exhibit.materials.length > 0
    ? exhibit.materials
    : (exhibit.material ? [exhibit.material] : []);
  const materialNames = materialArr
    .map((m: any) => getTaxonomyName(m, lang))
    .filter((n: string | null) => n && n !== '—') as string[];

  // Collection from period field (now returned by list endpoint)
  const collectionName = exhibit.period ? getTaxonomyName(exhibit.period, lang) : null;

  if (view === 'list') {
    return (
      <Link href={`/exhibit/${exhibit.id}`}>
        <article className="exhibit-card flex gap-4 p-4 bg-white rounded-sm border border-[#e8e0d8] hover:border-[#B5533C]/40 cursor-pointer">
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-[#FAF7F2]">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base text-[#2C2C2C] truncate">{title}</h3>
            {collectionName && collectionName !== '—' && (
              <p className="text-xs font-body text-[#B5533C] mt-0.5 font-medium">{collectionName}</p>
            )}
            {description && (
              <p className="text-sm font-body text-[#6b6560] mt-1 line-clamp-2">{description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {materialNames.map((name, i) => <span key={i} className="meta-badge">{name}</span>)}
              {has3D && <span className="meta-badge flex items-center gap-1"><Box size={10} />3D</span>}
              {hasVideo && <span className="meta-badge flex items-center gap-1"><Video size={10} />Video</span>}
            </div>
          </div>
          <div className="text-xs font-body text-[#a09890] flex-shrink-0">
            #{exhibit.code || exhibit.id}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/exhibit/${exhibit.id}`}>
      <article className="exhibit-card bg-white rounded-sm border border-[#e8e0d8] overflow-hidden cursor-pointer group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
          />
          {/* Media type badges */}
          <div className="absolute top-2 right-2 flex gap-1">
            {has3D && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold rounded-sm bg-[#2C2C2C]/80 text-white backdrop-blur-sm">
                <Box size={10} /> 3D
              </span>
            )}
            {hasVideo && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold rounded-sm bg-[#2C2C2C]/80 text-white backdrop-blur-sm">
                <Video size={10} />
              </span>
            )}
            {hasImages && !has3D && !hasVideo && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-body font-semibold rounded-sm bg-[#2C2C2C]/80 text-white backdrop-blur-sm">
                <Image size={10} />
              </span>
            )}
          </div>
          {/* ID badge */}
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 text-xs font-body bg-white/80 backdrop-blur-sm rounded-sm text-[#6b6560]">
              #{exhibit.code || exhibit.id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {collectionName && collectionName !== '—' && (
            <p className="text-xs font-body text-[#B5533C] font-semibold uppercase tracking-wide mb-1">
              {collectionName}
            </p>
          )}
          <h3 className="font-display font-semibold text-base text-[#2C2C2C] line-clamp-2 leading-snug mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm font-body text-[#6b6560] line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {materialNames.map((name, i) => <span key={i} className="meta-badge">{name}</span>)}
          </div>
        </div>
      </article>
    </Link>
  );
}
