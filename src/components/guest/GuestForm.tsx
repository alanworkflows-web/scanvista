import React from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { GuestStatus } from "../../lib/guestJourney";

export interface GuestFormData {
  name: string;
  phone: string;
  roomNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  notes: string;
  status: string;
}

interface GuestFormProps {
  formData: GuestFormData;
  onChange: (data: GuestFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function GuestForm({ formData, onChange, onSave, onCancel, isEditing }: GuestFormProps) {
  const set = (key: keyof GuestFormData, value: string) =>
    onChange({ ...formData, [key]: value });

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit guest" : "Add new guest"}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[85dvh] overflow-y-auto">
        <h3 className="font-bold text-xl mb-6 text-gray-900">
          {isEditing ? "Edit Guest" : "Add New Guest"}
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="guest-name" className="text-sm font-medium flex justify-between">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="guest-name"
              value={formData.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="guest-phone" className="text-sm font-medium flex justify-between">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="guest-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 234 567 8900"
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="guest-room" className="text-sm font-medium">Room Number</label>
            <Input
              id="guest-room"
              value={formData.roomNumber}
              onChange={(e) => set("roomNumber", e.target.value)}
              placeholder="101"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="guest-arrival-date" className="text-sm font-medium">Arrival Date</label>
              <Input
                id="guest-arrival-date"
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => set("arrivalDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="guest-arrival-time" className="text-sm font-medium">ETA</label>
              <Input
                id="guest-arrival-time"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => set("arrivalTime", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="guest-notes" className="text-sm font-medium">
              Quick Notes / Tags (Comma separated)
            </label>
            <Input
              id="guest-notes"
              value={formData.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="VIP, Late Arrival, Wheelchair..."
            />
          </div>

          {isEditing && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label htmlFor="guest-status-override" className="text-sm font-medium text-gray-500">
                Override Status (Optional)
              </label>
              <select
                id="guest-status-override"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="BOOKED">Booked</option>
                <option value="ARRIVING">Arriving</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="STAYING">Staying</option>
                <option value="CHECKED_OUT">Checked Out</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave} disabled={!formData.name || !formData.phone}>
            Save Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
