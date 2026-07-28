import React from 'react';
import logoAsset from '@/assets/bizbase-logo.png';

/**
 * BizBase brand mark + wordmark.
 * size: tailwind classes for the icon box.
 */
const BrandLogo = ({
  size = 'w-10 h-10 sm:w-11 sm:h-11',
  showText = true,
  showTagline = false,
  textClass = 'text-[1.35rem] sm:text-2xl',
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <img
      src={logoAsset.url}
      alt="BizBase logo"
      width={44}
      height={44}
      className={`${size} object-contain select-none`}
      draggable={false}
    />
    {showText && (
      <span className="flex flex-col leading-none">
        <span className={`${textClass} font-bold tracking-[-0.03em] text-foreground`}>
          BizBase
        </span>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.14em] uppercase text-muted-foreground mt-1">
            Network • Work • Grow
          </span>
        )}
      </span>
    )}
  </span>
);

export default BrandLogo;
