import React from 'react';

interface GalleryCarouselProps {
  images: string[];
}

export function GalleryCarousel({ images }: GalleryCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 gap-10 px-4">
      {images.map((img, idx) => (
        <div key={idx} className="snap-center shrink-0 w-[85vw] md:w-[400px]">
          <img 
            src={img} 
            alt={`Gallery ${idx + 1}`} 
            className="w-full h-[300px] object-cover shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-[#EAE8E1]" 
          />
        </div>
      ))}
    </div>
  );
}
