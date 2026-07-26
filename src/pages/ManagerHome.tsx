import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { calculateCompletion } from "../lib/completionEngine";
import { getPublishingStatus } from "../lib/publishingState";
import { safeFormatTime } from "../lib/dateUtils";
import { 
  CheckCircle2, Send, Globe,
  Clock, Zap, Target, Settings, Plus, Eye
} from "lucide-react";
import confetti from "canvas-confetti";
import { dispatchSync } from "../lib/sync";

export function ManagerHome() {
  const { property, loading, refreshProperty } = useManagerProperty();
  const [publishing, setPublishing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleAddMenuClick = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate("/manager/menu");
    }, 50);
  };
  
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [draftData, setDraftData] = useState<any>(null);

  useEffect(() => {
    if (property) {
      const fetchLiveStatus = async () => {
        try {
          const liveRes = await fetch(`/api/manager/properties/${property.slug}/snapshots`);
          if (liveRes.ok) {
            const raw = await liveRes.json();
            const snapshotsList = Array.isArray(raw) ? raw : (raw.snapshots || []);
            setSnapshots(snapshotsList);
          }

          if (property.previewToken) {
            const previewRes = await fetch(`/api/preview/${property.previewToken}`);
            if (previewRes.ok) {
              setDraftData(await previewRes.json());
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchLiveStatus();
    }
  }, [property]);

  const handlePublish = async () => {
    if (!property?.slug) return;
    setPublishing(true);
    dispatchSync('saving');
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/publish`, { method: "POST" });
      if (!res.ok) throw new Error("Publish failed");
      await refreshProperty();
      dispatchSync('synced');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
      toast.success("Successfully published to live!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      dispatchSync('idle');
      toast.error("Failed to publish property");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </ManagerLayout>
    );
  }

  if (!property) return null;

  const completion = calculateCompletion(property);
  const status = getPublishingStatus(property, snapshots, draftData);
  const lastSaved = safeFormatTime(property.updatedAt);

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* Command Center Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight mb-2">Command Center</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 size={14} className="text-emerald-600" /> Systems Operational
            </span>
            <span className="text-text-muted">&bull;</span>
            <span className="text-text-secondary opacity-60">Last saved {lastSaved}</span>
          </div>
        </div>

        {/* Top Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="bg-surface rounded-sm p-8 border border-divider shadow-premium flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-secondary opacity-60 mb-4">
              <Globe size={16} /> <span className="text-xs font-semibold uppercase tracking-widest">Live Status</span>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-text-primary mb-1">{status.label}</p>
              <p className="text-sm text-text-secondary opacity-60">{status.subtext}</p>
            </div>
          </div>
          
          <div className="bg-surface rounded-sm p-8 border border-divider shadow-premium flex flex-col justify-between">
            <div className="flex items-center gap-2 text-text-secondary opacity-60 mb-4">
              <Target size={16} /> <span className="text-xs font-semibold uppercase tracking-widest">Launch Readiness</span>
            </div>
            <div>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-serif font-bold text-text-primary">{completion.score}%</p>
              </div>
              <div className="w-full h-1.5 bg-surface-hover rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${completion.score}%` }} />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-text-primary border border-divider rounded-sm p-8 shadow-premium text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-medium mb-1">
                {status.hasChanges ? 'Changes Pending Publication' : 'Up to Date'}
              </h3>
              <p className="text-sm text-text-muted/80 opacity-90">
                {status.hasChanges 
                  ? `You have ${status.diffResult?.messages.length || 1} pending modification(s).` 
                  : 'All your changes are live for guests.'}
              </p>
            </div>
            <button 
              onClick={handlePublish}
              disabled={!status.hasChanges || completion.score < 100 || publishing}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-premium transition whitespace-nowrap ${
                status.hasChanges && completion.score === 100 
                  ? "bg-primary hover:bg-primary-hover text-white shadow-premium cursor-pointer" 
                  : "bg-surface/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {publishing ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send size={16} />} 
              {publishing ? "Publishing..." : "Publish to Live"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Quick Actions & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-divider rounded-sm p-8 shadow-premium">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleAddMenuClick}
                  disabled={isNavigating}
                  className="flex items-center justify-between p-8 rounded-sm border border-divider hover:border-divider hover:bg-primary/5/50 transition-colors group text-left disabled:opacity-50 cursor-pointer"
                >
                  <div>
                    <span className="block font-medium text-text-primary mb-1">Add Menu Item</span>
                    <span className="text-xs text-text-secondary opacity-60">Update your restaurant offerings</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface shadow-premium flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                    {isNavigating ? <div className="w-4 h-4 rounded-full border-2 border-divider border-t-emerald-600 animate-spin" /> : <Plus size={16} />}
                  </div>
                </button>
                
                <Link to="/manager/experience" className="flex items-center justify-between p-8 rounded-sm border border-divider hover:border-indigo-200 hover:bg-primary-light/20/50 transition-colors group">
                  <div>
                    <span className="block font-medium text-text-primary mb-1">Edit Brand</span>
                    <span className="text-xs text-text-secondary opacity-60">Change colors and logos</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface shadow-premium flex items-center justify-center text-text-muted group-hover:text-primary-hover transition-colors">
                    <Settings size={16} />
                  </div>
                </Link>
              </div>
            </div>

            {completion.score < 100 && (
              <div className="bg-surface border border-divider rounded-sm p-8 shadow-premium">
                <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" /> Setup Progress
                </h2>
                <div className="space-y-3">
                  {completion.missing.map((reqName: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-red-50/50 border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-red-400" />
                        <span className="font-medium text-text-primary">{reqName}</span>
                      </div>
                      <Link to="/manager/experience" className="text-xs font-medium text-red-600 hover:text-red-700 bg-surface px-3 py-1.5 rounded-full shadow-premium">
                        Fix Now
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Guest Preview Link & Activity */}
          <div className="space-y-6">
            <div className="bg-surface border border-[#EAE8E1] rounded-xl p-6 shadow-sm relative overflow-hidden">
              <h2 className="text-lg font-serif font-medium text-[#1A1A1A] mb-1">Guest View</h2>
              <p className="text-xs text-text-secondary mb-6">See exactly what your guests see on their mobile device.</p>
              
              <Link 
                to={`/preview/${property.previewToken}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-all text-xs uppercase tracking-wider rounded-lg font-medium shadow-sm"
              >
                <Eye size={16} /> Open Guest Preview
              </Link>
            </div>
            
            <div className="bg-surface border border-divider rounded-sm p-8 shadow-premium">
               <h2 className="text-sm font-medium text-text-primary uppercase tracking-wider mb-4">Recent Activity</h2>
               <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0 mt-0.5 border border-divider">
                     <Clock size={14} className="text-text-muted" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-text-primary">System logged state</p>
                     <p className="text-xs text-text-secondary opacity-60 mt-0.5">{lastSaved}</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </ManagerLayout>
  );
}