import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { 
  Hotel, 
  Palmtree, 
  Home,
  Sparkles,
  ArrowRight,
  Printer,
  Smartphone,
  Download,
  LayoutDashboard
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { buildGuestUrl } from "../lib/utils";

const PROPERTY_TYPES = [
  { id: "HOTEL", label: "Hotel", icon: Hotel, desc: "Rooms, front desk & guest services" },
  { id: "RESORT", label: "Resort", icon: Palmtree, desc: "Luxury full-service stay & experiences" },
  { id: "HOMESTAY", label: "Villa / Homestay", icon: Home, desc: "Private vacation rental or homestay" },
  { id: "RETREAT", label: "Retreat / Boutique", icon: Sparkles, desc: "Wellness retreats & boutique stays" }
];

export function ManagerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Setup (Name + Type), 2 = Instant Win / Launch
  const [formData, setFormData] = useState({
    name: "",
    propertyType: "HOTEL"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/manager/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name.trim(),
          propertyType: formData.propertyType || "HOTEL"
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create property");
      }
      const property = await res.json();
      setCreatedSlug(property.slug);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = (type: "png" | "svg") => {
    const svg = document.querySelector('.onboarding-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    if (type === "svg") {
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${createdSlug || "property"}-qr.svg`;
      link.click();
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const link = document.createElement("a");
          link.download = `${createdSlug || "property"}-qr.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const handlePrintQR = () => {
    const svg = document.querySelector('.onboarding-qr-svg');
    if (svg) {
      const printWin = window.open('', '', 'width=800,height=800');
      if (printWin) {
        printWin.document.write(`
          <html>
            <head>
              <title>Print QR - ${formData.name}</title>
              <style>
                body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                h1 { font-size: 28px; margin-top: 20px; color: #111827; }
                p { font-size: 16px; color: #6b7280; margin-top: 4px; }
              </style>
            </head>
            <body>
              <div>${svg.outerHTML}</div>
              <h1>${formData.name}</h1>
              <p>Scan for guest amenities, WiFi & services</p>
            </body>
          </html>
        `);
        printWin.document.close();
        printWin.print();
      }
    }
  };

  const guestUrl = createdSlug ? buildGuestUrl(createdSlug) : "";

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-50/30 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="w-full p-6 md:p-8 flex items-center justify-between border-b border-divider/60 bg-surface/80 backdrop-blur-sm z-10">
        <div className="font-serif font-semibold text-2xl text-text-primary tracking-tight">
          ScanVista
        </div>
        <div className="text-xs font-semibold text-text-muted tracking-wider uppercase">
          {step === 1 ? "Step 1 of 2: Setup" : "Step 2 of 2: Launch"}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-10 max-w-4xl mx-auto w-full">
        {step === 1 ? (
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-primary" />
                Quick Setup
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-medium text-text-primary mb-3">
                Set up your property
              </h1>
              <p className="text-text-secondary opacity-70 text-base md:text-lg">
                Enter your property name and select your stay type to create your digital guest portal.
              </p>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
                  {error}
                </div>
              )}
              {/* Property Name Input */}
              <div className="bg-background p-6 md:p-8 rounded-2xl border border-divider shadow-premium">
                <label className="block text-sm font-semibold text-text-primary uppercase tracking-wider mb-2">
                  Property Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Sunset Bay Boutique Villa"
                  className="w-full text-2xl md:text-3xl font-light text-text-primary placeholder:text-text-muted/60 border-b-2 border-divider focus:border-primary bg-transparent focus:outline-none py-2 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Property Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                  Select Property Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PROPERTY_TYPES.map(type => {
                    const Icon = type.icon;
                    const isActive = formData.propertyType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData({ ...formData, propertyType: type.id })}
                        className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 ${
                          isActive 
                            ? 'border-primary bg-primary/5 shadow-premium ring-2 ring-primary/20' 
                            : 'border-divider bg-background hover:bg-surface-hover'
                        }`}
                      >
                        <div className={`p-3 rounded-lg shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-surface-hover text-text-secondary'}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary text-base">{type.label}</h3>
                          <p className="text-xs text-text-secondary opacity-70 mt-0.5">{type.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex justify-center">
                <Button
                  size="lg"
                  type="submit"
                  disabled={!formData.name.trim() || loading}
                  className="w-full sm:w-auto px-12 py-6 text-lg rounded-full shadow-premium hover:shadow-premium-hover transition-all flex items-center justify-center gap-3"
                >
                  {loading ? "Creating Guest Portal..." : "Create My Guest Portal"}
                  <ArrowRight size={20} />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Instant Win / Celebratory Launch - Focused purely on first success */
          <div className="w-full max-w-md mx-auto text-center animate-in zoom-in-[0.97] duration-500">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2">
                🎉 Your Guest Portal is Live
              </h1>
              <p className="text-text-secondary opacity-70 text-sm">
                Your QR code is ready for guests.
              </p>
            </div>

            <Card className="p-8 flex flex-col items-center text-center bg-gradient-to-b from-white to-emerald-50/20 border-divider shadow-premium mb-6">
              <div className="bg-surface p-5 rounded-2xl shadow-premium border border-divider inline-block mb-4">
                <QRCodeSVG value={guestUrl} size={190} level="H" className="onboarding-qr-svg" />
              </div>
              <h2 className="text-xl font-serif font-medium text-text-primary mb-1">
                {formData.name}
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-emerald-800 rounded-full text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Guest Portal
              </div>

              {/* Pure Focused Actions */}
              <div className="w-full space-y-3">
                <Button 
                  size="default" 
                  onClick={() => window.open(guestUrl, '_blank')} 
                  className="w-full rounded-full flex items-center justify-center gap-2 py-3.5 shadow-premium"
                >
                  <Smartphone size={16} /> Preview Guest Portal
                </Button>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => handleDownloadQR("png")} 
                    className="rounded-full flex items-center justify-center gap-1.5 text-xs py-2.5"
                  >
                    <Download size={14} /> Download QR
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handlePrintQR} 
                    className="rounded-full flex items-center justify-center gap-1.5 text-xs py-2.5"
                  >
                    <Printer size={14} /> Print QR
                  </Button>
                </div>
              </div>
            </Card>

            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/manager/home")} 
              className="w-full py-4 rounded-full border-gray-300 text-text-primary hover:bg-background transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} />
              <span>Go to Dashboard</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
