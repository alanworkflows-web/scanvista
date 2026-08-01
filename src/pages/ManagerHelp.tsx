import React, { useState } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { MessageSquare, Bug, Sparkles, Send } from "lucide-react";
import { useManagerProperty } from "../hooks/useManagerProperty";

import { toast } from "sonner";

export function ManagerHelp() {
  const { property } = useManagerProperty();
  const [type, setType] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !property) return;
    
    setStatus('loading');
    setTimeout(() => {
      setStatus('idle');
      toast.info("Our support email system is currently being upgraded. Please contact us directly at support@scanvista.com", { duration: 6000 });
      setMessage("");
    }, 800);
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary mb-2">Help & Feedback</h1>
          <p className="text-text-secondary opacity-80">We're here to support your business's growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <Card hoverable className="p-8 cursor-pointer" onClick={() => window.open('mailto:support@scanvista.com')}>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-sm flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-2">Email Support</h3>
            <p className="text-sm text-text-secondary opacity-80">Get help from our hospitality experts within 24 hours.</p>
          </Card>
        </div>

        <Card className="p-8 md:p-8">
          <h2 className="text-2xl font-serif text-text-primary mb-12">Send Feedback to the Founders</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-10">
              <label className={`flex-1 p-8 border rounded-sm cursor-pointer transition-all ${type === 'BUG' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-divider hover:border-primary'}`} onClick={() => setType('BUG')}>
                <input type="radio" name="type" className="sr-only" />
                <Bug size={20} className={type === 'BUG' ? 'text-red-600' : 'text-text-muted'} />
                <span className="block mt-2 font-medium text-sm text-text-primary">Report a Bug</span>
              </label>
              <label className={`flex-1 p-8 border rounded-sm cursor-pointer transition-all ${type === 'FEATURE_REQUEST' ? 'border-[#D4AF37] bg-amber-50/50 ring-2 ring-[#D4AF37]/20' : 'border-divider hover:border-primary'}`} onClick={() => setType('FEATURE_REQUEST')}>
                <input type="radio" name="type" className="sr-only" />
                <Sparkles size={20} className={type === 'FEATURE_REQUEST' ? 'text-primary-hover' : 'text-text-muted'} />
                <span className="block mt-2 font-medium text-sm text-text-primary">Feature Request</span>
              </label>
              <label className={`flex-1 p-8 border rounded-sm cursor-pointer transition-all ${type === 'GENERAL' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-divider hover:border-primary'}`} onClick={() => setType('GENERAL')}>
                <input type="radio" name="type" className="sr-only" />
                <MessageSquare size={20} className={type === 'GENERAL' ? 'text-primary' : 'text-text-muted'} />
                <span className="block mt-2 font-medium text-sm text-text-primary">General</span>
              </label>
            </div>
            
            <textarea 
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what you need..."
              className="w-full p-8 bg-background border border-divider rounded-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />

            <div className="flex justify-end">
              <Button type="submit"  disabled={!message.trim()} className="px-8">
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Received!' : <><Send size={16} className="mr-2" /> Send Message</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
