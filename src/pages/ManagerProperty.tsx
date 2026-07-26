import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { toast } from "sonner";
import { 
  Save, Phone, MapPin, Mail, MessageSquare, Clock, Plus, 
  Trash2, Image as ImageIcon, Building2, Map, ShieldAlert
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";
import { dispatchSync } from "../lib/sync";


const PRESET_ICONS = ["🏊‍♂️", "💆‍♀️", "🏋️‍♂️", "🍸", "☕", "🚗", "📶", "🌊", "🎾", "🧖‍♂️", "🍽️", "🥐", "🛎️"];

const AmenityEditorCard = ({ amenity, onUpdate, onRemove }: any) => {
  const [localData, setLocalData] = useState(amenity);

  const updateField = (field: string, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  return (
    <div className="bg-surface border border-divider rounded-xl p-6 shadow-premium space-y-6 relative hover:border-[#D4AF37]/50 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-divider pb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          {/* Quick Icon selector */}
          <div className="relative group">
            <button type="button" className="w-12 h-12 bg-background border border-divider rounded-lg text-2xl flex items-center justify-center hover:border-primary transition-colors">
              {localData.icon || "🏊‍♂️"}
            </button>
            <div className="absolute top-14 left-0 bg-surface border border-divider rounded-lg p-2 shadow-xl z-20 hidden group-hover:grid grid-cols-5 gap-1.5 w-48">
              {PRESET_ICONS.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => updateField("icon", ico)}
                  className="p-1.5 text-xl hover:bg-background rounded transition-colors text-center"
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center text-xs text-text-muted">
              <label className="font-medium">Amenity Name</label>
              <span>{(localData.name || "").length}/60</span>
            </div>
            <Input
              value={localData.name || ""}
              maxLength={60}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Infinity Horizon Pool"
              className="font-medium text-text-primary h-10"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors self-end sm:self-center"
          title="Remove Amenity"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Description & Rules */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-text-muted">
              <label className="font-medium">Description</label>
              <span>{(localData.description || "").length}/250</span>
            </div>
            <textarea
              maxLength={250}
              rows={3}
              value={localData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the amenity experience, highlights, or offerings..."
              className="w-full text-sm text-text-primary bg-background border border-divider rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-text-muted">
              <label className="font-medium">Rules & Guidelines</label>
              <span>{(localData.rules || "").length}/150</span>
            </div>
            <Input
              maxLength={150}
              value={localData.rules || ""}
              onChange={(e) => updateField("rules", e.target.value)}
              placeholder="e.g. Swimming attire required. Children under 12 must be accompanied."
              className="text-sm"
            />
          </div>
        </div>

        {/* Right Column: Hours, Location, Reservation & Image */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Opening Time</label>
              <Input
                type="text"
                value={localData.openTime || ""}
                onChange={(e) => updateField("openTime", e.target.value)}
                placeholder="07:00 AM"
                className="text-sm h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Closing Time</label>
              <Input
                type="text"
                value={localData.closeTime || ""}
                onChange={(e) => updateField("closeTime", e.target.value)}
                placeholder="10:00 PM"
                className="text-sm h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Location / Zone</label>
              <Input
                value={localData.location || ""}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. 5th Floor Terrace"
                className="text-sm h-10"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Floor / Access</label>
              <Input
                value={localData.floor || ""}
                onChange={(e) => updateField("floor", e.target.value)}
                placeholder="e.g. Level 5"
                className="text-sm h-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!localData.requiresReservation}
                onChange={(e) => updateField("requiresReservation", e.target.checked)}
                className="w-4 h-4 rounded border-divider text-primary focus:ring-primary"
              />
              Requires Prior Reservation
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ManagerProperty() {
  const { property, amenities, loading, refreshProperty } = useManagerProperty();
  const [activeTab, setActiveTab] = useState<'contacts' | 'amenities'>('contacts');
  const [saving, setSaving] = useState(false);

  // Contacts State
  const [contacts, setContacts] = useState({
    receptionPhone: "",
    emergencyPhone: "",
    whatsapp: "",
    email: "",
    googleMapsUrl: "",
    operatingHours: ""
  });

  // Amenities State
  const [localAmenities, setLocalAmenities] = useState<any[]>([]);

  useEffect(() => {
    if (property) {
      const rawContacts = property.contacts ? (typeof property.contacts === 'string' ? JSON.parse(property.contacts) : property.contacts) : null;
      const parsedContacts = rawContacts || {};
      setContacts({
        receptionPhone: property.receptionPhone || "",
        emergencyPhone: property.emergencyPhone || "",
        whatsapp: parsedContacts.whatsapp || "",
        email: parsedContacts.email || "",
        googleMapsUrl: parsedContacts.googleMapsUrl || "",
        operatingHours: parsedContacts.operatingHours || ""
      });
    }
    if (amenities) {
      setLocalAmenities(amenities.map((a: any) => ({...a})));
    }
  }, [property, amenities]);

  const handleSaveContacts = async () => {
    setSaving(true);
    dispatchSync('saving');
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receptionPhone: contacts.receptionPhone,
          emergencyPhone: contacts.emergencyPhone,
          contacts: {
            whatsapp: contacts.whatsapp,
            email: contacts.email,
            googleMapsUrl: contacts.googleMapsUrl,
            operatingHours: contacts.operatingHours
          }
        })
      });
      if (!res.ok) throw new Error("We couldn't save your updates. Please try again.");
      await refreshProperty();
      dispatchSync('synced');
      toast.success("Property contacts saved successfully");
    } catch (e: any) {
      dispatchSync('idle');
      toast.error(e.message || "Failed to save contacts");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAmenities = async () => {
    if (localAmenities.some(a => !a.name.trim())) {
      toast.error("Please enter a name for all amenities.");
      return;
    }
    setSaving(true);
    dispatchSync('saving');
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/amenities`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amenities: localAmenities.map((a, i) => ({ ...a, order: i })) })
      });
      if (!res.ok) throw new Error("We couldn't save your updates. Please try again.");
      await refreshProperty();
      dispatchSync('synced');
      toast.success("Amenities saved successfully");
    } catch (e: any) {
      dispatchSync('idle');
      toast.error(e.message || "Failed to save amenities");
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    setLocalAmenities([...localAmenities, {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      icon: "Wifi",
      available: true,
      order: localAmenities.length
    }]);
  };

  const removeAmenity = (id: string) => {
    if (window.confirm("Are you sure you want to remove this?")) {
      setLocalAmenities(localAmenities.filter(a => a.id !== id));
    }
  };

  const updateAmenityFull = (updatedAmenity: any) => {
    setLocalAmenities(localAmenities.map(a => a.id === updatedAmenity.id ? updatedAmenity : a));
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
      <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight flex items-center gap-2">
            <Building2 className="text-text-muted" /> Hotel Information
          </h1>
          <p className="text-text-secondary opacity-60 mt-1">Configure amenities and contact details for your guests.</p>
        </div>
        <Button 
          onClick={activeTab === 'contacts' ? handleSaveContacts : handleSaveAmenities} 
          isLoading={saving}
          className="shadow-premium shadow-emerald-200"
        >
          <Save size={18} className="mr-2" /> Save {activeTab === 'contacts' ? 'Contacts' : 'Amenities'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto pb-20">
        
        {/* Custom Tab Navigation */}
        <div className="flex items-center gap-2 mb-12 bg-surface-hover/50 p-1.5 rounded-sm w-fit border border-divider/50">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-6 py-2.5 rounded-sm font-medium text-sm transition-all duration-200 ${
              activeTab === 'contacts' ? "bg-surface text-text-primary shadow-premium" : "text-text-secondary opacity-60 hover:text-text-secondary hover:bg-gray-200/50"
            }`}
          >
            Guest Directory
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`px-6 py-2.5 rounded-sm font-medium text-sm transition-all duration-200 ${
              activeTab === 'amenities' ? "bg-surface text-text-primary shadow-premium" : "text-text-secondary opacity-60 hover:text-text-secondary hover:bg-gray-200/50"
            }`}
          >
            Amenities
          </button>
        </div>

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            
            <div className="bg-surface rounded-sm border border-divider shadow-premium p-8 lg:p-8">
              <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2 pb-4 border-b border-divider">
                <Phone size={20} className="text-indigo-500" /> Primary Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Reception Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                      <Phone size={16} />
                    </div>
                    <Input 
                      value={contacts.receptionPhone} 
                      onChange={e => setContacts({...contacts, receptionPhone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Emergency Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-400">
                      <ShieldAlert size={16} />
                    </div>
                    <Input 
                      value={contacts.emergencyPhone} 
                      onChange={e => setContacts({...contacts, emergencyPhone: e.target.value})}
                      placeholder="911 or internal emergency line"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-sm border border-divider shadow-premium p-8 lg:p-8">
              <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2 pb-4 border-b border-divider">
                <Map size={20} className="text-primary" /> Location & Hours
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Google Maps URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                      <MapPin size={16} />
                    </div>
                    <Input 
                      value={contacts.googleMapsUrl} 
                      onChange={e => setContacts({...contacts, googleMapsUrl: e.target.value})}
                      placeholder="https://maps.google.com/..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Operating Hours</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                      <Clock size={16} />
                    </div>
                    <Input 
                      value={contacts.operatingHours} 
                      onChange={e => setContacts({...contacts, operatingHours: e.target.value})}
                      placeholder="24/7 or 8:00 AM - 10:00 PM"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-sm border border-divider shadow-premium p-8 lg:p-8">
              <h2 className="text-lg font-medium text-text-primary mb-12 flex items-center gap-2 pb-4 border-b border-divider">
                <MessageSquare size={20} className="text-blue-500" /> Digital Channels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">WhatsApp Link (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                      <MessageSquare size={16} />
                    </div>
                    <Input 
                      value={contacts.whatsapp} 
                      onChange={e => setContacts({...contacts, whatsapp: e.target.value})}
                      placeholder="wa.me/..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1.5">Email (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                      <Mail size={16} />
                    </div>
                    <Input 
                      value={contacts.email} 
                      onChange={e => setContacts({...contacts, email: e.target.value})}
                      placeholder="hello@property.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="bg-surface rounded-sm border border-divider shadow-premium p-8 lg:p-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
                 <Building2 size={20} className="text-primary" /> Property Amenities
              </h2>
              <Button onClick={addAmenity} variant="secondary" size="sm">
                <Plus size={16} className="mr-1" /> Add Amenity
              </Button>
            </div>
            
            {localAmenities.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-divider rounded-sm bg-surface/50">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-premium mx-auto mb-4 text-primary">
                  <Building2 size={32} />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-1">No amenities listed</h3>
                <p className="text-sm text-text-secondary opacity-60 mb-12 max-w-sm mx-auto">Add facilities like Pool, Spa, or Gym so guests know what your property offers.</p>
                <Button onClick={addAmenity}>Add First Amenity</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {localAmenities.map((amenity) => (
                  <AmenityEditorCard 
                    key={amenity.id} 
                    amenity={amenity} 
                    onUpdate={updateAmenityFull} 
                    onRemove={() => removeAmenity(amenity.id)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ManagerLayout>
  );
}
