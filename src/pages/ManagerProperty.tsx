import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { toast } from "sonner";
import { CheckCircle2,  
  Save, Phone, MapPin, Mail, MessageSquare, Image as ImageIcon, 
  Hotel, PaintBucket, Smartphone, Globe, QrCode
 } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";
import { brandPresets } from "../design/theme";
import { cn, buildGuestUrl } from "../lib/utils";

export function ManagerProperty() {
  const { property, loading, refreshProperty } = useManagerProperty();
  const [activeTab, setActiveTab] = useState<'info' | 'branding' | 'contacts' | 'qr'>('info');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    bannerUrl: "",
    preset: "classic",
    receptionPhone: "",
    whatsapp: "",
    emergencyPhone: "",
    housekeepingPhone: "",
  });

  useEffect(() => {
    if (property) {
      const contacts = property.contacts ? (typeof property.contacts === 'string' ? JSON.parse(property.contacts) : property.contacts) : {};
      const theme = property.themeColors ? (typeof property.themeColors === 'string' ? JSON.parse(property.themeColors) : property.themeColors) : {};
      
      setFormData({
        name: property.name || "",
        tagline: property.tagline || "",
        description: property.description || "",
        address: contacts.address || "",
        phone: contacts.phone || "",
        email: contacts.email || "",
        website: contacts.website || "",
        logoUrl: property.logoUrl || "",
        bannerUrl: property.bannerUrl || "",
        preset: theme.preset || "classic",
        receptionPhone: property.receptionPhone || "",
        whatsapp: contacts.whatsapp || "",
        emergencyPhone: property.emergencyPhone || "",
        housekeepingPhone: property.housekeepingPhone || "",
      });
    }
  }, [property]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    
    const checkPhone = (p) => !p || p.replace(/\D/g, '').length >= 10;
    if (formData.phone && !checkPhone(formData.phone)) { toast.error("Invalid phone number (must be at least 10 digits)"); setSaving(false); return; }
    if (formData.whatsapp && !checkPhone(formData.whatsapp)) { toast.error("Invalid WhatsApp number"); setSaving(false); return; }
    if (formData.receptionPhone && !checkPhone(formData.receptionPhone)) { toast.error("Invalid reception phone"); setSaving(false); return; }
    if (formData.emergencyPhone && !checkPhone(formData.emergencyPhone)) { toast.error("Invalid emergency phone"); setSaving(false); return; }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error("Invalid email address"); setSaving(false); return; }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) { toast.error("Invalid website URL (must start with http:// or https://)"); setSaving(false); return; }

    try {
      // Build the update payload mapping to Prisma schema
      const updates = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        receptionPhone: formData.receptionPhone,
        emergencyPhone: formData.emergencyPhone,
        housekeepingPhone: formData.housekeepingPhone,
        themeColors: { preset: formData.preset },
        contacts: {
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          whatsapp: formData.whatsapp,
        }
      };

      const res = await fetch(`/api/manager/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error("Failed to save property");
      
      setIsDirty(false);
      setSaveStatus("saved");
      toast.success("Property saved as Draft. Publish to make it visible to guests.");
      refreshProperty();
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <ManagerLayout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-divider border-t-primary animate-spin"></div>
      </div>
    </ManagerLayout>
  );

  return (
    <ManagerLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight">Property Profile</h1>
          <p className="text-text-secondary mt-1">Manage your hotel's core information and identity.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || (!isDirty && saveStatus !== "saved")} className="min-w-[120px] transition-all">
          {saving ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div> Saving...</> : saveStatus === "saved" ? <><CheckCircle2 size={18} className="mr-2 text-emerald-400"/> Saved</> : <><Save size={18} className="mr-2"/> Save Changes</>}
        </Button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar border-b border-divider">
        {[
          { id: 'info', label: 'Information', icon: <Hotel size={16} /> },
          { id: 'branding', label: 'Branding', icon: <PaintBucket size={16} /> },
          { id: 'contacts', label: 'Contact Details', icon: <Phone size={16} /> },
          { id: 'qr', label: 'QR & Links', icon: <QrCode size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
              activeTab === tab.id ? "text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {activeTab === 'info' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface border border-divider rounded-xl p-6 space-y-6 shadow-premium">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Property Name</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                     
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Tagline</label>
                  <Input 
                    value={formData.tagline} 
                    onChange={e => handleChange('tagline', e.target.value)} 
                     
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Description / Story</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => handleChange('description', e.target.value)} 
                    rows={4}
                    
                    className="w-full p-4 bg-background border border-divider rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Physical Address</label>
                  <Input 
                    value={formData.address} 
                    onChange={e => handleChange('address', e.target.value)} 
                    
                    icon={<MapPin size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface border border-divider rounded-xl p-6 space-y-8 shadow-premium">
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Cover Image</h3>
                <ImageUploader 
                  value={formData.bannerUrl}
                  onChange={(url) => handleChange('bannerUrl', url)}
                  aspectRatio="video"
                  
                />
              </div>

              <div className="space-y-4 pt-6 border-t border-divider">
                <h3 className="text-sm font-medium text-text-primary">Brand Logo</h3>
                <div className="w-48">
                  <ImageUploader 
                    value={formData.logoUrl}
                    onChange={(url) => handleChange('logoUrl', url)}
                    aspectRatio="square"
                    
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-divider">
                <h3 className="text-sm font-medium text-text-primary">Color Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(brandPresets).map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleChange('preset', preset.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        formData.preset === preset.id ? "border-primary bg-primary/5" : "border-divider hover:border-text-muted/30"
                      )}
                    >
                      <div className={cn("w-full h-8 rounded mb-2 shadow-sm", preset.bg, preset.id === 'classic' && "border border-divider")} />
                      <div className="font-medium text-sm text-text-primary">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface border border-divider rounded-xl p-6 space-y-6 shadow-premium">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Reception Phone</label>
                  <Input 
                    value={formData.receptionPhone} 
                    onChange={e => handleChange('receptionPhone', e.target.value)} 
                    
                    icon={<Phone size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">WhatsApp</label>
                  <Input 
                    value={formData.whatsapp} 
                    onChange={e => handleChange('whatsapp', e.target.value)} 
                    
                    icon={<MessageSquare size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Housekeeping</label>
                  <Input 
                    value={formData.housekeepingPhone} 
                    onChange={e => handleChange('housekeepingPhone', e.target.value)} 
                    
                    icon={<Phone size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Emergency Contact</label>
                  <Input 
                    value={formData.emergencyPhone} 
                    onChange={e => handleChange('emergencyPhone', e.target.value)} 
                    
                    icon={<Phone size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">General Email</label>
                  <Input 
                    value={formData.email} 
                    onChange={e => handleChange('email', e.target.value)} 
                    
                    icon={<Mail size={16} />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Website</label>
                  <Input 
                    value={formData.website} 
                    onChange={e => handleChange('website', e.target.value)} 
                    
                    icon={<Globe size={16} />}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'qr' && property && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-premium flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <QrCode size={32} />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">QR Generation</h3>
              <p className="text-text-secondary max-w-md mb-6">
                Generate high-quality printable QR codes for your rooms, reception, and keycards from the Publishing center.
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <a 
                  href={buildGuestUrl(property.previewToken)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-background border border-divider py-3 px-4 rounded-lg text-sm font-medium hover:border-primary transition-colors"
                >
                  <Smartphone size={16} /> Open Preview Link
                </a>
                
                {property.slug && (
                  <a 
                    href={buildGuestUrl(property.slug)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Globe size={16} /> View Published Page
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
