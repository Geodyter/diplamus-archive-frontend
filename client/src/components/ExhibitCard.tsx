/**
 * DiPlaMus Archive — ExhibitCard Component
 * Design: Contemporary Museum Digital
 * Shows exhibit thumbnail, title, metadata badges
 */
import { Link } from 'wouter';
import { Box, Image, Video, FileText } from 'lucide-react';
import { NavigationPoint, getTranslation, getImageUrl } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExhibitCardProps {
  exhibit: NavigationPoint;
  view?: 'grid' | 'list';
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80';

export default function ExhibitCard({ exhibit, view = 'grid' }: ExhibitCardProps) {
  const { lang } = useLanguage();
  const translation = getTranslation(exhibit.translations, lang);
  const title = translation?.name || exhibit.title || 'Αδιευκρίνιστο';
  const description = translation?.shortDescription || translation?.description || '';
  const imageUrl = getImageUrl(exhibit.image, 'medium') || PLACEHOLDER;

  const hasFiles = exhibit.files && exhibit.files.length > 0;
  const has3D = exhibit.files?.some(f => f.type === '3d');
  const hasVideo = exhibit.files?.some(f => f.type === 'video');
  const hasImages = exhibit.files?.some(f => f.type === 'image') || exhibit.image?.uri;

  const material = exhibit.materials?.[0];
  const materialName = material ? getTranslation(material.translations, lang)?.name : null;

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
            {description && (
              <p className="text-sm font-body text-[#6b6560] mt-1 line-clamp-2">{description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {materialName && <span className="meta-badge">{materialName}</span>}
              {has3D && <span className="meta-badge flex items-center gap-1"><Box size={10} />3D</span>}
              {hasVideo && <span className="meta-badge flex items-center gap-1"><Video size={10} />Video</span>}
            </div>
          </div>
          <div className="text-xs font-body text-[#a09890] flex-shrink-0">
            #{exhibit.id}
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
          {hasFiles && (
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
          )}
          {/* ID badge */}
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-0.5 text-xs font-body bg-white/80 backdrop-blur-sm rounded-sm text-[#6b6560]">
              #{exhibit.id}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-base text-[#2C2C2C] line-clamp-2 leading-snug mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm font-body text-[#6b6560] line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {materialName && <span className="meta-badge">{materialName}</span>}
            {exhibit.periods?.[0] && (
              <span className="meta-badge">
                {getTranslation(exhibit.periods[0].translations, lang)?.name}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
