import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Hotel,
  Eye,
  Rocket
} from "lucide-react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { calculateLaunchChecklist, getPropertyStatus } from "../lib/propertyStatusEngine";
import { PublishConfirmationModal } from "../components/PublishConfirmationModal";
import { SensitiveContentModal } from "../components/ui/SensitiveContentModal";
import { detectSensitiveContent } from "../lib/sensitiveContent";
import { toast } from "sonner";

export function ManagerLaunchChecklist() {
  const { property, dishes, amenities, categories, loading, refreshProperty } = useManagerProperty();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [sensitiveViolations, setSensitiveViolations] = useState<any[]>([]);
  const [isSensitiveModalOpen, setIsSensitiveModalOpen] = useState(false);

  useEffect(() => {
    if (property?.slug) {
      fetch(`/api/manager/properties/${property.slug}/snapshots`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSnapshots(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [property?.slug]);

  if (loading || !property) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-4 border-divider border-t-emerald-600 animate-spin" />
        </div>
      </ManagerLayout>
    );
  }

  const propWithEntities = { ...property, dishes, amenities, categories };
  const checklist = calculateLaunchChecklist(propWithEntities, snapshots);
  const statusResult = getPropertyStatus({ property: propWithEntities, snapshots });

  const categoriesList = ['Branding', 'Content', 'Policies', 'Operations'] as const;

  const handlePublishClick = () => {
    // Check for sensitive content
    const sensitive = detectSensitiveContent(propWithEntities);
    if (sensitive.detected) {
      setSensitiveViolations(sensitive.samples);
      setIsSensitiveModalOpen(true);
      return;
    }
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    try {
      setIsPublishing(true);
      const res = await fetch(`/api/manager/properties/${property.slug}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 422 && errJson.details) {
          setSensitiveViolations(errJson.details);
          setIsSensitiveModalOpen(true);
          setIsPublishModalOpen(false);
          return;
        }
        throw new Error(errJson.error || "Publish failed");
      }
      toast.success("Property published live to guests!");
      setIsPublishModalOpen(false);
      refreshProperty();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish property");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ManagerLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-divider">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Launch Assurance
              </span>
              <span className="text-xs text-text-muted">Single Source of Truth</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-text-primary">Launch Checklist</h1>
            <p className="text-text-secondary text-sm mt-1">
              Verify readiness across branding, dining, amenities, policies, and guest operations before going live.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {property.previewToken && (
              <a
                href={`/preview/${property.previewToken}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-surface hover:bg-surface-hover border border-divider rounded-md shadow-sm transition-colors"
              >
                <Eye className="w-4 h-4 text-text-muted" />
                Guest Preview
              </a>
            )}
            <button
              onClick={handlePublishClick}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition-colors"
            >
              <Rocket className="w-4 h-4" />
              Publish Live
            </button>
          </div>
        </div>

        {/* Readiness Overview Banner */}
        <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-500/20">
              <span className="text-2xl font-bold font-serif text-emerald-700">
                {checklist.percentage}%
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {checklist.isReadyToGoLive ? "Ready to Go Live" : "Setup in Progress"}
                </h2>
                {checklist.isReadyToGoLive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Action Required
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {checklist.completedCount} of {checklist.totalCount} operational milestones verified.
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs text-text-muted mb-1.5 font-medium">
              <span>Overall Completion</span>
              <span>{checklist.completedCount} / {checklist.totalCount}</span>
            </div>
            <div className="w-full h-3 bg-divider/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${checklist.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categorized Checklist */}
        <div className="space-y-6">
          {categoriesList.map((category) => {
            const catItems = checklist.items.filter(i => i.category === category);
            if (catItems.length === 0) return null;
            const catCompleted = catItems.filter(i => i.completed).length;

            return (
              <div key={category} className="bg-surface border border-divider rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-background/50 border-b border-divider flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">{category}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 bg-surface border border-divider rounded-full text-text-muted">
                      {catCompleted} / {catItems.length} Complete
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-divider">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${item.completed ? "text-text-primary" : "text-text-primary"}`}>
                              {item.label}
                            </span>
                            {item.completed ? (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Ready
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                Missing
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {item.details}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {item.href.startsWith("http") || item.href.startsWith("/preview/") ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline px-3 py-1.5 rounded bg-surface hover:bg-surface-hover border border-divider transition-colors"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline px-3 py-1.5 rounded bg-surface hover:bg-surface-hover border border-divider transition-colors"
                          >
                            <span>{item.completed ? "Edit" : "Configure"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation & Safety Modals */}
      <PublishConfirmationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        loading={isPublishing}
        changeCounts={statusResult.changeCounts}
        checklist={checklist}
      />

      <SensitiveContentModal
        isOpen={isSensitiveModalOpen}
        onClose={() => setIsSensitiveModalOpen(false)}
        samples={sensitiveViolations}
        isPublishBlock={true}
      />
    </ManagerLayout>
  );
}
