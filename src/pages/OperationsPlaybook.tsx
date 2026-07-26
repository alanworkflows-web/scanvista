import React, { useState, useEffect } from "react";
import { 
  BookOpen, HelpCircle, Sparkles, AlertTriangle, BookMarked, 
  BrainCircuit, HeartHandshake, FileText, Lock, Eye, Plus, Trash2, 
  ShieldCheck, UserCheck, CheckCircle2, X
} from "lucide-react";
import { ManagerLayout } from "../components/ManagerLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useManagerProperty } from "../hooks/useManagerProperty";

export interface PlaybookEntry {
  id: string;
  category: "onboarding" | "procedures" | "traditions" | "practices";
  title: string;
  rule: string;
  reason: string;
  isPublic: boolean; // false = Internal SOP Only, true = Published to Guest App
  author?: string;
  updatedAt: string;
}

const DEFAULT_PLAYBOOK: PlaybookEntry[] = [
  {
    id: "sop-1",
    category: "onboarding",
    title: "Neighborhood Hospitality Philosophy",
    rule: "Never let a guest ask for water twice. Anticipate refills when glass is 1/3 full.",
    reason: "Our property is the 'living room' of the neighborhood. Knowing preferences before seating builds 5-star loyalty.",
    isPublic: false,
    author: "General Manager",
    updatedAt: "2026-07-20"
  },
  {
    id: "sop-2",
    category: "procedures",
    title: "Monsoon & Rain Protocol",
    rule: "Move all terrace cushions to dry storage within 60 seconds of raindrop alert.",
    reason: "Prevents sea salt moisture from ruining luxury upholstery ($400 replacement cost per cushion).",
    isPublic: false,
    author: "Operations Lead",
    updatedAt: "2026-07-18"
  },
  {
    id: "sop-3",
    category: "traditions",
    title: "Anniversary & VIP Welcome",
    rule: "Complimentary local chef dessert with a handwritten welcome note from the Manager.",
    reason: "Personal touch drives 85% of 5-star review mentions on luxury travel portals.",
    isPublic: true,
    author: "Guest Experience Mgr",
    updatedAt: "2026-07-15"
  },
  {
    id: "sop-4",
    category: "practices",
    title: "Friday Seafood & Wine Pairing",
    rule: "Offer sommelier recommendations with every seafood special.",
    reason: "Consistently increases average table order value by +14% while enhancing dining score.",
    isPublic: true,
    author: "F&B Director",
    updatedAt: "2026-07-22"
  }
];

