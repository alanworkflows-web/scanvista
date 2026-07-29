import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { toast } from "sonner";
import { 
  Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Image as ImageIcon, CheckCircle, XCircle
} from "lucide-react";
import { Reorder, motion } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";
import { cn } from "../lib/utils";

const PRESET_ICONS = ["🏊‍♂️", "🏋️‍♀️", "💆‍♀️", "🎾", "🏌️‍♂️", "🍷", "☕", "🚗", "🐾", "🛜", "🛎️", "🍽️", "🌊"];

export function ManagerAmenities() {
  const { property, amenities: initialAmenities, loading, refreshProperty } = useManagerProperty();
  const [amenities, setAmenities] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialAmenities) {
      setAmenities([...initialAmenities].sort((a, b) => (a.priority || 0) - (b.priority || 0)));
    }
  }, [initialAmenities]);

  const updateAmenity = (id: string, field: string, value: any) => {
    setAmenities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addAmenity = () => {
    const newId = `temp-${Date.now()}`;
    setAmenities(prev => [...prev, {
      id: newId,
      name: "",
      description: "",
      icon: "🏊‍♂️",
      imageUrl: "",
      openTime: "",
      closeTime: "",
      location: "",
      rules: "",
      status: "UNSAVED",
      priority: prev.length + 1
    }]);
    setExpandedId(newId);
  };

  const removeAmenity = (id: string) => {
    setAmenities(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    
    try {
      const payload = amenities.map((a, idx) => ({
        ...a,
        status: a.status === 'UNSAVED' ? 'HIDDEN' : a.status,
        priority: idx + 1,
      }));

      const res = await fetch(`/api/manager/properties/${property.slug}/amenities`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenities: payload })
      });

      if (!res.ok) throw new Error("Failed to save amenities");
      
      toast.success("Amenities updated successfully");
      refreshProperty();
    } catch (err) {
      toast.error("Failed to save amenities");
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
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight">Amenities</h1>
          <p className="text-text-secondary mt-1">Manage and sequence your property's amenities.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={addAmenity}>
            <Plus size={18} className="mr-2" /> Add Amenity
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <><Save size={18} className="mr-2"/> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl">
        {amenities.length === 0 ? (
          <div className="bg-surface border border-divider rounded-xl p-12 text-center shadow-premium">
            <h3 className="text-lg font-medium text-text-primary mb-2">No Amenities Yet</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">Add your first amenity to showcase what your property has to offer guests.</p>
            <Button onClick={addAmenity}><Plus size={18} className="mr-2"/> Add First Amenity</Button>
          </div>
        ) : (
          <Reorder.Group axis="y" values={amenities} onReorder={setAmenities} className="space-y-4">
            {amenities.map(amenity => (
              <Reorder.Item key={amenity.id} value={amenity} className="bg-surface border border-divider rounded-xl shadow-premium overflow-hidden transition-all">
                {/* Header Row */}
                <div className="flex items-center gap-4 p-4 bg-background/50 group">
                  <div className="cursor-grab text-text-muted hover:text-text-primary">
                    <GripVertical size={20} />
                  </div>
                  <div className="w-10 h-10 bg-background border border-divider rounded-lg flex items-center justify-center text-xl">
                    {amenity.icon}
                  </div>
                  <div className="flex-1 font-medium text-text-primary">
                    {amenity.name || "Unnamed Amenity"}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (amenity.status === 'UNSAVED') {
                          toast.error("Please save changes before publishing.");
                          return;
                        }
                        if (amenity.status !== 'ACTIVE' && !amenity.name?.trim()) {
                          toast.error("Amenity must have a name to be published.");
                          return;
                        }
                        updateAmenity(amenity.id, 'status', amenity.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE')
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        amenity.status === 'ACTIVE' 
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                          : amenity.status === 'UNSAVED'
                            ? "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      {amenity.status === 'ACTIVE' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                      {amenity.status === 'ACTIVE' ? 'Published' : amenity.status === 'UNSAVED' ? 'Unsaved Draft' : 'Draft'}
                    </button>
                    
                    <button 
                      onClick={() => setExpandedId(expandedId === amenity.id ? null : amenity.id)}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors"
                    >
                      {expandedId === amenity.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </button>
                    <button 
                      onClick={() => removeAmenity(amenity.id)}
                      className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === amenity.id && (
                  <div className="p-6 border-t border-divider space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Amenity Name</label>
                          <Input value={amenity.name} onChange={e => updateAmenity(amenity.id, 'name', e.target.value)} placeholder="e.g. Infinity Pool" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Icon</label>
                          <div className="flex flex-wrap gap-2">
                            {PRESET_ICONS.map(ico => (
                              <button
                                key={ico}
                                onClick={() => updateAmenity(amenity.id, 'icon', ico)}
                                className={cn(
                                  "w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all",
                                  amenity.icon === ico ? "border-primary bg-primary/5" : "border-divider hover:border-text-muted/30 bg-background"
                                )}
                              >
                                {ico}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Location</label>
                          <Input value={amenity.location} onChange={e => updateAmenity(amenity.id, 'location', e.target.value)} placeholder="e.g. 5th Floor Terrace" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Open Time</label>
                            <Input value={amenity.openTime} onChange={e => updateAmenity(amenity.id, 'openTime', e.target.value)} placeholder="07:00 AM" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Close Time</label>
                            <Input value={amenity.closeTime} onChange={e => updateAmenity(amenity.id, 'closeTime', e.target.value)} placeholder="10:00 PM" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Cover Image (Optional)</label>
                          <div className="h-32">
                            <ImageUploader 
                              value={amenity.imageUrl || amenity.heroImage} 
                              onChange={url => updateAmenity(amenity.id, 'imageUrl', url)}
                              aspectRatio="video"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Description</label>
                          <textarea 
                            value={amenity.description} 
                            onChange={e => updateAmenity(amenity.id, 'description', e.target.value)} 
                            rows={3}
                            placeholder="Describe the amenity..."
                            className="w-full p-3 bg-background border border-divider rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Notes & Rules</label>
                          <Input value={amenity.rules} onChange={e => updateAmenity(amenity.id, 'rules', e.target.value)} placeholder="e.g. Children must be supervised" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </ManagerLayout>
  );
}
