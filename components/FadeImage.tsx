'use client';

import { useState, useCallback } from 'react';

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Background color shown while the image loads. Defaults to #e5e7eb (gray-200). */
  placeholderColor?: string;
  /** Duration of the fade-in transition in ms. Defaults to 500. */
  fadeDuration?: number;
}

/**
 * An <img> wrapper that starts invisible and fades in once loaded.
 * The parent container's background (or placeholderColor on the wrapper)
 * acts as the colored placeholder block.
 */
export default function FadeImage({
  placeholderColor = '#e5e7eb',
  fadeDuration = 500,
  className = '',
  style,
  onLoad,
  ...props
}: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true);
      onLoad?.(e);
    },
    [onLoad]
  );

  return (
    <img
      {...props}
      className={className}
      style={{
        ...style,
        backgroundColor: placeholderColor,
        opacity: loaded ? 1 : 0,
        transition: `opacity ${fadeDuration}ms ease-in-out`,
      }}
      onLoad={handleLoad}
    />
  );
}
