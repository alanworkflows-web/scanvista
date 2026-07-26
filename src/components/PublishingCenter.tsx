import React, { useState } from "react";
import { Loader2, QrCode, Download, ExternalLink, MessageCircle, Instagram, Facebook, Link as LinkIcon, ChevronRight, Smartphone, Camera, CheckCircle2, AlertTriangle, ArrowRight, Utensils, Wifi, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { buildGuestUrl, cn } from "../lib/utils";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Section } from "./ui/Section";
import { DishCard } from "./DishCard";

export function PublishingCenter({ property, dishes, amenities, categories }: any) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const propertySlug = property?.slug || "";
  const guestUrl = buildGuestUrl(propertySlug);
  
  const [printing, setPrinting] = useState(false);

  const isBrandSetup = !!property?.name && !!property?.description;
  const isMenuSetup = dishes && dishes.length > 0;
  const isAmenitiesSetup = amenities && amenities.length > 0;
  
  let readinessScore = 0;
  if (isBrandSetup) readinessScore += 40;
  if (isMenuSetup) readinessScore += 40;
  if (isAmenitiesSetup) readinessScore += 20;

  const handleDownloadQR = (type: "png" | "svg") => {
    const svg = document.querySelector('.master-qr-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    if (type === "svg") {
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${propertySlug}-qr.svg`;
      link.click();
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const link = document.createElement("a");
          link.download = `${propertySlug}-qr.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-5xl md:text-6xl font-serif font-medium text-text-primary mb-12 tracking-tight leading-tight">
          Your restaurant is ready for guests.
        </h1>
        <p className="text-xl text-text-secondary opacity-60 font-sans mb-12 max-w-2xl mx-auto">
          Everything guests scan begins here. Publish your live menu, download premium print assets, and share your brand with the world.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
          <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full shadow-premium hover:shadow-premium transition-all" onClick={() => window.open(guestUrl, "_blank")}>
            Preview Guest Menu <ExternalLink size={18} className="ml-2" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full" onClick={() => document.getElementById("print-studio")?.scrollIntoView({ behavior: "smooth" })}>
            Download Assets <Download size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* SECTION 1: PUBLISHING STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <Card className="p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-text-primary">Guest Menu</span>
            {isMenuSetup ? <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary hover:bg-primary-hover text-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary/50"></span></span> : <AlertTriangle size={16} className="text-amber-500" />}
          </div>
          <span className={cn("font-medium", isMenuSetup ? "text-primary" : "text-amber-600")}>{isMenuSetup ? "Live" : "Needs Dishes"}</span>
        </Card>
        <Card className="p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-text-primary">QR Code</span>
            <CheckCircle2 size={16} className="text-primary" />
          </div>
          <span className="font-medium text-primary">Ready</span>
        </Card>
        <Card className="p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-text-primary">Branding</span>
            {isBrandSetup ? <CheckCircle2 size={16} className="text-primary" /> : <AlertTriangle size={16} className="text-amber-500" />}
          </div>
          <span className={cn("font-medium", isBrandSetup ? "text-primary" : "text-amber-600")}>{isBrandSetup ? "Configured" : "Missing Name"}</span>
        </Card>
        <Card className="p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-text-primary">Restaurant Profile</span>
            <CheckCircle2 size={16} className="text-primary" />
          </div>
          <span className="font-medium text-primary">Published</span>
        </Card>
      </div>

      {/* SECTION 2 & 3: LARGE QR & LIVE PHONE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Large QR */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-surface p-12 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-2 border-gray-50 flex flex-col items-center text-center w-full max-w-md relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 rounded-[3rem] pointer-events-none"></div>
            <h2 className="text-3xl font-serif font-medium text-text-primary mb-2 relative z-10">{property?.name || "Your Restaurant"}</h2>
            <p className="text-text-secondary opacity-60 mb-12 relative z-10 font-medium">Scan to view guest information</p>
            <div className="p-8 bg-surface rounded-sm shadow-premium border border-divider relative z-10 group-hover:-translate-y-1 hover:shadow-premium active:scale-95 transition-transform duration-500">
              <QRCodeSVG
                value={guestUrl}
                size={240}
                level="H"
                includeMargin={false}
                className="master-qr-svg"
              />
            </div>
            <div className="mt-10 text-sm text-text-muted font-medium relative z-10 flex items-center gap-2">
              Powered by <span className="font-serif font-medium text-text-primary">ScanVista</span>
            </div>
          </div>
          <div className="flex gap-10 mt-8">
            <Button variant="secondary" onClick={() => handleDownloadQR("png")}>Download PNG</Button>
            <Button variant="secondary" onClick={() => handleDownloadQR("svg")}>Download SVG</Button>
          </div>
        </div>

        {/* Phone Preview */}
        <div className="flex justify-center lg:justify-end relative">
          <div className="w-[320px] h-[650px] bg-gray-900 rounded-[3rem] shadow-premium-hover overflow-hidden border-[12px] border-gray-900 relative">
            <div className="absolute top-0 inset-x-0 h-7 bg-gray-900 rounded-b-3xl w-40 mx-auto z-50"></div>
            <div className="w-full h-full bg-surface overflow-y-auto hide-scrollbar relative">
              {/* Mock Guest View */}
              <div className="h-64 bg-surface-hover relative">
                <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-8 rounded-sm shadow-premium">
                  <h3 className="font-serif font-medium text-xl">{property?.name || "Your Restaurant"}</h3>
                  <p className="text-sm text-text-secondary opacity-80 truncate">{property?.description || "Location details"}</p>
                </div>
              </div>
              <div className="p-8 space-y-4 pb-20">
                <h4 className="font-medium text-lg">Menu Highlights</h4>
                {dishes && dishes.length > 0 ? (
                  dishes.slice(0, 3).map((d: any) => (
                    <DishCard key={d.id} item={d} propertyType="HOTEL" />
                  ))
                ) : (
                  <div className="text-text-muted text-sm italic">Menu is empty. Add dishes in Menu Studio.</div>
                )}
              </div>
            </div>
          </div>
          {/* Decorative elements behind phone */}
          <div className="absolute -z-10 top-20 -right-10 w-64 h-64 bg-primary-light/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -z-10 bottom-20 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>

      {/* SECTION 4: PRINT ASSET STUDIO */}
      <div id="print-studio" className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-divider pb-4">
          <div>
            <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Print Asset Studio</h2>
            <p className="text-text-secondary opacity-60">Premium ready-to-print marketing materials.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <Card hoverable className="flex flex-col group overflow-hidden border-2 border-transparent hover:border-divider transition-all duration-300">
            <div className="h-48 bg-surface-hover flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 opacity-50"></div>
              {/* Mock Table Tent */}
              <div className="w-24 h-32 bg-surface rounded shadow-premium border border-divider rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500 flex flex-col items-center justify-center p-2 z-10">
                <div className="w-16 h-16 bg-gray-900 rounded-sm mb-2"></div>
                <div className="w-10 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-xl font-serif text-text-primary mb-1">Table Tent</h3>
              <p className="text-sm text-text-secondary opacity-60 mb-12 flex-1">Standard 4x6" foldable tent card for dining tables.</p>
              <Button variant="secondary" className="w-full" onClick={() => handleDownloadQR("png")}>Download PDF</Button>
            </div>
          </Card>

          <Card hoverable className="flex flex-col group overflow-hidden border-2 border-transparent hover:border-divider transition-all duration-300">
            <div className="h-48 bg-surface-hover flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 opacity-50"></div>
              {/* Mock Acrylic Stand */}
              <div className="w-20 h-28 bg-surface/80 backdrop-blur-sm rounded-sm shadow-premium border border-white/40 rotate-[5deg] group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center z-10 relative overflow-hidden">
                <div className="absolute bottom-0 inset-x-0 h-4 bg-gray-800"></div>
                <div className="w-12 h-12 bg-gray-900 rounded-sm mb-2"></div>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-xl font-serif text-text-primary mb-1">Acrylic Stand</h3>
              <p className="text-sm text-text-secondary opacity-60 mb-12 flex-1">Insert for 5x7" clear acrylic table stands.</p>
              <Button variant="secondary" className="w-full" onClick={() => handleDownloadQR("png")}>Download PDF</Button>
            </div>
          </Card>

          <Card hoverable className="flex flex-col group overflow-hidden border-2 border-transparent hover:border-divider transition-all duration-300">
            <div className="h-48 bg-surface-hover flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 opacity-50"></div>
              {/* Mock Poster */}
              <div className="w-28 h-40 bg-surface shadow-premium-hover border border-divider group-hover:-translate-y-1 hover:shadow-premium active:scale-95 transition-transform duration-500 flex flex-col p-3 z-10">
                <div className="w-full h-12 bg-surface-hover mb-auto"></div>
                <div className="w-16 h-16 bg-gray-900 rounded-sm self-center"></div>
                <div className="w-full h-6 bg-surface-hover mt-auto"></div>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-xl font-serif text-text-primary mb-1">Reception Poster</h3>
              <p className="text-sm text-text-secondary opacity-60 mb-12 flex-1">A4 size poster for front desk or entrance.</p>
              <Button variant="secondary" className="w-full" onClick={() => handleDownloadQR("png")}>Download PDF</Button>
            </div>
          </Card>

          <Card hoverable className="flex flex-col group overflow-hidden border-2 border-transparent hover:border-divider transition-all duration-300">
            <div className="h-48 bg-surface-hover flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 opacity-50"></div>
              {/* Mock Sticker */}
              <div className="w-24 h-24 rounded-full bg-surface shadow-premium-hover border border-divider group-hover:-translate-y-1 hover:shadow-premium active:scale-95 group-active:scale-95 transition-transform duration-500 flex items-center justify-center z-10">
                <div className="w-14 h-14 bg-gray-900 rounded-sm"></div>
              </div>
            </div>
            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-xl font-serif text-text-primary mb-1">Window Sticker</h3>
              <p className="text-sm text-text-secondary opacity-60 mb-12 flex-1">Circular 4x4" design for glass doors.</p>
              <Button variant="secondary" className="w-full" onClick={() => handleDownloadQR("png")}>Download PDF</Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* SECTION 5: SHARE EVERYWHERE */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-serif font-medium text-text-primary">Share Everywhere</h2>
          <div className="grid grid-cols-2 gap-10">
            <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-background hover:bg-surface-hover border-none">
              <MessageCircle size={24} className="text-green-500" />
              <span className="text-sm">WhatsApp</span>
            </Button>
            <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-background hover:bg-surface-hover border-none">
              <Instagram size={24} className="text-pink-500" />
              <span className="text-sm">Instagram</span>
            </Button>
            <Button variant="secondary" className="h-24 flex flex-col gap-2 bg-background hover:bg-surface-hover border-none">
              <Facebook size={24} className="text-blue-600" />
              <span className="text-sm">Facebook</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-24 flex flex-col gap-2 bg-background hover:bg-surface-hover border-none transition-all active:scale-[0.98]"
              onClick={() => {
                navigator.clipboard.writeText(guestUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <>
                  <Check size={24} className="text-primary" />
                  <span className="text-sm text-primary font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon size={24} className="text-text-secondary opacity-80" />
                  <span className="text-sm">Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* SECTION 7: RESTAURANT READINESS & BRAND ASSETS */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-serif font-medium text-text-primary">Restaurant Readiness</h2>
          <Card className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-10">
            {/* Progress Circle */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" className="stroke-gray-100" strokeWidth="8" fill="none" />
                <circle 
                  cx="64" cy="64" r="60" 
                  className={cn("transition-all duration-1000 ease-out", readinessScore === 100 ? "stroke-emerald-500" : "stroke-amber-500")} 
                  strokeWidth="8" fill="none" 
                  strokeDasharray={`${(readinessScore / 100) * 377} 377`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-serif text-text-primary">{readinessScore}%</span>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <h3 className="text-xl font-serif text-text-primary text-xl text-text-primary mb-2">
                {readinessScore === 100 ? "Ready for Guests!" : "Almost there..."}
              </h3>
              <p className="text-text-secondary opacity-60 mb-12 text-sm">
                {readinessScore === 100 
                  ? "Your restaurant is fully configured. Start sharing your QR code!" 
                  : "Complete these steps to ensure the best guest experience."}
              </p>
              
              <div className="space-y-3">
                {!isBrandSetup && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-background p-3 rounded-sm">
                    <AlertTriangle size={16} className="text-amber-500" /> Complete Brand Profile
                  </div>
                )}
                {!isMenuSetup && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-background p-3 rounded-sm">
                    <Utensils size={16} className="text-amber-500" /> Add your first Menu Item
                  </div>
                )}
                {!isAmenitiesSetup && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary bg-background p-3 rounded-sm">
                    <Wifi size={16} className="text-amber-500" /> Configure WiFi & Amenities
                  </div>
                )}
                {readinessScore === 100 && (
                  <div className="flex items-center gap-3 text-sm text-text-primary bg-primary/5 p-3 rounded-sm font-medium">
                    <CheckCircle2 size={16} className="text-primary" /> All core systems online
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 6: GUEST JOURNEY */}
      <div className="pt-16 border-t border-divider">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">The Guest Journey</h2>
          <p className="text-text-secondary opacity-60">How ScanVista creates value for every guest.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-[150px]">
            <div className="w-16 h-16 rounded-sm bg-gray-900 text-white flex items-center justify-center mb-4 shadow-premium">
              <Camera size={24} />
            </div>
            <h4 className="font-medium text-text-primary">Guest Scans</h4>
            <p className="text-xs text-text-secondary opacity-60 mt-1">No app required.</p>
          </div>
          
          <ArrowRight className="hidden md:block text-text-muted/80 shrink-0" size={24} />
          
          <div className="flex flex-col items-center text-center max-w-[150px]">
            <div className="w-16 h-16 rounded-sm bg-surface border border-divider text-primary flex items-center justify-center mb-4 shadow-premium">
              <Smartphone size={24} />
            </div>
            <h4 className="font-medium text-text-primary">Menu Opens</h4>
            <p className="text-xs text-text-secondary opacity-60 mt-1">Instant branded experience.</p>
          </div>
          
          <ArrowRight className="hidden md:block text-text-muted/80 shrink-0" size={24} />
          
          <div className="flex flex-col items-center text-center max-w-[150px]">
            <div className="w-16 h-16 rounded-sm bg-surface border border-divider text-blue-600 flex items-center justify-center mb-4 shadow-premium">
              <Utensils size={24} />
            </div>
            <h4 className="font-medium text-text-primary">Chooses Food</h4>
            <p className="text-xs text-text-secondary opacity-60 mt-1">Beautiful visual menu.</p>
          </div>
          
          <ArrowRight className="hidden md:block text-text-muted/80 shrink-0" size={24} />
          
          <div className="flex flex-col items-center text-center max-w-[150px]">
            <div className="w-16 h-16 rounded-sm bg-primary hover:bg-primary-hover text-white shadow-premium-hover transition-all text-white flex items-center justify-center mb-4 shadow-premium">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="font-medium text-text-primary">Value Created</h4>
            <p className="text-xs text-text-secondary opacity-60 mt-1">Faster decisions, happy guests.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
