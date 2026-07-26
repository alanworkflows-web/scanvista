import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Camera, MapPin, Globe, Phone, Mail, Clock, Map, PhoneCall, 
  Wifi, Car, Dog, Accessibility, CheckCircle2, AlertTriangle, 
  ChevronRight, Save, Image as ImageIcon, Loader2, PlayCircle, Star, Coffee, UtensilsCrossed, Wine, Sunrise
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { cn } from "../lib/utils";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { brandPresets } from "../design/theme";

const PERSONALITIES = [
  { id: "luxury", label: "Luxury", icon: <Star size={24} />, desc: "Premium dining experience" },
  { id: "family", label: "Family Friendly", icon: <PlayCircle size={24} />, desc: "Welcoming for all ages" },
  { id: "fine-dining", label: "Fine Dining", icon: <Wine size={24} />, desc: "Exquisite culinary arts" },
  { id: "cafe", label: "Café & Bakery", icon: <Coffee size={24} />, desc: "Casual and comfortable" },
  { id: "resort", label: "Resort", icon: <Sunrise size={24} />, desc: "Destination dining" },
];

export function BrandStudio() {
  const { property, loading, error } = useManagerProperty();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerUrl: "",
    receptionPhone: "",
    wifiNetwork: "",
    propertyType: "HOTEL",
    preset: "classic",
    // Property DNA
    guestType: "Families",
    personality: "Relaxed",
    peak: "Friday Dinner",
    risk: "Supplier Delays",
    strength: "Personalized Service"
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize form
  useEffect(() => {
    if (property && !formData.name) {
      setFormData({
        name: property.name || "",
        description: property.description || "",
        bannerUrl: property.bannerUrl || "",
        receptionPhone: property.receptionPhone || "",
        wifiNetwork: property.wifiNetwork || "",
        propertyType: property.propertyType || "HOTEL",
        preset: "classic",
        guestType: property.guestType || "Families",
        personality: property.personality || "Relaxed",
        peak: property.peak || "Friday Dinner",
        risk: property.risk || "Supplier Delays",
        strength: property.strength || "Personalized Service"
      });
    }
  }, [property]);

  const triggerSave = useCallback(async (dataToSave: typeof formData) => {
    if (!property?.slug) return;
    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/manager/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSaveStatus("saved");
      // Fire global sync event for the top nav indicator
      window.dispatchEvent(new CustomEvent('scanvista-sync', { detail: 'synced' }));
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("error");
    }
  }, [property]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    
    // Global saving indicator immediately
    window.dispatchEvent(new CustomEvent('scanvista-sync', { detail: 'saving' }));
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      triggerSave(updated);
    }, 750); // 750ms debounce
  };

  if (loading) return <ManagerLayout><div className="p-8 text-text-secondary opacity-60">Loading Studio...</div></ManagerLayout>;
  if (!property) return <ManagerLayout><div className="p-8 text-red-500">Error loading property</div></ManagerLayout>;

  return (
    <ManagerLayout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-80px)] lg:h-[calc(100vh-80px)] w-full overflow-hidden bg-background">
        
        {/* LEFT COLUMN: Editor */}
        <div className="w-full lg:w-[600px] bg-surface border-r border-divider flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 space-y-10">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-medium text-text-primary">Brand Studio</h1>
                <p className="text-text-secondary opacity-60">Auto-saving as you type.</p>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && <span className="text-sm font-medium text-amber-500 flex items-center"><Loader2 className="animate-spin mr-1" size={14}/> Saving...</span>}
                {saveStatus === 'saved' && <span className="text-sm font-medium text-primary flex items-center"><CheckCircle2 className="mr-1" size={14}/> Saved</span>}
              </div>
            </div>

            <section className="space-y-6">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Identity</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Restaurant Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                  placeholder="e.g. The Rustic Spoon"
                  className="bg-background text-lg font-serif"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">The Story</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => handleChange('description', e.target.value)} 
                  rows={4}
                  placeholder="Describe your culinary vision..."
                  className="w-full p-8 bg-background border border-divider rounded-sm text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Hero Image URL</label>
                <Input 
                  value={formData.bannerUrl} 
                  onChange={e => handleChange('bannerUrl', e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  icon={<ImageIcon size={16} />}
                />
              </div>

              <div className="mt-8 pt-6 border-t border-divider">
                <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                  <Star className="text-indigo-500" size={16} /> Property DNA
                </h3>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary opacity-60 uppercase tracking-wider">Guest Type</label>
                    <Input value={formData.guestType} onChange={e => handleChange('guestType', e.target.value)} placeholder="e.g. Families" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary opacity-60 uppercase tracking-wider">Personality</label>
                    <Input value={formData.personality} onChange={e => handleChange('personality', e.target.value)} placeholder="e.g. Relaxed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary opacity-60 uppercase tracking-wider">Peak Time</label>
                    <Input value={formData.peak} onChange={e => handleChange('peak', e.target.value)} placeholder="e.g. Friday Dinner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-secondary opacity-60 uppercase tracking-wider">Core Strength</label>
                    <Input value={formData.strength} onChange={e => handleChange('strength', e.target.value)} placeholder="e.g. Personalized Service" />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-medium text-amber-600 uppercase tracking-wider">Primary Risk</label>
                    <Input value={formData.risk} onChange={e => handleChange('risk', e.target.value)} placeholder="e.g. Supplier Delays" className="border-amber-200 focus:border-amber-400 focus:ring-amber-400/20" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Aesthetics</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(brandPresets).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleChange('preset', preset.id)}
                    className={cn(
                      "p-8 rounded-sm border-2 text-left transition-all",
                      formData.preset === preset.id ? "border-primary ring-4 ring-primary/10" : "border-divider hover:border-divider"
                    )}
                  >
                    <div className={cn("w-full h-8 rounded-sm mb-3 shadow-premium", preset.bg, preset.id === 'classic' && "border border-divider")} />
                    <div className="font-medium text-sm text-text-primary">{preset.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6 pb-8">
              <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider">Contact & Connect</h2>
              <div className="space-y-4">
                <Input 
                  value={formData.receptionPhone} 
                  onChange={e => handleChange('receptionPhone', e.target.value)} 
                  placeholder="Phone Number"
                  icon={<Phone size={16} />}
                />
                <Input 
                  value={formData.wifiNetwork} 
                  onChange={e => handleChange('wifiNetwork', e.target.value)} 
                  placeholder="Guest WiFi Password"
                  icon={<Wifi size={16} />}
                />
              </div>
            </section>

          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="hidden lg:flex flex-1 bg-surface-hover flex-col items-center justify-center p-8">
          <div className="w-[375px] h-[700px] bg-surface rounded-[2.5rem] shadow-premium-hover overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-50"></div>
            
            {/* Live Render */}
            <div className={cn("flex-1 overflow-y-auto hide-scrollbar relative", brandPresets[formData.preset as keyof typeof brandPresets]?.bg)}>
              <div className="h-64 relative">
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-text-muted"><ImageIcon size={32}/></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-serif font-medium text-white mb-2 leading-tight">{formData.name || "Restaurant Name"}</h1>
                  {formData.wifiNetwork && <Badge className="bg-surface/20 text-white backdrop-blur-md border-0"><Wifi size={12} className="mr-1"/> WiFi: {formData.wifiNetwork}</Badge>}
                </div>
              </div>

              <div className={cn("p-8", brandPresets[formData.preset as keyof typeof brandPresets]?.text)}>
                {formData.description && (
                  <div className="mb-12">
                    <h3 className="text-sm font-medium uppercase tracking-widest opacity-50 mb-3">Our Story</h3>
                    <p className="text-sm opacity-90 leading-relaxed font-serif">{formData.description}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className={cn("h-24 rounded-sm border flex items-center justify-center opacity-50", brandPresets[formData.preset as keyof typeof brandPresets]?.text === 'text-text-primary' ? "border-divider" : "border-white/20")}>
                    <span className="text-sm font-medium">Menu Preview</span>
                  </div>
                  <div className={cn("h-24 rounded-sm border flex items-center justify-center opacity-50", brandPresets[formData.preset as keyof typeof brandPresets]?.text === 'text-text-primary' ? "border-divider" : "border-white/20")}>
                    <span className="text-sm font-medium">Menu Preview</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </ManagerLayout>
  );
}
