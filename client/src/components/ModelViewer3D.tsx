/**
 * DiPlaMus Archive — 3D Model Viewer Component
 * Uses Google's model-viewer web component for GLB/GLTF display
 * Supports future Gaussian Splatting via splat-viewer
 */
import { useRef } from 'react';
import { Box, RotateCcw } from 'lucide-react';

interface ModelViewer3DProps {
  src: string;
  alt?: string;
  poster?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
}

export default function ModelViewer3D({
  src,
  alt = '3D Model',
  poster,
  className = '',
  autoRotate = true,
  cameraControls = true,
}: ModelViewer3DProps) {
  const viewerRef = useRef<HTMLElement>(null);

  const resetCamera = () => {
    if (viewerRef.current) {
      (viewerRef.current as any).resetTurntableRotation?.();
      (viewerRef.current as any).jumpCameraToGoal?.();
    }
  };

  const isGaussian = src?.endsWith('.splat') || src?.includes('gaussian');

  if (isGaussian) {
    return (
      <div className={`relative bg-[#1a1a1a] rounded-sm overflow-hidden flex items-center justify-center ${className}`} style={{ minHeight: 320 }}>
        <div className="text-center text-white/60 p-8">
          <Box size={48} className="mx-auto mb-4 opacity-40" />
          <p className="font-display text-lg">Gaussian Splatting</p>
          <p className="text-sm font-body mt-2 opacity-60">Υποστήριξη Gaussian Splatting σύντομα</p>
        </div>
      </div>
    );
  }

  // Use createElement to avoid JSX type issues with custom web components
  const modelViewerProps: Record<string, unknown> = {
    ref: viewerRef,
    src,
    alt,
    'shadow-intensity': '1',
    exposure: '0.8',
    ar: '',
    'ar-modes': 'webxr scene-viewer quick-look',
    style: { width: '100%', height: '100%', minHeight: '320px', background: 'transparent' },
  };
  if (poster) modelViewerProps.poster = poster;
  if (autoRotate) modelViewerProps['auto-rotate'] = '';
  if (cameraControls) modelViewerProps['camera-controls'] = '';

  return (
    <div className={`relative bg-[#F5F0E8] rounded-sm overflow-hidden ${className}`} style={{ minHeight: 320 }}>
      {/* @ts-expect-error model-viewer is a custom web component loaded via CDN */}
      <model-viewer {...modelViewerProps} />

      {/* Controls overlay */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          onClick={resetCamera}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-sm shadow-sm hover:bg-white transition-colors text-[#2C2C2C]"
          title="Επαναφορά κάμερας"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* 3D badge */}
      <div className="absolute top-3 left-3">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2C2C2C]/80 backdrop-blur-sm text-white text-xs font-body font-semibold rounded-sm">
          <Box size={12} /> 3D
        </span>
      </div>
    </div>
  );
}
