import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { toast } from "sonner";
import { Image, Type, Palette, Save, Layout, Smartphone, Store, Eye, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";

export function ManagerExperience() {
  const { property, loading, refreshProperty } = useManagerProperty();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({
    heroImage: "",
    logoUrl: "",
    tagline: "",
    welcomeMessage: "",
    themeColors: {
      primary: "#10b981",
      accent: "#f59e0b"
    }
  });

  useEffect(() => {
    if (property) {
      setFormData({
        heroImage: property.heroImage || "",
        logoUrl: property.logoUrl || "",
        tagline: property.tagline || "",
        welcomeMessage: property.welcomeMessage || "",
        themeColors: property.themeColors || { primary: "#10b981", accent: "#f59e0b" }
      });
    }
  }, [property]);

  const hasUnsavedChanges = property ? JSON.stringify(formData) !== JSON.stringify({
    heroImage: property.heroImage || "",
    logoUrl: property.logoUrl || "",
    tagline: property.tagline || "",
    welcomeMessage: property.welcomeMessage || "",
    themeColors: property.themeColors || { primary: "#10b981", accent: "#f59e0b" }
  }) : false;

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to save experience settings");
      await refreshProperty();
      toast.success("Experience settings saved successfully!");
      setLastSaved(new Date());
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
      if (saveStatus !== "saved") setSaveStatus("error");
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-divider border-t-emerald-600 animate-spin" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight flex items-center gap-2">
            <Layout className="text-text-muted" /> Guest Experience
          </h1>
          <p className="text-text-secondary opacity-60 mt-1">Design the digital experience your guests will see.</p>
        </div>
        <div className="flex items-center gap-4">
          {saveStatus === 'saving' && <span className="text-sm font-medium text-amber-500 flex items-center"><Loader2 className="animate-spin mr-1" size={14}/> Saving...</span>}
          {saveStatus === 'saved' && <span className="text-sm font-medium text-primary flex items-center"><CheckCircle2 className="mr-1" size={14}/> Saved</span>}
          <Button onClick={handleSave} isLoading={saving} className="shadow-premium shadow-emerald-200">
            <Save size={18} className="mr-2" /> Save Experience
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto pb-20">
        
        {/* Left Column: Form Settings */}
        <div className="flex-1 space-y-6">
          <div className="bg-surface rounded-sm border border-divider shadow-premium p-8">
            <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2">
              <Image size={20} className="text-indigo-500" /> Branding
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Hero Image</label>
                <ImageUploader 
                  value={formData.heroImage} 
                  onChange={val => setFormData(p => ({...p, heroImage: val}))}
                  label="Upload Hero Image"
                  aspectRatio="video"
                />
                <p className="text-xs text-text-secondary opacity-60 mt-1">This image will appear at the top of your guest app.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Logo</label>
                <ImageUploader 
                  value={formData.logoUrl} 
                  onChange={val => setFormData(p => ({...p, logoUrl: val}))}
                  label="Upload Logo"
                  aspectRatio="square"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-sm border border-divider shadow-premium p-8">
            <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2">
              <Type size={20} className="text-blue-500" /> Messaging
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Property Tagline</label>
                <Input 
                  value={formData.tagline} 
                  onChange={e => setFormData(p => ({...p, tagline: e.target.value}))}
                  placeholder="e.g. A slice of paradise"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Welcome Message</label>
                <textarea 
                  className="w-full bg-background border border-divider rounded-sm p-8 text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={4}
                  value={formData.welcomeMessage} 
                  onChange={e => setFormData(p => ({...p, welcomeMessage: e.target.value}))}
                  placeholder="Welcome to our hotel! We're delighted to host you..."
                />
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-sm border border-divider shadow-premium p-8">
            <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2">
              <Palette size={20} className="text-rose-500" /> Theme Colors
            </h2>
            
            <div className="grid grid-cols-2 gap-10">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={formData.themeColors.primary}
                    onChange={e => setFormData(p => ({...p, themeColors: {...p.themeColors, primary: e.target.value}}))}
                    className="h-10 w-14 p-1 rounded border border-divider cursor-pointer"
                  />
                  <Input 
                    value={formData.themeColors.primary} 
                    onChange={e => setFormData(p => ({...p, themeColors: {...p.themeColors, primary: e.target.value}}))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={formData.themeColors.accent}
                    onChange={e => setFormData(p => ({...p, themeColors: {...p.themeColors, accent: e.target.value}}))}
                    className="h-10 w-14 p-1 rounded border border-divider cursor-pointer"
                  />
                  <Input 
                    value={formData.themeColors.accent} 
                    onChange={e => setFormData(p => ({...p, themeColors: {...p.themeColors, accent: e.target.value}}))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
          <div className="bg-surface-hover rounded-[3rem] p-8 shadow-premium border-8 border-divider relative overflow-hidden h-[750px] w-[375px] mx-auto">
            {/* Mobile Notch Mock */}
            <div className="absolute top-0 inset-x-0 h-7 bg-gray-200 rounded-b-3xl w-40 mx-auto z-50 flex items-center justify-center">
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Simulated Guest App Screen */}
            <div className="bg-surface w-full h-full rounded-[2rem] overflow-hidden overflow-y-auto hide-scrollbar flex flex-col relative pb-20">
              
              {/* Dynamic Hero */}
              <div className="h-64 bg-gray-200 relative shrink-0">
                {formData.heroImage ? (
                  <img src={formData.heroImage} className="w-full h-full object-cover" alt="Hero" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?w=400&q=80"; e.currentTarget.classList.add("blur-sm"); }} />
                ) : (
                  <div className="w-full h-full relative overflow-hidden bg-gray-900">
                    <img src="https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?w=400&q=80" className="w-full h-full object-cover blur-md opacity-40 scale-110" alt="Placeholder" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col text-white z-10 drop-shadow-premium">
                      <Image size={32} className="mb-2 opacity-80" />
                      <span className="text-[10px] font-medium uppercase tracking-widest opacity-80">Add Hero Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  {formData.logoUrl && (
                    <img src={formData.logoUrl} className="h-10 bg-surface/10 backdrop-blur rounded p-1 mb-2 max-w-[120px] object-contain" alt="Logo" onError={(e) => e.currentTarget.style.display = "none"} />
                  )}
                  <h1 className="text-2xl font-serif font-medium text-white leading-tight">
                    {property?.name || "Your Property"}
                  </h1>
                  <p className="text-white/90 text-sm font-medium">{formData.tagline || "Your tagline here"}</p>
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="p-8 flex-1 bg-background">
                <div className="bg-surface rounded-sm p-8 shadow-premium border border-divider mb-4">
                  <h2 className="font-medium text-text-primary mb-2">Welcome</h2>
                  <p className="text-sm text-text-secondary opacity-80 leading-relaxed whitespace-pre-wrap">
                    {formData.welcomeMessage || "Welcome message will appear here."}
                  </p>
                </div>
                
                {/* Simulated Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface rounded-sm p-8 shadow-premium border border-divider flex flex-col items-center justify-center gap-2" style={{ borderTop: `4px solid ${formData.themeColors.primary}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${formData.themeColors.primary}20`, color: formData.themeColors.primary }}>
                      <Smartphone size={20} />
                    </div>
                    <span className="text-xs font-medium">Reception</span>
                  </div>
                  <div className="bg-surface rounded-sm p-8 shadow-premium border border-divider flex flex-col items-center justify-center gap-2" style={{ borderTop: `4px solid ${formData.themeColors.accent}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${formData.themeColors.accent}20`, color: formData.themeColors.accent }}>
                      <Store size={20} />
                    </div>
                    <span className="text-xs font-medium">Menu</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <p className="text-center text-text-muted text-sm mt-6 flex items-center justify-center gap-2">
            <Eye size={16} /> Live Guest Preview
          </p>
        </div>

      </div>
    </ManagerLayout>
  );
}
