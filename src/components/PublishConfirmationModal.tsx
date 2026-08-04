import React from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Rocket, 
  X, 
  AlertCircle, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Circle
} from "lucide-react";
import { Button } from "./ui/Button";
import { LaunchChecklistResult } from "../lib/propertyStatusEngine";

interface PublishConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isPublishing?: boolean;
  changeCounts: {
    propertyFields: number;
    dishes: number;
    amenities: number;
    rules: number;
    total: number;
  };
  checklist?: LaunchChecklistResult;
}

export function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  isPublishing = false,
  changeCounts,
  checklist
}: PublishConfirmationModalProps) {
  if (!isOpen) return null;

  const isLoading = loading || isPublishing;
  const isGateBlocked = checklist ? !checklist.isReadyToGoLive : false;
  const missingItems = checklist ? checklist.items.filter(i => !i.completed) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-divider rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-divider">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isGateBlocked ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {isGateBlocked ? <AlertTriangle size={20} /> : <Rocket size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-text-primary">
                {isGateBlocked ? "Pre-Publish Validation Gate" : "Ready to Publish Live?"}
              </h3>
              <p className="text-xs text-text-secondary">
                {isGateBlocked 
                  ? "Ensure critical guest-facing details are complete before going live" 
                  : "Push verified property snapshot directly to guest QR codes"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pre-Publish Gate Status */}
        {checklist && (
          <div className={`p-4 rounded-lg border ${
            isGateBlocked 
              ? "bg-amber-50/70 border-amber-200" 
              : "bg-emerald-50/70 border-emerald-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isGateBlocked ? "text-amber-800" : "text-emerald-800"
              }`}>
                {isGateBlocked ? "Action Required Before Publishing" : "Readiness Verified"}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                isGateBlocked ? "bg-amber-200/80 text-amber-900" : "bg-emerald-200/80 text-emerald-900"
              }`}>
                {checklist.completedCount} / {checklist.totalCount} Complete ({checklist.completionPercentage ?? checklist.percentage}%)
              </span>
            </div>

            {isGateBlocked ? (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-amber-900 font-medium">
                  The following items must be configured before this property can be published live:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {missingItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded bg-white/80 border border-amber-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Circle size={12} className="text-amber-500 shrink-0" />
                        <span className="font-semibold text-text-primary">{item.label}</span>
                        <span className="text-text-muted text-[11px] hidden sm:inline">({item.category})</span>
                      </div>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline shrink-0"
                      >
                        <span>Fix</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mt-1">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>All {checklist.totalCount} launch milestones verified. Property is ready for live guest traffic.</span>
              </div>
            )}
          </div>
        )}

        {/* Change Breakdown */}
        {!isGateBlocked && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              Changes Ready for Live Guests
            </p>

            <div className="bg-background/80 border border-divider/60 rounded-lg p-4 space-y-2.5">
              {changeCounts.propertyFields > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-primary">
                    <Check size={16} className="text-emerald-500" /> Property Info & Branding
                  </span>
                  <span className="text-xs font-mono bg-surface border border-divider px-2 py-0.5 rounded text-text-secondary">
                    {changeCounts.propertyFields} {changeCounts.propertyFields === 1 ? 'field' : 'fields'}
                  </span>
                </div>
              ) : null}

              {changeCounts.dishes > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-primary">
                    <Check size={16} className="text-emerald-500" /> Menu Items
                  </span>
                  <span className="text-xs font-mono bg-surface border border-divider px-2 py-0.5 rounded text-text-secondary">
                    {changeCounts.dishes} {changeCounts.dishes === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>
              ) : null}

              {changeCounts.amenities > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-primary">
                    <Check size={16} className="text-emerald-500" /> Amenities
                  </span>
                  <span className="text-xs font-mono bg-surface border border-divider px-2 py-0.5 rounded text-text-secondary">
                    {changeCounts.amenities} {changeCounts.amenities === 1 ? 'item' : 'items'}
                  </span>
                </div>
              ) : null}

              {changeCounts.rules > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-primary">
                    <Check size={16} className="text-emerald-500" /> House Rules & Times
                  </span>
                  <span className="text-xs font-mono bg-surface border border-divider px-2 py-0.5 rounded text-text-secondary">
                    {changeCounts.rules} {changeCounts.rules === 1 ? 'policy' : 'policies'}
                  </span>
                </div>
              ) : null}

              {changeCounts.total === 0 && (
                <p className="text-sm text-text-secondary italic">
                  Publishing current verified snapshot for live guest access.
                </p>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-text-secondary bg-primary/5 border border-primary/20 rounded p-3">
              <AlertCircle size={15} className="text-primary shrink-0 mt-0.5" />
              <span>Guests scanning your QR code or visiting your link will immediately see these updates.</span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-divider">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          {isGateBlocked ? (
            <Link
              to="/manager/checklist"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>View Launch Checklist</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Button 
              onClick={onConfirm} 
              disabled={isLoading} 
              className="w-full sm:w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {isLoading ? "Publishing Live..." : "Publish Live Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
