import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Utensils, MapPin, Phone, Key, Clock, Info, Calendar, Sparkles
} from "lucide-react";

import { evaluateVisibility, VisibilityConfig } from "../lib/visibilityEngine";
import { HeroSection } from "../components/guest/HeroSection";
import { PropertyStatusStrip } from "../components/guest/PropertyStatusStrip";
import { AccordionSection } from "../components/guest/AccordionSection";
import { InformationCard } from "../components/guest/InformationCard";
import { ServiceCard } from "../components/guest/ServiceCard";
import { ContactCard } from "../components/guest/ContactCard";
import { PaymentBadge } from "../components/guest/PaymentBadge";
import { GalleryCarousel } from "../components/guest/GalleryCarousel";
import { GlobalFooter } from "../components/ui/GlobalFooter";
export function GuestWelcome() {
  const { token } = useParams<{ token: string }>();
  const isPreview = window.location.pathname.startsWith("/preview/");
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const endpoint = isPreview ? `/api/preview/${token}` : `/api/guests/${token}`;
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setJourney(data);
          // Default open section based on stage
          const stage = calculateStage(data);
          if (stage === 'ARRIVAL') setActiveSection('stay-info');
          else if (stage === 'DEPARTURE') setActiveSection('checkout');
          else setActiveSection('highlights');
        }
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#EAE8E1] border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center text-[#2A2A2A]">
        <h1 className="text-3xl font-serif mb-4">Journey Not Found</h1>
        <p className="text-[#7A7A7A] font-light">The link you followed is invalid or has expired.</p>
      </div>
    );
  }

  const { property, name, arrivalDate, departureDate } = journey;
  const toggleSection = (section: string) => setActiveSection(prev => prev === section ? null : section);

  // 1. Calculate Guest Stage
  function calculateStage(j: any) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let stage = 'STAY';
    if (j.arrivalDate) {
      const arrDate = new Date(j.arrivalDate);
      arrDate.setHours(0,0,0,0);
      if (today <= arrDate) stage = 'ARRIVAL';
    }
    if (j.departureDate) {
      const depDate = new Date(j.departureDate);
      depDate.setHours(0,0,0,0);
      if (today >= depDate) stage = 'DEPARTURE';
    }
    return stage;
  }

  const guestStage = calculateStage(journey);

  // 2. Filter & Sort Engine
  const filterVisible = (items: any[]) => items.filter(item => {
    const res = evaluateVisibility(item as VisibilityConfig, currentTime);
    return res.state === 'OPEN_NOW' || res.state === 'COMING_UP' || res.state === 'CLOSED'; // Show closed ones gracefully
  });

  const sortItems = (items: any[]) => items.sort((a, b) => (a.priority || 100) - (b.priority || 100));

  const visibleCategories = sortItems(filterVisible(property.categories || []));
  const visibleAmenities = sortItems(filterVisible(property.amenities || []));
  const visibleActivities = sortItems(filterVisible(property.activities || []));
  
  const statusItems = [
    ...visibleAmenities.map(a => ({ name: a.name, config: a as VisibilityConfig })),
    ...visibleCategories.map(c => ({ name: c.name, config: c as VisibilityConfig })),
    ...visibleActivities.map(ac => ({ name: ac.name, config: ac as VisibilityConfig }))
  ];

  const galleryImages = property.galleryImages || [];
  if (property.gallery) galleryImages.push(...property.gallery);

  return (
    <div className="min-h-[100dvh] bg-background pb-32 font-sans text-[#2A2A2A] transition-colors duration-1000">
      
      <HeroSection property={property} guestName={name} />
      
      <div className="-mt-6 relative z-20 flex justify-center mb-12">
         <button 
          onClick={() => document.getElementById('status-start')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-surface shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-full px-10 py-4 text-[10px] tracking-[0.2em] uppercase font-medium text-[#2A2A2A] hover:bg-background transition-colors border border-[#EAE8E1]/40"
        >
          {guestStage === 'ARRIVAL' ? 'Prepare for Arrival' : guestStage === 'DEPARTURE' ? 'Checkout Options' : 'Explore Your Stay'}
        </button>
      </div>

      <div id="status-start">
        <PropertyStatusStrip items={statusItems} />
      </div>

      <div className="max-w-2xl mx-auto mt-8 px-2 md:px-0 space-y-4">

        {/* HIGHLIGHTS - Only show during Stay */}
        {guestStage === 'STAY' && property.highlights && property.highlights.length > 0 && (
          <div className="mb-12 px-4">
            <h3 className="text-center font-serif text-3xl mb-12 text-[#1A1A1A]">Today's Highlights</h3>
            <div className="space-y-4">
              {(property.highlights || []).map((hl: any, idx: number) => (
                <div key={idx} className="flex gap-10 items-center bg-surface p-8 border border-[#EAE8E1]/50 rounded-sm">
                  {hl.image && <img src={hl.image} className="w-16 h-16 object-cover rounded-sm" alt="Highlight" />}
                  <div>
                    <h4 className="font-serif text-xl">{hl.title}</h4>
                    <p className="text-sm font-light text-[#7A7A7A]">{hl.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAY INFORMATION - Prioritized for Arrival */}
        <AccordionSection 
          title="Stay Information" 
          icon={<Info size={24} strokeWidth={1} />} 
          isOpen={activeSection === "stay-info"} 
          onToggle={() => toggleSection("stay-info")}
        >
          <div className="bg-surface border border-[#EAE8E1]/40 p-8 rounded-sm shadow-premium space-y-6">
            <div className="grid grid-cols-2 gap-10 border-b border-[#EAE8E1]/30 pb-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Check-In</p>
                <p className="text-lg font-serif text-[#2A2A2A]">{property.checkInTime || "2:00 PM"}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Check-Out</p>
                <p className="text-lg font-serif text-[#2A2A2A]">{property.checkOutTime || "11:00 AM"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-10">
              {property.wifiNetwork && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">WiFi Network</p>
                  <p className="text-[14px] text-[#5A5A5A]">{property.wifiNetwork}</p>
                  {property.wifiPassword && <p className="text-[14px] text-[#5A5A5A] mt-1 font-mono">{property.wifiPassword}</p>}
                </div>
              )}
              {property.receptionPhone && (
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#A3A095] mb-2">Reception</p>
                  <a href={`tel:${property.receptionPhone}`} className="text-[14px] text-[#D4AF37]">{property.receptionPhone}</a>
                </div>
              )}
            </div>
          </div>
        </AccordionSection>

        {/* DINING */}
        <AccordionSection 
          title="Dining" 
          icon={<Utensils size={24} strokeWidth={1} />} 
          isOpen={activeSection === "dining"} 
          onToggle={() => toggleSection("dining")}
        >
          {visibleCategories.length > 0 ? (
            <div className="space-y-10 pt-4">
              {visibleCategories.map((cat: any) => (
                <div key={cat.id}>
                  {cat.heroImage ? (
                    <div className="h-[280px] w-full mb-12 relative rounded-sm overflow-hidden">
                      <img src={cat.heroImage} alt={cat.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <h3 className="text-background font-serif text-4xl tracking-wide">{cat.name}</h3>
                      </div>
                    </div>
                  ) : (
                    <h3 className="font-serif text-3xl text-[#1A1A1A] mb-12">{cat.name}</h3>
                  )}
                  
                  <div className="space-y-6 px-2">
                    {cat.dishes?.map((dish: any) => (
                      <div key={dish.id} className="flex gap-10 items-start group border-b border-[#EAE8E1]/30 pb-6 last:border-0 last:pb-0">
                        {dish.imageUrl && (
                          <img src={dish.imageUrl} className="w-24 h-24 object-cover shrink-0 rounded-sm" alt={dish.name} />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-[#2A2A2A] text-lg">{dish.name}</h4>
                            <span className="text-[#A3A095] font-light text-[15px]">${(dish.price || 0).toFixed(2)}</span>
                          </div>
                          {dish.description && <p className="text-[#7A7A7A] text-[14px] leading-relaxed font-light">{dish.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-[#7A7A7A] font-light text-[15px]">The kitchens are resting. Please check back later.</p>
            </div>
          )}
        </AccordionSection>

        {/* AMENITIES */}
        {guestStage !== 'DEPARTURE' && (
          <AccordionSection 
            title="Experiences" 
            icon={<Sparkles size={24} strokeWidth={1} />} 
            isOpen={activeSection === "amenities"} 
            onToggle={() => toggleSection("amenities")}
          >
            {visibleAmenities.length > 0 ? (
              <div className="pt-4">
                {visibleAmenities.map((amenity: any) => {
                  const details = [];
                  if (amenity.openTime && amenity.closeTime) details.push({ label: 'Hours', value: `${amenity.openTime} - ${amenity.closeTime}` });
                  if (amenity.location) details.push({ label: 'Location', value: amenity.location });
                  
                  return (
                    <InformationCard 
                      key={amenity.id}
                      title={amenity.name}
                      description={amenity.description}
                      image={amenity.heroImage}
                      details={details}
                      rules={amenity.rules}
                      actionText={amenity.requiresReservation ? "Reserve" : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-[#7A7A7A] font-light text-[15px]">Enjoy the tranquility of the property today.</p>
              </div>
            )}
          </AccordionSection>
        )}

        {/* DEPARTURE OPTIONS */}
        {guestStage === 'DEPARTURE' && (
           <AccordionSection 
           title="Checkout Options" 
           icon={<Clock size={24} strokeWidth={1} />} 
           isOpen={activeSection === "checkout"} 
           onToggle={() => toggleSection("checkout")}
         >
           <div className="grid grid-cols-2 gap-10 pt-4 mb-12">
              <ServiceCard icon="🚕" title="Airport Transfer" actionText="Book" />
              <ServiceCard icon="🧾" title="View Invoice" actionText="View" />
              <ServiceCard icon="⏰" title="Late Checkout" actionText="Request" />
              <ServiceCard icon="🧳" title="Luggage Storage" actionText="Arrange" />
           </div>
         </AccordionSection>
        )}

        {/* CONCIERGE */}
        {property.conciergeServices && property.conciergeServices.length > 0 && (
          <AccordionSection 
            title="Concierge" 
            icon={<Key size={24} strokeWidth={1} />} 
            isOpen={activeSection === "concierge"} 
            onToggle={() => toggleSection("concierge")}
          >
            <div className="grid grid-cols-2 gap-10 pt-4 mb-12">
              {(property.conciergeServices || []).map((c: any, idx: number) => (
                <ServiceCard 
                  key={idx}
                  icon={c.icon || "🛎️"}
                  title={c.title || c.name || c}
                  responseTime={c.responseTime}
                  actionText={c.actionText || "Request"}
                />
              ))}
            </div>
          </AccordionSection>
        )}

        {/* CONTACT */}
        {property.contacts && property.contacts.length > 0 && (
          <AccordionSection 
            title="Contact" 
            icon={<Phone size={24} strokeWidth={1} />} 
            isOpen={activeSection === "contact"} 
            onToggle={() => toggleSection("contact")}
          >
            <div className="pt-4">
              {(property.contacts || []).map((c: any, idx: number) => (
                <ContactCard 
                  key={idx}
                  title={c.title}
                  hours={c.hours}
                  languages={c.languages}
                  responseTime={c.responseTime}
                  phone={c.phone}
                  whatsapp={c.whatsapp}
                  email={c.email}
                />
              ))}
            </div>
          </AccordionSection>
        )}

        {/* GALLERY */}
        {galleryImages.length > 0 && (
          <AccordionSection 
            title="Gallery" 
            isOpen={activeSection === "gallery"} 
            onToggle={() => toggleSection("gallery")}
          >
            <div className="pt-6 -mx-4 md:mx-0">
              <GalleryCarousel images={galleryImages} />
            </div>
          </AccordionSection>
        )}

      </div>
      <GlobalFooter />
    </div>
  );
}
