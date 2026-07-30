import React, { useState, useEffect } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { useManagerProperty } from "../hooks/useManagerProperty";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { calculateCompletion } from "../lib/completionEngine";
import { getPublishingStatus } from "../lib/publishingState";
import { 
  CheckCircle2, Send, Globe, Zap, Settings, Plus, Eye,
  Hotel, LayoutDashboard, CheckSquare, Trash2, Calendar, FileText, Image, AlignLeft,
  Utensils, MapPin, Shield, MessageSquare, PhoneCall, Link2, Activity
} from "lucide-react";
import confetti from "canvas-confetti";
import { dispatchSync } from "../lib/sync";
import { safeFormatTime } from "../lib/dateUtils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Review guest requests', completed: false },
  { id: '2', title: 'Update menu', completed: false },
  { id: '3', title: 'Verify QR page', completed: false },
  { id: '4', title: 'Publish changes', completed: false },
  { id: '5', title: 'Update amenities', completed: false }
];

export function ManagerHome() {
  const { property, loading, refreshProperty } = useManagerProperty();
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();
  
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [draftData, setDraftData] = useState<any>(null);
  
  // Dashboard states
  const [activityData, setActivityData] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (property) {
      // Load tasks from local storage
      const savedTasks = localStorage.getItem(`scanvista_tasks_${property.slug}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(DEFAULT_TASKS);
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
            <Plus className="mr-2" /> Initialize Dashboard
          </Button>
        </div>
      </ManagerLayout>
    );
  }

  const completion = calculateCompletion(property);
  const status = getPublishingStatus(property, snapshots, draftData);
  const isReady = completion.score === 100;

  // Determine sub-statuses based on completion logic (we map missing items)
  const isLogoMissing = completion.missing.includes("Logo");
  const isCoverMissing = completion.missing.includes("Cover Image");
  const isHouseRulesMissing = completion.missing.includes("House Rules");
  
  return (
    <ManagerLayout>
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* Welcome Header */}
        <div className="mb-10 bg-surface border border-divider rounded-xl p-8 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Good Morning, {property.owner?.name?.split(' ')[0] || 'Team'}</h1>
            <p className="text-text-secondary text-lg">Welcome back to ScanVista.</p>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-sm font-medium px-3 py-1 bg-background border border-divider rounded-md flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> {property.name}
              </span>
              <span className={`text-sm font-medium px-3 py-1 rounded-md flex items-center gap-2 ${status.hasChanges ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                {status.hasChanges ? <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> : <CheckCircle2 size={14} />} 
                {status.hasChanges ? 'Drafts Pending' : 'Published'}
              </span>
            </div>
          </div>
          <div className="relative z-10">
             <button 
                onClick={handlePublish}
                disabled={!status.hasChanges || publishing}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium shadow-sm transition whitespace-nowrap ${
                  status.hasChanges 
                    ? "bg-text-primary hover:bg-text-primary/90 text-white shadow-premium cursor-pointer" 
                    : "bg-surface-hover text-text-muted border border-divider cursor-not-allowed"
                }`}
              >
                {publishing ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Send size={18} />} 
                {publishing ? "Publishing..." : status.hasChanges ? "Publish Live" : "Up to Date"}
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
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
                <Calendar size={18} className="text-indigo-500" /> Yesterday's ScanVista Activity
              </h2>
              
              {!activityData?.yesterday || activityData.yesterday.scans === 0 ? (
                <div className="bg-surface-hover/50 border border-dashed border-divider rounded-lg p-8 text-center">
                  <Activity size={32} className="text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium text-text-secondary">No guest activity yet.\nOnce guests scan your QR code,\nanalytics will appear here automatically.</p>
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

            {/* Yesterday's Interaction Analytics */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-500" /> Yesterday's Interaction Analytics
              </h2>
              
              {!activityData?.yesterday || activityData.yesterday.scans === 0 ? (
                <div className="bg-surface-hover/50 border border-dashed border-divider rounded-lg p-8 text-center">
                  <Activity size={32} className="text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium text-text-secondary">No guest activity yet.\nOnce guests scan your QR code,\nanalytics will appear here automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-divider rounded-lg p-4 text-center">
                    <p className="text-3xl font-serif text-text-primary mb-1">{activityData.yesterday.menuViews}</p>
                    <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Menu Views</p>
                  </div>
                  <div className="bg-background border border-divider rounded-lg p-4 text-center">
                    <p className="text-3xl font-serif text-text-primary mb-1">{activityData.yesterday.amenityViews}</p>
                    <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Amenity Views</p>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" /> Today's Tasks
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
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-text-muted hover:text-red-500 rounded-md transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                   <p className="text-sm text-text-muted text-center py-4">All caught up! No tasks for today.</p>
                )}
              </div>
              
              <form onSubmit={addTask} className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Add a new task..."
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
                  <p className="text-sm font-medium text-text-secondary">No ScanVista interactions initiated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityData.interactions.map((interaction: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-divider rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PhoneCall size={14} /></div>
                        <span className="text-sm font-medium text-text-primary">Reception Call clicked</span>
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
                       <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${status.badgeColor}`}>
                         {status.label}
                       </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {status.subtext}
                  </p>
               </div>
            </div>

            {/* Property Health */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Property Health</h2>
               
               <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className={`text-sm font-semibold ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                     {isReady ? 'Ready for Guests' : 'Needs Attention'}
                   </span>
                   <span className="text-sm font-bold text-text-primary">{completion.score}%</span>
                 </div>
                 <div className="w-full h-2 bg-divider rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${completion.score}%` }}></div>
                 </div>
               </div>

               <div className="space-y-2.5">
                  {[
                    { label: 'Property details complete', ok: !completion.missing.includes("Property Name") },
                    { label: 'Logo uploaded', ok: !isLogoMissing },
                    { label: 'Cover image uploaded', ok: !isCoverMissing },
                    { label: 'House Rules configured', ok: !isHouseRulesMissing },
                    { label: 'Menu categories created', ok: property.categories?.length > 0 },
                    { label: 'Amenities added', ok: property.amenities?.length > 0 },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {req.ok ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-divider" />}
                      <span className={`text-xs ${req.ok ? 'text-text-primary' : 'text-text-muted'}`}>{req.label}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface border border-divider rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">Recent Activity</h2>
               
               {!activityData?.recent || activityData.recent.length === 0 ? (
                 <p className="text-sm text-text-secondary text-center py-2">No recent ScanVista activity.</p>
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
    </ManagerLayout>
  );
}
