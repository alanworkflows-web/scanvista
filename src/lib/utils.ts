import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function buildGuestUrl(propertySlug: string): string {
  const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  return `${appUrl.replace(/\/+$/, '')}/p/${propertySlug}`;
}
