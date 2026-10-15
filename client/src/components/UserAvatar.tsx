import React, { useState } from 'react';
import { UserRound } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, className = '' }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-slate-500 ${className}`}
      role="img"
      aria-label={name ? `${name} avatar` : 'Default profile avatar'}
    >
      {hasImage
        ? <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailedSrc(src || null)} />
        : <UserRound aria-hidden="true" className="h-1/2 w-1/2" strokeWidth={1.6} />}
    </div>
  );
};
