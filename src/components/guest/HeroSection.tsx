import React from 'react';


interface HeroSectionProps {
  property: any;
  guestName: string;
}

export function HeroSection({ property, guestName }: HeroSectionProps) {
  const currentHour = new Date().getHours();
  let greeting = "Welcome";
  if (currentHour >= 5 && currentHour < 12) greeting = "Good Morning";
  else if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
  else if (currentHour >= 17 && currentHour < 22) greeting = "Good Evening";
  else greeting = "Need anything?";

  const heroImageUrl = (property.heroImage && String(property.heroImage).trim() !== '') ? property.heroImage : 
    (property.bannerUrl && String(property.bannerUrl).trim() !== '') ? property.bannerUrl : 
    (Array.isArray(property.galleryImages) && property.galleryImages[0]) ? property.galleryImages[0] : 
    "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="relative h-[65vh] w-full bg-text-primary overflow-hidden">
      <img 
        src={heroImageUrl} 
        alt="Property Hero" 
        className="w-full h-full object-cover opacity-85 transition-opacity duration-1000" 
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?q=80&w=2000&auto=format&fit=crop";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/30" />
      
      <div className="absolute top-8 left-6 right-6 flex justify-between items-center text-background/90">
        <div className="text-xs tracking-widest uppercase font-serif">{property.name}</div>
        <div className="text-xs font-light tracking-wide">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="absolute bottom-12 left-6 right-6">
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-background leading-tight mb-2">
          {greeting}, {guestName.split(' ')[0]}
        </h1>
        <p className="text-background/80 font-light text-lg mb-12">
          {property.tagline || "Experience luxury and serenity."}
        </p>
        
        {(property.checkInTime || property.checkOutTime) && (
          <div className="flex gap-10 mb-4">
            {property.checkInTime && (
              <div className="backdrop-blur-md bg-surface/5 px-4 py-2 border border-white/10 rounded-sm">
                <p className="text-background/60 text-[10px] tracking-widest uppercase mb-1">Check-In</p>
                <p className="text-background text-sm font-medium">{property.checkInTime}</p>
              </div>
            )}
            {property.checkOutTime && (
              <div className="backdrop-blur-md bg-surface/5 px-4 py-2 border border-white/10 rounded-sm">
                <p className="text-background/60 text-[10px] tracking-widest uppercase mb-1">Check-Out</p>
                <p className="text-background text-sm font-medium">{property.checkOutTime}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
