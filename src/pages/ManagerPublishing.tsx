import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { QrCode, Download, Copy, ExternalLink, CheckCircle2, AlertTriangle, FileDiff, Send, Sparkles } from "lucide-react";
import { calculatePropertyStatus } from "../lib/propertyStatusEngine";
import { detectSensitiveContent } from "../lib/sensitiveContent";
import { PublishConfirmationModal } from "../components/PublishConfirmationModal";
import { SensitiveContentModal } from "../components/ui/SensitiveContentModal";
import { safeFormatTime } from "../lib/dateUtils";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "../components/ui/Button";

export function ManagerPublishing() {
  const { property, status, checklist: serverChecklist, amenities, categories, dishes, loading, refreshProperty } = useManagerProperty();
  
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [sensitiveSamples, setSensitiveSamples] = useState<string[]>([]);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [draftData, setDraftData] = useState<any>(null);

  useEffect(() => {
    refreshProperty();
  }, []);

  useEffect(() => {
    if (property) {
      const fetchData = async () => {
        try {
          const liveRes = await fetch(`/api/manager/properties/${property.slug}/snapshots`);
          if (liveRes.ok) {
            const raw = await liveRes.json();
            setSnapshots(Array.isArray(raw) ? raw : (raw.snapshots || []));
          }
          if (property.previewToken) {
            const previewRes = await fetch(`/api/preview/${property.previewToken}`);
            if (previewRes.ok) setDraftData(await previewRes.json());
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
    }
  }, [property]);

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-divider border-t-emerald-600 animate-spin" />
        </div>
      </ManagerLayout>
    );
  }

  if (!property) return null;

  // Single unified status from backend / engine
  const statusResult = status || calculatePropertyStatus({
    property,
    snapshots,
    draftData
  });

  const checklistResult = statusResult;

  const isReady = statusResult.completionPercentage === 100;
  const isPublished = statusResult.publishState === 'PUBLISHED' || (snapshots && snapshots.length > 0);

  const handleReviewAndPublish = () => {
    if (!property?.slug) return;
    
    // Check for sensitive content
    const sensitive = detectSensitiveContent({
      property,
      draftData
    });

    if (sensitive.detected) {
      setSensitiveSamples(sensitive.samples);
      setShowSensitiveModal(true);
      return;
    }

    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.samples) {
          setShowPublishModal(false);
          setSensitiveSamples(data.samples);
          setShowSensitiveModal(true);
          return;
        }
        const errMsg = data?.error || data?.detail || "Publish failed";
        console.error("[Publish] API error:", data);
        toast.error(errMsg);
        return;
      }

      console.log("[Publish] Success:", data);

      await refreshProperty();
      setShowPublishModal(false);

      // Fire confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#1A1A1A', '#059669']
      });

      toast.success(`✅ Property published live! Guest view & QR code are updated.`);
    } catch (e: any) {
      console.error("[Publish] Network error:", e);
      toast.error("Network error while publishing. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/g/${property.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Guest link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("guest-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${property.slug}-qr.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    toast.success("QR Code downloaded");
  };

  return (
    <ManagerLayout>
      <div className="max-w-5xl mx-auto pb-20">
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-serif font-medium text-text-primary">Publishing & QR Portal</h1>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md border ${statusResult.badgeColor}`}>
                {statusResult.badgeLabel}
              </span>
              {isPublished && snapshots.length > 0 && (
                <span className="text-xs text-text-muted font-medium bg-surface border border-divider px-2.5 py-1 rounded-md shadow-sm">
                  Last Published: {safeFormatTime(snapshots[0].publishedAt || snapshots[0].createdAt)}
                </span>
              )}
            </div>
          </div>
          <p className="text-text-secondary text-sm font-light">
            Validate property readiness, review categorized changes, and publish updates live for <span className="font-medium text-text-primary">{property.name}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Readiness Card */}
          <div className="bg-surface rounded-xl border border-divider shadow-sm p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
              <h2 className="text-lg font-serif font-medium text-text-primary flex items-center gap-2">
                <CheckCircle2 className={isReady ? "text-emerald-600" : "text-amber-500"} size={20} />
                Publish Readiness Engine
              </h2>
              <span className="text-xl font-serif font-medium text-text-primary">{statusResult.completionPercentage}%</span>
            </div>
            
            <div className="flex-1 space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="w-full bg-background border border-divider rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isReady ? "bg-emerald-500" : "bg-amber-500"}`} 
                    style={{ width: `${statusResult.completionPercentage}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-text-muted font-mono">
                  <span>Calculated from live database</span>
                  <span>{isReady ? "100% Ready for QR Launch" : `${100 - statusResult.completionPercentage}% incomplete`}</span>
                </div>
              </div>

              {/* Individual Checks Diagnostics List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block mb-2">
                  System Diagnostics & Data Audit
                </span>
                
                {statusResult.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-all ${
                      item.completed 
                        ? "bg-background border-divider text-text-primary" 
                        : "bg-amber-50/60 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.completed ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                      ) : (
                        <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                      )}
                      <div className="truncate">
                        <span className="font-medium block truncate">{item.label}</span>
                        <span className="text-[10px] opacity-75 font-mono block truncate">
                          {item.completed ? item.details : item.why}
                        </span>
                      </div>
                    </div>

                    {!item.completed && (
                      <Link 
                        to={item.href} 
                        className="shrink-0 text-[10px] uppercase font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition"
                      >
                        Fix &rarr;
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-6 mt-6 border-t border-divider flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleReviewAndPublish} 
                disabled={publishing} 
                className={`flex-1 ${
                  statusResult.hasUnpublishedChanges
                    ? "bg-text-primary text-white hover:bg-text-primary/90 shadow-md cursor-pointer" 
                    : "bg-surface-hover text-text-muted border border-divider cursor-not-allowed"
                }`}
              >
                {publishing ? "Publishing..." : statusResult.hasUnpublishedChanges ? "Publish Live" : "Up to Date"}
              </Button>
              <Link
                to="/manager/checklist"
                className="px-4 py-2 text-xs font-medium text-text-primary bg-surface hover:bg-surface-hover border border-divider rounded-md flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Launch Checklist</span>
                <span className="text-text-muted">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Access & QR Distribution Card */}
          <div className="bg-surface rounded-xl border border-divider shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
            {/* Overlay if not published */}
            {!isPublished ? (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-serif text-text-primary mb-2">Publish Required to Generate QR</h3>
                <p className="text-xs text-text-secondary max-w-xs mb-4 leading-relaxed">
                  Complete the readiness checklist and click <strong>"Publish Live"</strong> to generate active QR codes for hotel guests.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-divider">
              <h2 className="text-lg font-serif font-medium text-text-primary flex items-center gap-2">
                <QrCode className="text-primary" size={20} />
                Guest Access & Vector QR Code
              </h2>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                Active QR
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="bg-surface p-6 rounded-xl shadow-md border border-divider mb-6 hover:shadow-lg transition-all">
                <QRCodeSVG 
                  id="guest-qr-code" 
                  value={`${window.location.origin}/g/${property.slug}`}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#1A1A1A"
                />
              </div>
              <p className="text-xs font-mono font-medium text-text-primary text-center bg-background border border-divider px-4 py-2 rounded-lg truncate max-w-full">
                {window.location.origin}/g/{property.slug}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-divider">
              <Button onClick={copyLink} variant="secondary" className="w-full text-xs">
                {copied ? <CheckCircle2 size={15} className="mr-1.5 text-emerald-600" /> : <Copy size={15} className="mr-1.5" />}
                {copied ? "Copied" : "Copy Guest Link"}
              </Button>
              <Button onClick={downloadQR} variant="secondary" className="w-full text-xs">
                <Download size={15} className="mr-1.5" /> Download QR
              </Button>
            </div>
            
            <div className="mt-3">
              <a 
                href={`/g/${property.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-text-primary bg-background border border-divider hover:border-primary rounded-lg transition"
              >
                <ExternalLink size={14} /> Open Live Guest View
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Confirmation Modal with Pre-Publish Validation Gate */}
      <PublishConfirmationModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handleConfirmPublish}
        loading={publishing}
        changeCounts={statusResult.changeCounts}
        checklist={checklistResult}
      />

      {/* Sensitive Content Blocker Modal */}
      <SensitiveContentModal
        isOpen={showSensitiveModal}
        onClose={() => setShowSensitiveModal(false)}
        samples={sensitiveSamples}
        isPublishBlock={true}
      />
    </ManagerLayout>
  );
}
