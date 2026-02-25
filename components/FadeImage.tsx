'use client';

import { useState } from 'react';

interface FadeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export default function FadeImage({ className = '', style, onLoad, ...props }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      className={`${className} transition-opacity duration-500 ease-in-out`}
      style={{ ...style, opacity: loaded ? 1 : 0 }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
