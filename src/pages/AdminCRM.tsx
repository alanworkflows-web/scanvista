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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading God Mode...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-gray-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={32} />
              God Mode CRM
            </h1>
            <p className="text-gray-500">Internal command center for ScanVista operators.</p>
          </div>
          <Badge variant="primary" className="bg-indigo-100 text-indigo-800">Admin Only</Badge>
        </div>

        <Card className="overflow-x-auto shadow-xl">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100/50 text-gray-900 font-medium">
              <tr>
                <th className="p-4 border-b">Restaurant</th>
                <th className="p-4 border-b">Owner</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b text-center">Onboarded</th>
                <th className="p-4 border-b text-center">Menu</th>
                <th className="p-4 border-b text-center">QR</th>
                <th className="p-4 border-b text-center">Scan</th>
                <th className="p-4 border-b text-center">Bugs</th>
                <th className="p-4 border-b text-center">Features</th>
                <th className="p-4 border-b text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{row.restaurantName}</td>
                  <td className="p-4">{row.ownerName}</td>
                  <td className="p-4">
                    <Badge variant={row.status === 'active' ? 'primary' : 'secondary'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">{row.onboarded ? <CheckCircle2 className="inline text-emerald-500" size={16}/> : <XCircle className="inline text-gray-300" size={16}/>}</td>
                  <td className="p-4 text-center">{row.firstMenu ? <CheckCircle2 className="inline text-emerald-500" size={16}/> : <XCircle className="inline text-gray-300" size={16}/>}</td>
                  <td className="p-4 text-center">{row.qrPrinted ? <CheckCircle2 className="inline text-emerald-500" size={16}/> : <XCircle className="inline text-gray-300" size={16}/>}</td>
                  <td className="p-4 text-center">{row.firstScan ? <CheckCircle2 className="inline text-emerald-500" size={16}/> : <XCircle className="inline text-gray-300" size={16}/>}</td>
                  <td className="p-4 text-center">
                    {row.bug > 0 ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{row.bug}</span> : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="p-4 text-center">
                    {row.featureRequest > 0 ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{row.featureRequest}</span> : <span className="text-gray-300">0</span>}
                  </td>
                  <td className="p-4 text-center">
                    {row.renewalRisk === 'HIGH' ? (
                      <Badge className="bg-red-500 text-white"><AlertTriangle size={12} className="mr-1 inline"/> High</Badge>
                    ) : row.renewalRisk === 'MEDIUM' ? (
                      <Badge className="bg-amber-500 text-white">Medium</Badge>
                    ) : (
                      <Badge className="bg-emerald-500 text-white">Low</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={10} className="p-8 text-center text-gray-500">No properties found.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </motion.div>
    </div>
  );
}
