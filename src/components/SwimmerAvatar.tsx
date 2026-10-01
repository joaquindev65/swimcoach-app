import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

export interface SwimmerAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded-2xl' | 'rounded-xl' | 'rounded-lg' | 'rounded-md' | 'rounded-full';
  className?: string;
  showUploadBadge?: boolean;
  onUploadClick?: () => void;
  isUploading?: boolean;
  border?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

const BADGE_SIZE_MAP = {
  xs: 'w-3 h-3 p-0.5',
  sm: 'w-4 h-4 p-0.5',
  md: 'w-6 h-6 p-1',
  lg: 'w-7 h-7 p-1.5',
  xl: 'w-8 h-8 p-1.5',
};

const ICON_SIZE_MAP = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
  xl: 'w-4 h-4',
};

export const SwimmerAvatar: React.FC<SwimmerAvatarProps> = ({
  name,
  photoUrl,
  size = 'md',
  shape = 'rounded-2xl',
  className = '',
  showUploadBadge = false,
  onUploadClick,
  isUploading = false,
  border = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_MAP[size];
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';

  const hasValidPhoto = Boolean(photoUrl && !imgError);

  return (
    <div className={`relative inline-block flex-shrink-0 group ${className}`}>
      <div
        className={`relative ${sizeClass} ${shape} overflow-hidden flex items-center justify-center select-none transition-all ${
          border ? 'border-2 border-cyan-500/40 shadow-sm' : ''
        } ${
          hasValidPhoto
            ? 'bg-slate-900 ring-1 ring-white/10'
            : 'bg-gradient-to-br from-slate-800 to-slate-700 shadow-inner'
        }`}
      >
        {hasValidPhoto ? (
          <img
            src={photoUrl as string}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-black text-cyan-300 drop-shadow-sm">{initial}</span>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
        )}
      </div>

      {showUploadBadge && onUploadClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUploadClick();
          }}
          disabled={isUploading}
          title="Cambiar foto de perfil"
          className={`absolute -bottom-1 -right-1 ${BADGE_SIZE_MAP[size]} rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/30 border-2 border-slate-900 transition-transform active:scale-90`}
        >
          <Camera className={ICON_SIZE_MAP[size]} />
        </button>
      )}
    </div>
  );
};
