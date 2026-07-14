import React, { useState } from "react";
import { ManagerLayout } from "../components/ManagerLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { MessageSquare, Bug, Sparkles, Send } from "lucide-react";
import { useManagerProperty } from "../hooks/useManagerProperty";

export function ManagerHelp() {
  const { property } = useManagerProperty();
  const [type, setType] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !property) return;
    
    setStatus('loading');
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, type, message })
    }).then(res => {
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 2000);
      } else {
        setStatus('idle');
      }
    });
  };

  return (
    <ManagerLayout>
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Help & Feedback</h1>
          <p className="text-gray-600">We're here to support your restaurant's growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card hoverable className="p-6 cursor-pointer" onClick={() => window.open('mailto:support@scanvista.com')}>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-600">Get help from our hospitality experts within 24 hours.</p>
          </Card>
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send Feedback to the Founders</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${type === 'BUG' ? 'border-red-500 bg-red-50 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setType('BUG')}>
                <input type="radio" name="type" className="sr-only" />
                <Bug size={20} className={type === 'BUG' ? 'text-red-600' : 'text-gray-400'} />
                <span className="block mt-2 font-bold text-sm text-gray-900">Report a Bug</span>
              </label>
              <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${type === 'FEATURE_REQUEST' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setType('FEATURE_REQUEST')}>
                <input type="radio" name="type" className="sr-only" />
                <Sparkles size={20} className={type === 'FEATURE_REQUEST' ? 'text-indigo-600' : 'text-gray-400'} />
                <span className="block mt-2 font-bold text-sm text-gray-900">Feature Request</span>
              </label>
              <label className={`flex-1 p-4 border rounded-xl cursor-pointer transition-all ${type === 'GENERAL' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setType('GENERAL')}>
                <input type="radio" name="type" className="sr-only" />
                <MessageSquare size={20} className={type === 'GENERAL' ? 'text-emerald-600' : 'text-gray-400'} />
                <span className="block mt-2 font-bold text-sm text-gray-900">General</span>
              </label>
            </div>
            
            <textarea 
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what you need..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />

            <div className="flex justify-end">
              <Button type="submit" status={status} disabled={!message.trim()} className="px-8">
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Received!' : <><Send size={16} className="mr-2" /> Send Message</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ManagerLayout>
  );
}
