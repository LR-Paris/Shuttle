'use client';

import { useState, useEffect } from 'react';

interface ShowcaseBannerProps {
  images: string[];
  cornerStyle: 'rounded' | 'square';
}

export default function ShowcaseBanner({ images, cornerStyle }: ShowcaseBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  const borderRadius = cornerStyle === 'rounded' ? '0.5rem' : '0';

  return (
    <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden" style={{ borderRadius }}>
      {images.map((image, index) => (
        <div
          key={image}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          <img
            src={image}
            alt={`Showcase ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
