import React from "react";
import { Copy, MessageSquare, Phone } from "lucide-react";
import { Button } from "../ui/Button";
import { QRCodeSVG } from "qrcode.react";

interface ShareDialogProps {
  token: string;
  onClose: () => void;
}

export function ShareDialog({ token, onClose }: ShareDialogProps) {
  const guestUrl = `${window.location.origin}/g/${token}`;

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Share guest journey link"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-t-2xl sm:rounded-sm p-8 w-full max-w-sm shadow-premium flex flex-col items-center max-h-[85dvh] overflow-y-auto">
        <h3 className="text-xl font-serif text-text-primary text-xl mb-2 text-text-primary">Share Guest Link</h3>
        <p className="text-sm text-text-secondary opacity-60 mb-12 text-center">Scan to open or share directly.</p>

        <div className="p-8 bg-surface rounded-sm shadow-premium border border-divider mb-12 inline-block">
          <QRCodeSVG value={guestUrl} size={160} />
        </div>

        <div className="space-y-3 w-full">
          <Button
            className="w-full justify-start"
            variant="secondary"
            aria-label="Copy link to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(guestUrl);
              alert("Link copied!");
            }}
          >
            <Copy size={18} className="mr-3 text-text-muted" aria-hidden="true" /> Copy Link
          </Button>
          <Button
            className="w-full justify-start bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            aria-label="Share via WhatsApp"
            onClick={() =>
              window.open(
                `https://wa.me/?text=Here is your personalized guest link: ${guestUrl}`,
                "_blank"
              )
            }
          >
            <MessageSquare size={18} className="mr-3 text-green-600" aria-hidden="true" /> WhatsApp
          </Button>
          <Button
            className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            aria-label="Share via SMS"
            onClick={() =>
              window.open(`sms:?body=Here is your personalized guest link: ${guestUrl}`, "_self")
            }
          >
            <Phone size={18} className="mr-3 text-blue-600" aria-hidden="true" /> SMS
          </Button>
        </div>

        <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
