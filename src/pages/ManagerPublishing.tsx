import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { QrCode, Download, Copy, ExternalLink, CheckCircle2, AlertTriangle, FileDiff, RefreshCcw, Send, Sparkles } from "lucide-react";
import { calculateChanges, DiffResult } from "../lib/diffEngine";
import { calculateCompletion } from "../lib/completionEngine";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { Button } from "../components/ui/Button";

export function ManagerPublishing() {
  const { property, amenities, categories, dishes, loading, refreshProperty } = useManagerProperty();
  
  const [publishing, setPublishing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshProperty();
  }, []);

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

  // Calculate live database completion based on real resolved arrays
  const completion = calculateCompletion({ property, amenities, categories, dishes });
  const score = completion.score;
  const isReady = score === 100;
  // isPublished is now a real boolean returned by GET /api/properties/:slug
  const isPublished = !!(property.isPublished || (property.snapshots && property.snapshots.length > 0));

  const handleReviewChanges = async () => {
    try {
      const liveRes = await fetch(`/api/manager/properties/${property.slug}/snapshots`);
      if (!liveRes.ok) throw new Error("Failed to fetch snapshots");
      const liveData = await liveRes.json();
      const snapshotsList = Array.isArray(liveData) ? liveData : (liveData.snapshots || []);
      const currentPublished = snapshotsList.length > 0 ? snapshotsList[0].data : null;
      
      if (!property.previewToken) return;
      if (!property.previewToken) return;
      if (!property.previewToken) return;
      const res = await fetch(`/api/preview/${property.previewToken}`);
      const draftData = await res.json();

      const diff = calculateChanges(draftData, currentPublished);
      setDiffResult(diff);
      setShowDiff(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to calculate changes.");
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error || data?.detail || "Publish failed";
        console.error("[Publish] API error:", data);
        toast.error(errMsg);
        return;
      }

      console.log("[Publish] Success:", data);

      // Refresh property so isPublished, snapshotCount, lastPublishedAt update
      await refreshProperty();
      setShowDiff(false);

      // Fire confetti celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#1A1A1A', '#059669']
      });

      toast.success(`✅ Property published live! QR code is now active.`);
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
            <h1 className="text-3xl font-serif font-medium text-[#1A1A1A]">Publishing & QR Portal</h1>
            <span className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md border ${
              isPublished 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isPublished ? '✓ Live & Published' : '⚠️ Unpublished Draft'}
            </span>
          </div>
          <p className="text-text-secondary text-sm font-light">
            Validate property readiness, publish updates to live, and generate guest mobile QR codes for <span className="font-medium text-[#1A1A1A]">{property.name}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Readiness Card */}
          <div className="bg-surface rounded-xl border border-[#EAE8E1] shadow-sm p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAE8E1]">
              <h2 className="text-lg font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
                <CheckCircle2 className={isReady ? "text-[#D4AF37]" : "text-amber-500"} size={20} />
                Publish Readiness Engine
              </h2>
              <span className="text-xl font-serif font-medium text-[#1A1A1A]">{score}%</span>
            </div>
            
            <div className="flex-1 space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="w-full bg-[#FCFAF7] border border-[#EAE8E1] rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isReady ? "bg-[#D4AF37]" : "bg-amber-500"}`} 
                    style={{ width: `${score}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-text-muted font-mono">
                  <span>Calculated from live database</span>
                  <span>{isReady ? "100% Ready for QR Launch" : `${100 - score}% incomplete`}</span>
                </div>
              </div>

              {/* Individual Checks Diagnostics List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold block mb-2">
                  System Diagnostics & Data Audit
                </span>
                
                {completion.checks.map((check, i) => {
                  let link = "/manager/property";
                  const lower = check.name.toLowerCase();
                  if (lower.includes("hero") || lower.includes("image")) link = "/manager/experience";
                  if (lower.includes("menu") || lower.includes("dish") || lower.includes("category")) link = "/manager/menu";

                  return (
                    <div 
                      key={i} 
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-all ${
                        check.passed 
                          ? "bg-[#FCFAF7] border-[#EAE8E1] text-[#1A1A1A]" 
                          : "bg-amber-50/60 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {check.passed ? (
                          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                        ) : (
                          <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                        )}
                        <div className="truncate">
                          <span className="font-medium block truncate">{check.name}</span>
                          <span className="text-[10px] opacity-75 font-mono block truncate">
                            {check.passed ? check.actual : check.reason}
                          </span>
                        </div>
                      </div>

                      {!check.passed && (
                        <Link 
                          to={link} 
                          className="shrink-0 text-[10px] uppercase font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded transition"
                        >
                          Fix &rarr;
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-6 mt-6 border-t border-[#EAE8E1] flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handlePublish} 
                disabled={!isReady || publishing} 
                className={`flex-1 ${
                  isReady 
                    ? "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] shadow-md" 
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                {publishing ? "Publishing..." : "Publish Workspace"}
              </Button>

              <Button 
                onClick={handleReviewChanges} 
                disabled={!isReady || publishing} 
                variant="secondary"
                className="flex-1 border-[#EAE8E1]"
              >
                Review Diff
              </Button>
            </div>
          </div>

          {/* Access & QR Distribution Card */}
          <div className="bg-surface rounded-xl border border-[#EAE8E1] shadow-sm p-8 flex flex-col h-full relative overflow-hidden">
            {/* Overlay if not published */}
            {!isPublished ? (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-serif text-[#1A1A1A] mb-2">Publish Required to Generate QR</h3>
                <p className="text-xs text-text-secondary max-w-xs mb-4 leading-relaxed">
                  Complete the 100% readiness checks on the left and click <strong>"Publish Workspace"</strong> to generate live QR codes for hotel guests.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAE8E1]">
              <h2 className="text-lg font-serif font-medium text-[#1A1A1A] flex items-center gap-2">
                <QrCode className="text-[#D4AF37]" size={20} />
                Guest Access & Vector QR Code
              </h2>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                Active QR
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="bg-surface p-6 rounded-xl shadow-md border border-[#EAE8E1] mb-6 hover:shadow-lg transition-all">
                <QRCodeSVG 
                  id="guest-qr-code" 
                  value={`${window.location.origin}/g/${property.slug}`}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#1A1A1A"
                />
              </div>
              <p className="text-xs font-mono font-medium text-text-primary text-center bg-[#FCFAF7] border border-[#EAE8E1] px-4 py-2 rounded-lg truncate max-w-full">
                {window.location.origin}/g/{property.slug}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#EAE8E1]">
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-[#1A1A1A] bg-[#FCFAF7] border border-[#EAE8E1] hover:border-[#D4AF37] rounded-lg transition"
              >
                <ExternalLink size={14} /> Open Live Guest View
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Review Diff Modal */}
      {showDiff && diffResult && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface rounded-xl border border-[#EAE8E1] shadow-2xl max-w-xl w-full p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#EAE8E1] pb-4">
              <h3 className="text-xl font-serif text-[#1A1A1A] flex items-center gap-2">
                <FileDiff size={20} className="text-[#D4AF37]" /> Review Pending Changes
              </h3>
              <button onClick={() => setShowDiff(false)} className="text-text-muted hover:text-[#1A1A1A] text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              <p className="text-xs text-text-secondary">
                The following modifications will be published live to guest smartphones:
              </p>
              
              <div className="bg-[#FCFAF7] border border-[#EAE8E1] rounded-lg p-4 font-mono text-xs space-y-2">
                {diffResult.messages && diffResult.messages.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {diffResult.messages.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <div>No major changes detected.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#EAE8E1]">
              <Button variant="secondary" onClick={() => setShowDiff(false)} className="text-xs">
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={publishing} className="bg-[#1A1A1A] text-white text-xs">
                {publishing ? "Publishing..." : "Confirm & Publish Live"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}
