'use client';

import { useState, useEffect } from 'react';

interface CarouselProps {
  images: string[];
  autoPlayInterval?: number;
  cornerRadius?: string;
}

export default function Carousel({ images, autoPlayInterval = 5000, cornerRadius = '12px' }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images.length, autoPlayInterval]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-96 overflow-hidden" style={{ borderRadius: cornerRadius }}>
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: index === currentIndex && !isTransitioning ? 1 : 0,
          }}
        >
          <img
            src={image}
            alt={`Showcase ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
