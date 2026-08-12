import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { calculatePropertyStatus } from "../lib/propertyStatusEngine";
import { detectSensitiveContent } from "../lib/sensitiveContent";
import { PublishConfirmationModal } from "../components/PublishConfirmationModal";
import { SensitiveContentModal } from "../components/ui/SensitiveContentModal";
import { 
  CheckCircle2, Send, Zap, Eye,
  Hotel, CheckSquare, Trash2, Calendar, 
  MapPin, MessageSquare, PhoneCall, Activity, ArrowRight, Sparkles, QrCode
} from "lucide-react";
import confetti from "canvas-confetti";
import { dispatchSync } from "../lib/sync";
import { safeFormatTime } from "../lib/dateUtils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function ManagerHome() {
  const { property, status, checklist: serverChecklist, loading, refreshProperty } = useManagerProperty();
  console.log("ManagerHome render -> loading:", loading, "property:", property ? property.id : null);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [sensitiveSamples, setSensitiveSamples] = useState<string[]>([]);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const navigate = useNavigate();
  
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [draftData, setDraftData] = useState<any>(null);
  
  // Dashboard states
  const [activityData, setActivityData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (property) {
      // Load custom tasks from local storage
      const savedTasks = localStorage.getItem(`scanvista_tasks_${property.slug}`);
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          setTasks([]);
        }
      }

      const fetchData = async () => {
        try {
          // Snapshots and Drafts
          const liveRes = await fetch(`/api/manager/properties/${property.slug}/snapshots`);
          if (liveRes.ok) {
            const raw = await liveRes.json();
            setSnapshots(Array.isArray(raw) ? raw : (raw.snapshots || []));
          }
          if (property.previewToken) {
            const previewRes = await fetch(`/api/preview/${property.previewToken}`);
            if (previewRes.ok) setDraftData(await previewRes.json());
          }

          // Activity
          const actRes = await fetch(`/api/manager/properties/${property.slug}/activity`);
          if (actRes.ok) {
            setActivityData(await actRes.json());
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
    }
  }, [property]);

  // Persist tasks when changed
  useEffect(() => {
    if (property && tasks.length > 0) {
      localStorage.setItem(`scanvista_tasks_${property.slug}`, JSON.stringify(tasks));
    }
  }, [tasks, property]);

  // Execute unified property status engine
  const statusResult = status || calculatePropertyStatus({
    property,
    snapshots,
    draftData
  });
  const checklistResult = statusResult;

  const handleOpenPublish = () => {
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
    if (!property?.slug) return;
    setPublishing(true);
    dispatchSync('saving');
    try {
      const res = await fetch(`/api/manager/properties/${property.slug}/publish`, { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 422 && data.samples) {
          setShowPublishModal(false);
          setSensitiveSamples(data.samples);
          setShowSensitiveModal(true);
          throw new Error("Sensitive content detected");
        }
        throw new Error(data.error || "Publish failed");
      }

      await refreshProperty();
      dispatchSync('synced');
      setShowPublishModal(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
      toast.success("Successfully published to live guest view!");
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: any) {
      dispatchSync('idle');
      if (e.message !== "Sensitive content detected") {
        toast.error(e.message || "Failed to publish property");
      }
    } finally {
      setPublishing(false);
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskText, completed: false }]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
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

  if (!property) {
    return (
      <ManagerLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <Hotel size={40} />
          </div>
          <h2 className="text-3xl font-serif font-medium text-text-primary">Welcome to ScanVista</h2>
          <p className="text-text-secondary text-lg">Your account is ready. Let's create your first property to get started.</p>
          <Button 
            size="lg" 
            className="w-full text-lg h-14 mt-4 shadow-premium hover:shadow-premium-hover transition-all"
            onClick={async () => {
              try {
                await fetch("/api/manager/properties", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: "My Property" })
                });
                window.location.reload();
              } catch (e) {
                console.error("Initialization failed", e);
                window.location.reload();
              }
            }}
          >
            <Hotel className="mr-2" /> Initialize Dashboard
          </Button>
        </div>
      </ManagerLayout>
    );
  }

  const isReady = statusResult.completionPercentage === 100;

  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* Welcome Header */}
        <div className="mb-10 bg-surface border border-divider rounded-xl p-8 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">
              {property.owner?.name ? `Good Morning, ${property.owner.name.split(' ')[0]}` : 'Welcome Back'}
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm font-medium px-3 py-1 bg-background border border-divider rounded-md flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> {property.name}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-md flex items-center gap-2 border ${statusResult.badgeColor}`}>
                {statusResult.hasUnpublishedChanges ? (
                  <span className={`w-2 h-2 rounded-full ${statusResult.badgeBg} animate-pulse`} />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-600" />
                )} 
                {statusResult.badgeLabel}
              </span>
            </div>
          </div>
          <div className="relative z-10">
             <button 
                onClick={handleOpenPublish}
                disabled={!statusResult.hasUnpublishedChanges || publishing}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium shadow-sm transition whitespace-nowrap ${
                  statusResult.hasUnpublishedChanges 
                    ? "bg-text-primary hover:bg-text-primary/90 text-white shadow-premium cursor-pointer" 
                    : "bg-surface-hover text-text-muted border border-divider cursor-not-allowed"
                }`}
              >
                {publishing ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send size={18} />} 
                {publishing ? "Publishing..." : statusResult.hasUnpublishedChanges ? "Ready to Publish" : "Up to Date"}
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Today's Focus Checklist */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" /> Today's Focus
                </h2>
                <span className="text-xs font-medium text-text-muted">
                  {statusResult.todayFocus.filter(t => t.completed).length} of {statusResult.todayFocus.length} completed
                </span>
              </div>
              <div className="space-y-3">
                {statusResult.todayFocus.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(item.href)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                      item.completed 
                        ? 'bg-surface-hover/20 border-divider/60 opacity-70' 
                        : 'bg-background border-divider hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.completed ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <div className="w-4.5 h-4.5 rounded-full border-2 border-divider" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${item.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {item.completed ? item.details : item.why}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-text-muted hover:text-primary shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <Link to="/manager/checklist" className="px-4 py-2 bg-emerald-50 border border-emerald-300 hover:border-emerald-500 rounded-lg text-sm font-semibold transition-colors text-emerald-800 flex items-center gap-1.5"><CheckSquare size={14}/> Launch Checklist</Link>
                <Link to="/manager/experience" className="px-4 py-2 bg-background border border-divider hover:border-primary rounded-lg text-sm font-medium transition-colors text-text-primary">Edit Property</Link>
                <Link to="/manager/menu" className="px-4 py-2 bg-background border border-divider hover:border-primary rounded-lg text-sm font-medium transition-colors text-text-primary">Edit Menu</Link>
                <Link to="/manager/amenities" className="px-4 py-2 bg-background border border-divider hover:border-primary rounded-lg text-sm font-medium transition-colors text-text-primary">Edit Amenities</Link>
                <Link to="/manager/house-rules" className="px-4 py-2 bg-background border border-divider hover:border-primary rounded-lg text-sm font-medium transition-colors text-text-primary">Edit House Rules</Link>
                <Link to={`/preview/${property.previewToken}`} target="_blank" className="px-4 py-2 bg-background border border-divider hover:border-primary rounded-lg text-sm font-medium transition-colors text-primary flex items-center gap-1.5"><Eye size={14}/> Preview Guest Page</Link>
              </div>
            </div>

            {/* Yesterday's ScanVista Activity */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" /> Guest Activity & Scans
              </h2>
              
              {!activityData?.yesterday || activityData.yesterday.scans === 0 ? (
                <div className="bg-surface-hover/50 border border-dashed border-divider rounded-lg p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">Guests haven't scanned your QR code yet.</h4>
                    <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                      Once guests scan your QR stand at check-in or dining tables, real-time metrics for QR scans, menu views, and reception calls will appear here automatically.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/manager/publishing')}>
                    Download QR Code & Posters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="bg-background border border-divider rounded-lg p-4 text-center">
                    <p className="text-3xl font-serif text-text-primary mb-1">{activityData.yesterday.scans}</p>
                    <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">QR Scans</p>
                  </div>
                  <div className="bg-background border border-divider rounded-lg p-4 text-center">
                    <p className="text-3xl font-serif text-text-primary mb-1">{activityData.yesterday.guestPageVisits}</p>
                    <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Page Visits</p>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" /> Manager Notes & Tasks
              </h2>
              
              <div className="space-y-2 mb-4">
                {tasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${task.completed ? 'bg-surface-hover/30 border-transparent opacity-60' : 'bg-background border-divider'}`}>
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 rounded border-divider text-primary focus:ring-primary"
                      />
                      <span className={`text-sm ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>{task.title}</span>
                    </label>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-500 rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                   <p className="text-sm text-text-muted text-center py-2">Add reminders or daily tasks for your team.</p>
                )}
              </div>
              
              <form onSubmit={addTask} className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Add a team reminder..."
                  className="flex-1 px-4 py-2 text-sm bg-background border border-divider rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Button type="submit" size="sm" className="bg-text-primary hover:bg-text-primary/90 text-white">Add</Button>
              </form>
            </div>

            {/* Guest Interactions */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-500" /> Guest Interactions
              </h2>
              
              {!activityData?.interactions || activityData.interactions.length === 0 ? (
                <div className="bg-surface-hover/50 border border-dashed border-divider rounded-lg p-8 text-center">
                  <p className="text-sm font-medium text-text-secondary">No guest assistance requests or calls recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData.interactions.map((interaction: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-divider rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PhoneCall size={14} /></div>
                        <span className="text-sm font-medium text-text-primary">Guest contacted reception</span>
                      </div>
                      <span className="text-xs text-text-muted">{safeFormatTime(interaction.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Publishing Status */}
            <div className="bg-surface border border-divider rounded-xl p-8 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-6">Publishing Status</h2>
               <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                       <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border ${statusResult.badgeColor}`}>
                         {statusResult.badgeLabel}
                       </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {statusResult.badgeSubtext}
                  </p>
               </div>
            </div>

            {/* Property Health */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Property Health</h2>
               
               <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className={`text-sm font-semibold ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                     {isReady ? 'Ready for Live Guests' : 'Needs Attention'}
                   </span>
                   <span className="text-sm font-bold text-text-primary">{statusResult.completionPercentage}%</span>
                 </div>
                 <div className="w-full h-2 bg-divider rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${statusResult.completionPercentage}%` }}></div>
                 </div>
               </div>

                <div className="space-y-2.5">
                   {statusResult.items.map((req) => (
                     <div key={req.id} className="flex items-center gap-2">
                       {req.completed ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-divider" />}
                       <span className={`text-xs ${req.completed ? 'text-text-primary' : 'text-text-muted'}`}>{req.label}</span>
                     </div>
                   ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Recent Audit Activity</h2>
               
               {!activityData?.recent || activityData.recent.length === 0 ? (
                 <p className="text-sm text-text-secondary text-center py-2">No recent audit activity.</p>
               ) : (
                 <div className="space-y-4">
                    {activityData.recent.map((evt: any, i: number) => (
                      <div key={i} className="flex gap-3">
                         <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                         <div>
                            <p className="text-xs text-text-muted">{safeFormatTime(evt.timestamp)}</p>
                            <p className="text-sm text-text-primary font-medium">{evt.action} {evt.resourceType}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
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
