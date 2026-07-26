import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { 
  Building2, 
  Coffee, 
  Hotel, 
  Palmtree, 
  Store,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Printer,
  Smartphone
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { buildGuestUrl } from "../lib/utils";

const PROPERTY_TYPES = [
  { id: "RESTAURANT", label: "Restaurant", icon: Store, desc: "Classic dining experience" },
  { id: "CAFE", label: "Cafe", icon: Coffee, desc: "Coffee, pastries, and light fare" },
  { id: "HOTEL", label: "Hotel", icon: Hotel, desc: "Rooms and room service" },
  { id: "RESORT", label: "Resort", icon: Palmtree, desc: "Luxury full-service property" },
  { id: "CLOUD_KITCHEN", label: "Cloud Kitchen", icon: Building2, desc: "Delivery and pickup only" }
];

export function ManagerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=Welcome, 1=Name, 2=Type, 3=Logo, 4=Hero, 5=Success
  const [formData, setFormData] = useState({
    name: "",
    propertyType: "",
    logoUrl: "",
    bannerUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const totalSteps = 6;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Create property
      const res = await fetch("/api/manager/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name || "My Restaurant",
          propertyType: formData.propertyType || "RESTAURANT"
        })
      });
      if (!res.ok) throw new Error("Failed to create property");
      const property = await res.json();
      
      // 2. Update with imagery if provided
      if (formData.logoUrl || formData.bannerUrl) {
        await fetch(`/api/manager/properties/${property.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logoUrl: formData.logoUrl,
            bannerUrl: formData.bannerUrl
          })
        });
      }

      setCreatedSlug(property.slug);
      nextStep();
    } catch (err) {
      console.error(err);
      // fallback in case of error
      navigate("/manager/home");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-12 shadow-premium">
              <Store size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-text-primary mb-12 leading-tight">
              Welcome to ScanVista
            </h1>
            <p className="text-xl text-text-secondary opacity-60 font-light mb-12">
              Let's build your restaurant together.
            </p>
            <Button size="lg" onClick={nextStep} className="w-full sm:w-auto px-12 py-6 text-lg rounded-full">
              Begin Setup <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-12">
              What's the name of your restaurant?
            </h1>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Ocean View Resort"
              className="text-4xl md:text-5xl font-light text-text-primary placeholder:text-text-muted/80 border-none bg-transparent focus:outline-none focus:ring-0 mb-12"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && formData.name.trim() && nextStep()}
            />
            <div className="flex items-center gap-10 mt-auto">
              <Button size="lg" onClick={nextStep} disabled={!formData.name.trim()} className="px-10 py-6 text-lg rounded-full">
                Continue
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-12">
              How would you describe {formData.name}?
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
              {PROPERTY_TYPES.map(type => {
                const Icon = type.icon;
                const isActive = formData.propertyType === type.id;
                return (
                  <Card 
                    key={type.id}
                    hoverable
                    onClick={() => setFormData({ ...formData, propertyType: type.id })}
                    className={`cursor-pointer border-2 transition-all duration-300 ${isActive ? 'border-primary ring-4 ring-primary/10 bg-primary/5/30' : 'border-divider'}`}
                  >
                    <div className="p-8 flex flex-col items-start gap-10">
                      <div className={`p-3 rounded-sm ${isActive ? 'bg-primary-light/20 text-text-primary' : 'bg-surface-hover text-text-secondary opacity-80'}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif text-text-primary text-lg text-text-primary">{type.label}</h3>
                        <p className="text-sm text-text-secondary opacity-60 mt-1">{type.desc}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="flex items-center gap-10">
              <Button variant="ghost" size="lg" onClick={prevStep}>Back</Button>
              <Button size="lg" onClick={nextStep} disabled={!formData.propertyType} className="px-10 py-6 text-lg rounded-full">
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-4">
              Upload your logo
            </h1>
            <p className="text-text-secondary opacity-60 mb-12">This will be the first thing your guests see when they scan your menu.</p>
            
            <div className="border-2 border-dashed border-divider rounded-3xl p-12 flex flex-col items-center justify-center bg-background mb-12 hover:bg-surface-hover transition-colors cursor-pointer group">
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo preview" className="w-32 h-32 object-contain bg-surface rounded-sm shadow-premium mb-12" />
              ) : (
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center shadow-premium mb-12 group-hover:scale-105 transition-transform">
                  <UploadCloud size={32} className="text-text-muted" />
                </div>
              )}
              <p className="text-text-primary font-medium mb-1">Click to upload logo</p>
              <p className="text-sm text-text-secondary opacity-60">SVG, PNG, or JPG (max. 800x400px)</p>
              
              {/* Fake hidden file input for prototype purposes */}
              <input 
                type="file" 
                className="hidden" 
                id="logo-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setFormData({ ...formData, logoUrl: url });
                  }
                }}
              />
              <label htmlFor="logo-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>

            <div className="flex items-center gap-10">
              <Button variant="ghost" size="lg" onClick={prevStep}>Back</Button>
              {formData.logoUrl ? (
                <Button size="lg" onClick={nextStep} className="px-10 py-6 text-lg rounded-full">
                  Continue
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={nextStep} className="px-10 py-6 text-lg rounded-full">
                  Skip for now
                </Button>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-4">
              Set the atmosphere
            </h1>
            <p className="text-text-secondary opacity-60 mb-12">Upload a beautiful hero image that captures the vibe of {formData.name}.</p>
            
            <ImageUploader value={formData.bannerUrl} onChange={(val) => setFormData({ ...formData, bannerUrl: val })} label="Hero Image" className="h-64 mb-12 rounded-3xl" />

            <div className="flex items-center gap-10">
              <Button variant="ghost" size="lg" onClick={prevStep} disabled={loading}>Back</Button>
              {formData.bannerUrl ? (
                <Button size="lg" onClick={handleFinish} disabled={loading} className="px-10 py-6 text-lg rounded-full">
                  {loading ? "Creating..." : "Create Restaurant"}
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={handleFinish} disabled={loading} className="px-10 py-6 text-lg rounded-full">
                  {loading ? "Creating..." : "Skip & Create"}
                </Button>
              )}
            </div>
          </div>
        );

            case 5:
        const guestUrl = createdSlug ? buildGuestUrl(createdSlug) : "";
        return (
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto animate-in zoom-in-[0.95] duration-700 w-full mt-10">
            <h1 className="text-3xl md:text-5xl font-serif font-medium text-text-primary mb-4 leading-tight">
              {formData.name} is now live!
            </h1>
            <p className="text-lg md:text-xl text-text-secondary opacity-60 font-light mb-12">
              Your property has been successfully created. Here is your launch checklist:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12">
              {/* Left Column: The QR Code */}
              <Card className="p-8 flex flex-col items-center border-divider shadow-premium shadow-emerald-500/10 bg-gradient-to-b from-white to-emerald-50/20 h-full justify-center">
                <div className="mb-12 bg-surface p-8 rounded-3xl shadow-premium border border-divider">
                   <QRCodeSVG value={guestUrl} size={180} level="H" />
                </div>
                <h2 className="text-2xl font-serif font-medium text-text-primary mb-2">{formData.name}</h2>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-light/20 text-emerald-800 rounded-full text-sm font-medium mb-12">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
                  Live Demo URL
                </div>
                <div className="flex gap-10">
                  <Button size="sm" onClick={() => window.open(guestUrl, '_blank')} className="rounded-full flex items-center gap-2">
                    <Smartphone size={16} /> Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const svg = document.querySelector('svg');
                    if (svg) {
                      const printWin = window.open('', '', 'width=800,height=800');
                      if (printWin) {
                         printWin.document.write(`<html><body><div style="display:flex;flex-direction:column;align-items:center;margin-top:100px;">${svg.outerHTML}<h1>${formData.name}</h1></div></body></html>`);
                         printWin.document.close();
                         printWin.print();
                      }
                    }
                  }} className="rounded-full flex items-center gap-2">
                    <Printer size={16} /> Print
                  </Button>
                </div>
              </Card>

              {/* Right Column: The Checklist */}
              <div className="flex flex-col gap-10 text-left">
                <div className="flex items-start gap-10 p-8 rounded-sm bg-background border border-divider">
                  <div className="w-8 h-8 rounded-full bg-primary-light/20 text-primary flex items-center justify-center shrink-0 mt-1"><CheckCircle2 size={18} /></div>
                  <div>
                    <h3 className="font-medium text-text-primary">1. Property Created</h3>
                    <p className="text-sm text-text-secondary opacity-60">Your core property shell is ready.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-10 p-8 rounded-sm bg-surface border border-divider shadow-premium">
                  <div className="w-8 h-8 rounded-full bg-surface-hover text-text-muted flex items-center justify-center shrink-0 mt-1">2</div>
                  <div>
                    <h3 className="font-medium text-text-primary">2. Create your first Menu</h3>
                    <p className="text-sm text-text-secondary opacity-60 mb-3">Add categories and dishes so guests have something to browse.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate("/manager/menu")} className="rounded-full">Go to Menu Editor</Button>
                  </div>
                </div>

                <div className="flex items-start gap-10 p-8 rounded-sm bg-surface border border-divider shadow-premium">
                  <div className="w-8 h-8 rounded-full bg-surface-hover text-text-muted flex items-center justify-center shrink-0 mt-1">3</div>
                  <div>
                    <h3 className="font-medium text-text-primary">3. Invite your Team</h3>
                    <p className="text-sm text-text-secondary opacity-60 mb-3">Add staff to help manage orders and guests.</p>
                    <Button size="sm" variant="outline" onClick={() => navigate("/manager/home")} className="rounded-full">Go to Settings</Button>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => navigate("/manager/home")} className="px-10 py-6 text-lg rounded-full w-full sm:w-auto shadow-premium hover:shadow-premium-hover transition-all">
              Complete Onboarding <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent pointer-events-none" />
      
      {/* Header with Step Progress */}
      {step > 0 && step < 5 && (
        <div className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-10 animate-in fade-in duration-500">
          <div className="font-serif font-medium text-xl text-text-primary tracking-tight">ScanVista</div>
          <div className="text-sm font-medium text-text-muted tracking-widest uppercase">
            Step {step} of 4
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 mt-16 md:mt-0">
        {renderStep()}
      </div>
    </div>
  );
}
