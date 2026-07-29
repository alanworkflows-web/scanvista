import React, { useState } from 'react';
import { Search, ShieldAlert, FileText, Download, Activity, KeySquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function SupportConsole() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    try {
      // Mock search for pilot
      setTimeout(() => {
        setResults([{
          id: 'org-123',
          name: 'Ocean Breeze Hospitality',
          slug: 'ocean-breeze-demo',
          status: 'ACTIVE',
          properties: 2,
          lastActive: new Date().toISOString()
        }]);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium text-text-primary tracking-tight mb-2">Support Console</h1>
          <p className="text-text-secondary opacity-60">Diagnose customer issues and audit tenant data safely.</p>
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSearch} className="flex gap-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by Org Name, Slug, or Property ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-divider rounded-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <Button type="submit" disabled={loading} className="px-8 bg-gray-900 hover:bg-black text-white rounded-sm">
            {loading ? "Searching..." : "Search Tenants"}
          </Button>
        </form>
      </Card>

      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-medium text-text-primary">Search Results</h2>
          {results.map(org => (
            <Card key={org.id} className="p-0 overflow-hidden border border-divider">
              <div className="p-8 bg-surface border-b border-divider flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">{org.name}</h3>
                  <p className="text-sm text-text-secondary opacity-60 font-mono mt-1">Tenant ID: {org.id}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 text-text-primary rounded-full text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary/50" />
                  {org.status}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 p-8 bg-surface/50">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Support Actions</h4>
                  <Button variant="secondary" className="w-full justify-start bg-surface text-blue-700 border-blue-200 hover:bg-blue-50">
                    <KeySquare size={16} className="mr-2" /> Impersonate
                  </Button>
                  <Button variant="secondary" className="w-full justify-start bg-surface">
                    <FileText size={16} className="mr-2 text-text-muted" /> View Audit Logs
                  </Button>
                </div>
                
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-xs font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Diagnostics</h4>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="bg-surface p-3 rounded-sm border border-divider shadow-premium">
                      <div className="text-sm text-text-secondary opacity-60 mb-1">Properties</div>
                      <div className="text-xl font-medium">{org.properties}</div>
                    </div>
                    <div className="bg-surface p-3 rounded-sm border border-divider shadow-premium">
                      <div className="text-sm text-text-secondary opacity-60 mb-1">Last Active</div>
                      <div className="text-xl font-medium text-text-primary truncate" title={org.lastActive}>Today</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Compliance</h4>
                  <Button variant="secondary" className="w-full justify-start bg-surface text-text-secondary opacity-80">
                    <Download size={16} className="mr-2 text-text-muted" /> Export Data
                  </Button>
                  <Button variant="secondary" className="w-full justify-start bg-surface text-red-600 hover:bg-red-50 border-red-100">
                    <ShieldAlert size={16} className="mr-2 text-red-400" /> Block Access
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