export function OperationsPlaybook() {
  const { property } = useManagerProperty();
  const storageKey = property?.id ? `scanvista_playbook_${property.id}` : "scanvista_playbook_default";

  const [entries, setEntries] = useState<PlaybookEntry[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : DEFAULT_PLAYBOOK;
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<{
    category: "onboarding" | "procedures" | "traditions" | "practices";
    title: string;
    rule: string;
    reason: string;
    isPublic: boolean;
  }>({
    category: "procedures",
    title: "",
    rule: "",
    reason: "",
    isPublic: false,
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const handleAdd = () => {
    if (!formData.title.trim() || !formData.rule.trim()) {
      toast.error("Please fill in both Title and Rule/Standard.");
      return;
    }
    const newEntry: PlaybookEntry = {
      id: `sop-${Date.now()}`,
      ...formData,
      author: "Manager",
      updatedAt: new Date().toISOString().split("T")[0]
    };
    setEntries([newEntry, ...entries]);
    setIsAddOpen(false);
    setFormData({ category: "procedures", title: "", rule: "", reason: "", isPublic: false });
    toast.success(formData.isPublic ? "Published SOP entry to Guest App" : "Saved Internal SOP entry");
  };

  const handleToggleVisibility = (id: string) => {
    setEntries(entries.map(e => {
      if (e.id === id) {
        const nextState = !e.isPublic;
        toast.info(nextState ? "Entry is now VISIBLE to guests" : "Entry is now LOCKED to Internal SOP only");
        return { ...e, isPublic: nextState };
      }
      return e;
    }));
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this SOP entry from Playbook?")) return;
    setEntries(entries.filter(e => e.id !== id));
    toast.success("Entry removed");
  };

  const filteredEntries = entries.filter(e => activeCategory === "all" || e.category === activeCategory);

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-medium text-[#1A1A1A] mb-1 flex items-center gap-3">
            <BookOpen className="text-[#D4AF37]" size={28} /> Operations Playbook
          </h1>
          <p className="text-text-secondary opacity-70 text-sm">
            Standard operating procedures, culture guidelines, and operational wisdom for your property.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] gap-2">
          <Plus size={16} /> New SOP Entry
        </Button>
      </div>

      {/* Purpose & Access Rules Guidance Banner */}
      <div className="bg-surface border border-[#EAE8E1] rounded-xl p-6 mb-8 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg shrink-0">
            <BookMarked size={20} />
          </div>
          <div>
            <h4 className="font-medium text-xs text-[#1A1A1A] uppercase tracking-wider mb-1">What is it?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Central SOP knowledge base to standardize service quality across every shift.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-medium text-xs text-[#1A1A1A] uppercase tracking-wider mb-1">Why use it?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Eliminate operational friction, prevent past mistakes, and accelerate new staff training.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg shrink-0">
            <UserCheck size={20} />
          </div>
          <div>
            <h4 className="font-medium text-xs text-[#1A1A1A] uppercase tracking-wider mb-1">Who edits it?</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Hotel Management, Shift Leads, and Department Heads.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-medium text-xs text-[#1A1A1A] uppercase tracking-wider mb-1">Visibility Rules</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              By default, entries are <span className="font-semibold text-gray-900">🔒 Internal SOP</span> (staff only). Toggle to <span className="font-semibold text-[#D4AF37]">👁️ Public</span> to show in Guest App.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[#EAE8E1] pb-px">
        <TabButton id="all" label="All Entries" count={entries.length} active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        <TabButton id="onboarding" icon={<HelpCircle size={15} />} label="Onboarding" count={entries.filter(e => e.category === "onboarding").length} active={activeCategory === "onboarding"} onClick={() => setActiveCategory("onboarding")} />
        <TabButton id="procedures" icon={<FileText size={15} />} label="Procedures" count={entries.filter(e => e.category === "procedures").length} active={activeCategory === "procedures"} onClick={() => setActiveCategory("procedures")} />
        <TabButton id="traditions" icon={<HeartHandshake size={15} />} label="Traditions" count={entries.filter(e => e.category === "traditions").length} active={activeCategory === "traditions"} onClick={() => setActiveCategory("traditions")} />
        <TabButton id="practices" icon={<BrainCircuit size={15} />} label="Measured Practices" count={entries.filter(e => e.category === "practices").length} active={activeCategory === "practices"} onClick={() => setActiveCategory("practices")} />
      </div>

      {/* List of SOP Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-surface border border-[#EAE8E1] rounded-xl p-12 text-center">
            <BookOpen className="mx-auto text-text-muted mb-3" size={36} />
            <h3 className="font-medium text-[#1A1A1A] mb-1">No SOP Entries Found</h3>
            <p className="text-xs text-text-muted mb-4">Create your first operational rule or guideline for this category.</p>
            <Button onClick={() => setIsAddOpen(true)} className="bg-[#1A1A1A] text-white text-xs">Add First Entry</Button>
          </div>
        ) : (
          filteredEntries.map((item) => (
            <div 
              key={item.id}
              className="bg-surface border border-[#EAE8E1] rounded-xl p-6 shadow-sm hover:border-[#D4AF37]/50 transition-all flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-[#FCFAF7] border border-[#EAE8E1] text-[#1A1A1A] rounded-md">
                    {item.category}
                  </span>

                  {/* Visibility Pill */}
                  <button
                    onClick={() => handleToggleVisibility(item.id)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
                      item.isPublic 
                        ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100" 
                        : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                    }`}
                    title="Click to toggle visibility between Internal SOP and Guest App"
                  >
                    {item.isPublic ? <Eye size={13} className="text-[#D4AF37]" /> : <Lock size={13} />}
                    <span className="font-medium">
                      {item.isPublic ? "👁️ Published to Guest App" : "🔒 Internal SOP (Staff Only)"}
                    </span>
                  </button>
                </div>

                <h3 className="font-serif text-lg text-[#1A1A1A] font-medium">{item.title}</h3>

                <div className="space-y-2">
                  <div className="bg-[#FCFAF7] border border-[#EAE8E1] rounded-lg p-3 text-xs">
                    <span className="font-semibold text-xs text-[#1A1A1A] uppercase tracking-wider block mb-1">Standard / Rule</span>
                    <p className="text-text-primary leading-relaxed">{item.rule}</p>
                  </div>

                  {item.reason && (
                    <div className="bg-amber-50/40 border border-amber-100/60 rounded-lg p-3 text-xs">
                      <span className="font-semibold text-[10px] text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <BookMarked size={12} /> Operational Reason (Why We Do It)
                      </span>
                      <p className="text-amber-900/90 leading-relaxed font-light">{item.reason}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-text-muted pt-1">
                  <span>Author: {item.author || "Manager"}</span>
                  <span>•</span>
                  <span>Updated: {item.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 self-end md:self-start shrink-0">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add SOP Modal */}
      {isAddOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddOpen(false); }}
        >
          <div className="bg-surface border border-[#EAE8E1] rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#EAE8E1] pb-3">
              <h3 className="font-serif text-lg text-[#1A1A1A] font-medium flex items-center gap-2">
                <BookOpen size={18} className="text-[#D4AF37]" /> Create SOP Entry
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-text-primary">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2.5 bg-background border border-[#EAE8E1] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="onboarding">Onboarding / Mindset</option>
                  <option value="procedures">Contextual Procedure</option>
                  <option value="traditions">Property Tradition</option>
                  <option value="practices">Measured Practice</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-text-primary">Title / SOP Name *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Rainy Weather Terrace Protocol"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-text-primary">Standard / Rule *</label>
                <textarea
                  rows={3}
                  value={formData.rule}
                  onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
                  placeholder="Exact operational instruction staff must follow..."
                  className="w-full text-xs text-text-primary bg-background border border-[#EAE8E1] rounded-lg p-3 focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-text-primary">Operational Reason (Why We Do It)</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Historical context, cost impact, or guest review rationale..."
                  className="w-full text-xs text-text-primary bg-background border border-[#EAE8E1] rounded-lg p-3 focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#EAE8E1]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded border-divider text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <div>
                    <span className="font-medium text-[#1A1A1A]">Publish to Guest App</span>
                    <p className="text-[10px] text-text-muted">If unchecked, entry is strictly 🔒 Internal SOP (Staff Only).</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAE8E1]">
              <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-xs">Cancel</Button>
              <Button onClick={handleAdd} className="bg-[#1A1A1A] text-white text-xs">Save Entry</Button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

function TabButton({ id, icon, label, count, active, onClick }: { id: string, icon?: React.ReactNode, label: string, count: number, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
        active 
          ? "border-[#D4AF37] text-[#1A1A1A] bg-[#FCFAF7] rounded-t-lg" 
          : "border-transparent text-text-secondary opacity-70 hover:text-text-primary hover:bg-background rounded-t-lg"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-[#D4AF37]/20 text-[#1A1A1A]" : "bg-gray-100 text-gray-600"}`}>
        {count}
      </span>
    </button>
  );
}
