import React from "react";
import { Eye, Edit, Trash2, MapPin, Clock, AlertCircle, QrCode } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { JourneyTimeline } from "./JourneyTimeline";
import { getStatusColor, getStatusBorderColor, parseNoteTags } from "../../lib/guestJourney";
import { safeFormatTime } from "../../lib/dateUtils";
import type { Guest } from "../../lib/guestJourney";

interface GuestCardProps {
  guest: Guest;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
  onShare: (token: string) => void;
}

export const GuestCard: React.FC<GuestCardProps> = ({ guest, onEdit, onDelete, onShare }) => {
  const notesArray = parseNoteTags(guest.notes);

  return (
    <Card className={`p-8 flex flex-col hover:shadow-premium transition-all border-l-4 ${getStatusBorderColor(guest.status)}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-serif text-text-primary text-lg text-text-primary flex items-center gap-2">
            {guest.name}
            {!guest.phone && (
              <span className="flex items-center text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full" role="alert">
                <AlertCircle size={12} className="mr-1" aria-hidden="true" /> No Phone
              </span>
            )}
          </h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wider mt-2 inline-block ${getStatusColor(guest.status)}`}>
            {guest.status.replace("_", " ")}
          </span>
        </div>
        <div className="flex gap-1 text-text-muted">
          <button
            onClick={() => window.open(`/g/${guest.token}`, "_blank")}
            className="p-1 hover:text-text-primary"
            aria-label={`Preview journey for ${guest.name}`}
          >
            <Eye size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onEdit(guest)}
            className="p-1 hover:text-primary"
            aria-label={`Edit ${guest.name}`}
          >
            <Edit size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(guest.id)}
            className="p-1 hover:text-red-600"
            aria-label={`Delete ${guest.name}`}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="mb-4">
        <JourneyTimeline status={guest.status} arrivalDate={guest.arrivalDate} />
      </div>

      {/* Details & Link Analytics */}
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-1 text-sm text-text-secondary opacity-80">
          <div className="flex items-center gap-2">
            <MapPin size={14} aria-hidden="true" /> Room: <strong className="text-text-primary">{guest.roomNumber || "TBD"}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} aria-hidden="true" /> ETA:{" "}
            {guest.arrivalTime
              ? safeFormatTime(guest.arrivalTime, "TBD")
              : "TBD"}
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="text-text-muted uppercase font-medium tracking-wider mb-1">Journey Link</p>
          {guest.linkViewedAt ? (
            <p className="text-primary font-medium">
              Viewed ✓<br />
              {safeFormatTime(guest.linkViewedAt)}
            </p>
          ) : (
            <p className="text-text-secondary opacity-60">Not opened</p>
          )}
        </div>
      </div>

      {/* Note Tags */}
      {notesArray.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {notesArray.map((note, i) => (
            <span key={i} className="px-2 py-0.5 bg-surface-hover text-text-secondary rounded text-[10px] font-medium uppercase tracking-wider">
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Share Button */}
      <Button variant="secondary" className="mt-auto w-full group" onClick={() => onShare(guest.token)} aria-label={`Share journey link for ${guest.name}`}>
        <QrCode size={16} className="mr-2 text-text-secondary opacity-60 group-hover:text-text-primary transition-colors" aria-hidden="true" /> Share Journey Link
      </Button>
    </Card>
  );
}
