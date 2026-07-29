import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { toast } from "sonner";
import { Save, Clock, Moon, Wind, Dog, Waves, Baby, FileText } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function ManagerHouseRules() {
  const { property, loading, refreshProperty } = useManagerProperty();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    checkInTime: "",
    checkOutTime: "",
    quietHours: "",
    smokingPolicy: "",
    petPolicy: "",
    poolRules: "",
    childrenPolicy: "",
    customRules: "",
  });

  useEffect(() => {
    if (property) {
      const hotelRules = property.hotelRules ? (typeof property.hotelRules === 'string' ? JSON.parse(property.hotelRules) : property.hotelRules) : {};
      
      setFormData({
        checkInTime: property.checkInTime || "",
        checkOutTime: property.checkOutTime || "",
        quietHours: hotelRules.quietHours || "",
        smokingPolicy: hotelRules.smokingPolicy || "",
        petPolicy: hotelRules.petPolicy || "",
        poolRules: hotelRules.poolRules || "",
        childrenPolicy: hotelRules.childrenPolicy || "",
        customRules: hotelRules.customRules || "",
      });
    }
  }, [property]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    
    try {
      const updates = {
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        hotelRules: {
          quietHours: formData.quietHours,
          smokingPolicy: formData.smokingPolicy,
          petPolicy: formData.petPolicy,
          poolRules: formData.poolRules,
          childrenPolicy: formData.childrenPolicy,
          customRules: formData.customRules,
        }
      };

      const res = await fetch(`/api/manager/properties/${property.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error("Failed to save rules");
      
      toast.success("House rules updated successfully");
      refreshProperty();
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
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight">House Rules</h1>
          <p className="text-text-secondary mt-1">Manage policies and guidelines for your property.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <><Save size={18} className="mr-2"/> Save Changes</>}
        </Button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Core Times */}
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-premium">
          <h3 className="text-lg font-medium text-text-primary flex items-center gap-2 mb-6">
            <Clock className="text-primary" size={20} /> Operational Times
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Check-in Time</label>
              <Input 
                value={formData.checkInTime} 
                onChange={e => handleChange('checkInTime', e.target.value)} 
                placeholder="e.g. 3:00 PM"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 block">Check-out Time</label>
              <Input 
                value={formData.checkOutTime} 
                onChange={e => handleChange('checkOutTime', e.target.value)} 
                placeholder="e.g. 11:00 AM"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Moon size={14}/> Quiet Hours</label>
              <Input 
                value={formData.quietHours} 
                onChange={e => handleChange('quietHours', e.target.value)} 
                placeholder="e.g. 10:00 PM to 7:00 AM"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-premium">
          <h3 className="text-lg font-medium text-text-primary mb-6">Property Policies</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Wind size={14}/> Smoking Policy</label>
              <Input 
                value={formData.smokingPolicy} 
                onChange={e => handleChange('smokingPolicy', e.target.value)} 
                placeholder="e.g. Strictly non-smoking inside rooms. Designated areas outside."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Dog size={14}/> Pet Policy</label>
              <Input 
                value={formData.petPolicy} 
                onChange={e => handleChange('petPolicy', e.target.value)} 
                placeholder="e.g. Pets allowed under 20 lbs. $50 cleaning fee applies."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Waves size={14}/> Pool Rules</label>
              <Input 
                value={formData.poolRules} 
                onChange={e => handleChange('poolRules', e.target.value)} 
                placeholder="e.g. No glass near the pool. Swimwear required."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2"><Baby size={14}/> Children Policy</label>
              <Input 
                value={formData.childrenPolicy} 
                onChange={e => handleChange('childrenPolicy', e.target.value)} 
                placeholder="e.g. Children under 12 must be supervised at all times."
              />
            </div>
          </div>
        </div>

        {/* Custom Rules */}
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-premium">
          <h3 className="text-lg font-medium text-text-primary flex items-center gap-2 mb-4">
            <FileText className="text-primary" size={20} /> Custom Rules & Additional Info
          </h3>
          <textarea 
            value={formData.customRules} 
            onChange={e => handleChange('customRules', e.target.value)} 
            rows={5}
            placeholder="Any other rules, safety instructions, or guidelines you'd like your guests to know..."
            className="w-full p-4 bg-background border border-divider rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
      </div>
    </ManagerLayout>
  );
}
