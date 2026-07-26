// Guest Journey shared business logic
// Single source of truth — used by both manager UI and guest-facing pages

export type GuestStatus = "BOOKED" | "ARRIVING" | "CHECKED_IN" | "STAYING" | "CHECKED_OUT";

export interface Guest {
  id: string;
  token: string;
  name: string;
  phone: string;
  roomNumber: string | null;
  arrivalDate: string | null;
  departureDate: string | null;
  arrivalTime: string | null;
  notes: string | null;
  linkViewedAt: string | null;
  status: GuestStatus;
}

export const JOURNEY_STEPS = [
  { key: "BOOKED", label: "Booking Confirmed", threshold: 25 },
  { key: "ARRIVING", label: "Arrival", threshold: 50 },
  { key: "CHECKED_IN", label: "Checked In", threshold: 75 },
  { key: "STAYING", label: "Stay Active", threshold: 85 },
  { key: "CHECKED_OUT", label: "Checkout", threshold: 100 },
] as const;

export function getJourneyProgress(status: GuestStatus): number {
  const step = JOURNEY_STEPS.find(s => s.key === status);
  return step?.threshold ?? 0;
}

export function getStatusColor(status: GuestStatus): string {
  switch (status) {
    case "BOOKED": return "bg-blue-100 text-blue-800";
    case "ARRIVING": return "bg-amber-100 text-amber-800";
    case "CHECKED_IN": return "bg-champagne-light/20 text-emerald-800";
    case "STAYING": return "bg-champagne-light/20 text-emerald-800";
    case "CHECKED_OUT": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function getStatusBorderColor(status: GuestStatus): string {
  switch (status) {
    case "ARRIVING": return "border-l-amber-500";
    case "CHECKED_IN":
    case "STAYING": return "border-l-emerald-500";
    default: return "border-l-gray-900";
  }
}

export function getCountdown(date: string | null): string {
  if (!date) return "TBD";
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return d.toLocaleDateString();
}

export function parseNoteTags(notes: string | null): string[] {
  if (!notes) return [];
  return notes.split(",").map(n => n.trim()).filter(Boolean);
}

export function matchesGuestFilter(guest: Guest, filter: string): boolean {
  const now = new Date();
  const notesLower = guest.notes?.toLowerCase() || "";

  switch (filter) {
    case "All":
      return true;
    case "Today's Arrivals":
      return guest.status === "ARRIVING" ||
        (!!guest.arrivalDate && new Date(guest.arrivalDate).toDateString() === now.toDateString());
    case "Checked In":
      return guest.status === "CHECKED_IN" || guest.status === "STAYING";
    case "Pending":
      return guest.status === "BOOKED";
    case "VIP":
      return notesLower.includes("vip");
    case "Families":
      return notesLower.includes("kids") || notesLower.includes("family");
    case "Late Arrival":
      return notesLower.includes("late");
    default:
      return true;
  }
}

export function matchesGuestSearch(guest: Guest, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    guest.name.toLowerCase().includes(q) ||
    guest.phone.includes(q) ||
    (guest.roomNumber?.includes(q) ?? false)
  );
}

/** Build a UTC ISO string from a local date input + optional time input */
export function toUTCDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toISOString();
}

export function toUTCArrivalTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00Z`).toISOString();
}

export const GUEST_FILTERS = [
  "All",
  "Today's Arrivals",
  "Checked In",
  "Pending",
  "VIP",
  "Families",
  "Late Arrival",
] as const;
