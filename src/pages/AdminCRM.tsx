import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// removed duplicate
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { motion } from "framer-motion";
import { Hotel, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export function AdminCRM() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/crm')
      .then(res => {
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) throw new Error("Forbidden");
          throw new Error("Failed to load");
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        if (err.message === 'Forbidden') navigate('/manager/home');
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div className="p-8 text-center text-text-secondary opacity-60">Loading God Mode...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background p-8 md:p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif text-text-primary font-serif text-text-primary flex items-center gap-3">
              <ShieldCheck className="text-primary-hover" size={32} />
              God Mode CRM
            </h1>
            <p className="text-text-secondary opacity-60">Internal command center for ScanVista operators.</p>
          </div>
          <Badge variant="primary" className="bg-indigo-100 text-indigo-800">Admin Only</Badge>
        </div>

        <Card className="overflow-x-auto shadow-premium">
          <table className="w-full text-left text-sm text-text-secondary opacity-80">
            <thead className="bg-surface-hover/50 text-text-primary font-medium">
              <tr>
                <th className="p-8 border-b">Restaurant</th>
                <th className="p-8 border-b">Owner</th>
                <th className="p-8 border-b">Status</th>
                <th className="p-8 border-b text-center">Onboarded</th>
                <th className="p-8 border-b text-center">Menu</th>
                <th className="p-8 border-b text-center">QR</th>
                <th className="p-8 border-b text-center">Scan</th>
                <th className="p-8 border-b text-center">Bugs</th>
                <th className="p-8 border-b text-center">Features</th>
                <th className="p-8 border-b text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(row => (
                <tr key={row.id} className="hover:bg-background transition-colors">
                  <td className="p-8 font-medium text-text-primary">{row.restaurantName}</td>
                  <td className="p-8">{row.ownerName}</td>
                  <td className="p-8">
                    <Badge variant={row.status === 'active' ? 'primary' : 'secondary'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-8 text-center">{row.onboarded ? <CheckCircle2 className="inline text-primary" size={16}/> : <XCircle className="inline text-text-muted/80" size={16}/>}</td>
                  <td className="p-8 text-center">{row.firstMenu ? <CheckCircle2 className="inline text-primary" size={16}/> : <XCircle className="inline text-text-muted/80" size={16}/>}</td>
                  <td className="p-8 text-center">{row.qrPrinted ? <CheckCircle2 className="inline text-primary" size={16}/> : <XCircle className="inline text-text-muted/80" size={16}/>}</td>
                  <td className="p-8 text-center">{row.firstScan ? <CheckCircle2 className="inline text-primary" size={16}/> : <XCircle className="inline text-text-muted/80" size={16}/>}</td>
                  <td className="p-8 text-center">
                    {row.bug > 0 ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{row.bug}</span> : <span className="text-text-muted/80">0</span>}
                  </td>
                  <td className="p-8 text-center">
                    {row.featureRequest > 0 ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{row.featureRequest}</span> : <span className="text-text-muted/80">0</span>}
                  </td>
                  <td className="p-8 text-center">
                    {row.renewalRisk === 'HIGH' ? (
                      <Badge className="bg-red-500 text-white"><AlertTriangle size={12} className="mr-1 inline"/> High</Badge>
                    ) : row.renewalRisk === 'MEDIUM' ? (
                      <Badge className="bg-amber-500 text-white">Medium</Badge>
                    ) : (
                      <Badge className="bg-primary/50 text-white">Low</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-text-secondary opacity-60">No properties found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </motion.div>
    </div>
  );
}
