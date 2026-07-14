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
    preset: "classic"
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
        preset: "classic"
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

  if (loading) return <ManagerLayout><div className="p-8 text-gray-500">Loading Studio...</div></ManagerLayout>;
  if (!property) return <ManagerLayout><div className="p-8 text-red-500">Error loading property</div></ManagerLayout>;

  return (
    <ManagerLayout>
      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-80px)] lg:h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-50">
        
        {/* LEFT COLUMN: Editor */}
        <div className="w-full lg:w-[600px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 space-y-10">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">Brand Studio</h1>
                <p className="text-gray-500">Auto-saving as you type.</p>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && <span className="text-sm font-medium text-amber-500 flex items-center"><Loader2 className="animate-spin mr-1" size={14}/> Saving...</span>}
                {saveStatus === 'saved' && <span className="text-sm font-medium text-emerald-500 flex items-center"><CheckCircle2 className="mr-1" size={14}/> Saved</span>}
              </div>
            </div>

            <section className="space-y-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Identity</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
                <Input 
                  value={formData.name} 
                  onChange={e => handleChange('name', e.target.value)} 
                  placeholder="e.g. The Rustic Spoon"
                  className="bg-gray-50 text-lg font-serif"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">The Story</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => handleChange('description', e.target.value)} 
                  rows={4}
                  placeholder="Describe your culinary vision..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hero Image URL</label>
                <Input 
                  value={formData.bannerUrl} 
                  onChange={e => handleChange('bannerUrl', e.target.value)} 
                  placeholder="https://images.unsplash.com/..."
                  icon={<ImageIcon size={16} />}
                />
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Aesthetics</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(brandPresets).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleChange('preset', preset.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      formData.preset === preset.id ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-full h-8 rounded-lg mb-3 shadow-sm", preset.bg, preset.id === 'classic' && "border border-gray-200")} />
                    <div className="font-bold text-sm text-gray-900">{preset.label}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6 pb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contact & Connect</h2>
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
        <div className="hidden lg:flex flex-1 bg-gray-100 flex-col items-center justify-center p-8">
          <div className="w-[375px] h-[700px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-50"></div>
            
            {/* Live Render */}
            <div className={cn("flex-1 overflow-y-auto hide-scrollbar relative", brandPresets[formData.preset as keyof typeof brandPresets]?.bg)}>
              <div className="h-64 relative">
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">{formData.name || "Restaurant Name"}</h1>
                  {formData.wifiNetwork && <Badge className="bg-white/20 text-white backdrop-blur-md border-0"><Wifi size={12} className="mr-1"/> WiFi: {formData.wifiNetwork}</Badge>}
                </div>
              </div>

              <div className={cn("p-6", brandPresets[formData.preset as keyof typeof brandPresets]?.text)}>
                {formData.description && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-3">Our Story</h3>
                    <p className="text-sm opacity-90 leading-relaxed font-serif">{formData.description}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className={cn("h-24 rounded-xl border flex items-center justify-center opacity-50", brandPresets[formData.preset as keyof typeof brandPresets]?.text === 'text-gray-900' ? "border-gray-200" : "border-white/20")}>
                    <span className="text-sm font-bold">Menu Preview</span>
                  </div>
                  <div className={cn("h-24 rounded-xl border flex items-center justify-center opacity-50", brandPresets[formData.preset as keyof typeof brandPresets]?.text === 'text-gray-900' ? "border-gray-200" : "border-white/20")}>
                    <span className="text-sm font-bold">Menu Preview</span>
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
