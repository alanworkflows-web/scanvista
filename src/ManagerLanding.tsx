import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Hotel, ChevronRight, X, AlertCircle } from "lucide-react";

export function ManagerLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo');

  const [propertyType, setPropertyType] = useState("Hotel");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const triggerGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    if (returnTo) {
      window.location.href = `/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    } else {
      window.location.href = "/auth/google";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Left side: Marketing / Value Prop */}
      <div className="md:w-1/2 bg-gray-900 text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Hotel size={300} />
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
            ScanVista
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-300 mb-8 leading-relaxed">
            Transform your property navigation instantly into a digital concierge.
          </p>
          <ul className="space-y-4">
            {["Zero app downloads required", "Instant menu & amenity updates", "Direct-dial support channels"].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side: Sign-up Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-500 text-sm mb-4">Join thousands of hosts elevating their guest experience.</p>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-emerald-900">$10/Month Flat Access</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Unlocks your entire application footprint, unlimited editing across all operations, custom layouts, and master QR code printing.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={triggerGoogleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-gray-900 focus:bg-white outline-none transition-all"
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                >
                  <option value="HOTEL">Hotel</option>
                  <option value="RESORT">Resort</option>
                  <option value="HOMESTAY">Homestay</option>
                  <option value="RETREAT">Retreat</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <ChevronRight size={16} className="text-gray-400 rotate-90" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors mt-6 flex justify-center items-center gap-3 shadow-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span>Redirecting...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>


    </div>
  );
}
