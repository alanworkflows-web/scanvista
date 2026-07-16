import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Cloud, MapPin, Phone, Car, FileText, Navigation, Coffee, Wifi, BookOpen, Utensils, Hotel, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

interface GuestJourney {
  token: string;
  name: string;
  roomNumber: string | null;
  status: string;
  property: {
    name: string;
    bannerUrl: string | null;
    receptionPhone: string | null;
    wifiNetwork: string | null;
    wifiPassword: string | null;
    houseRules: string | null;
  }
}

export function GuestWelcome() {
  const { token } = useParams<{ token: string }>();
  const [journey, setJourney] = useState<GuestJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/guests/${token}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setJourney(data);
          // Simple local storage check for "first visit" preference prompt
          const hasPrefs = localStorage.getItem(`scanvista_prefs_${token}`);
          if (!hasPrefs) {
            setShowPreferences(true);
          }
        }
        setLoading(false);
      });
  }, [token]);

  const savePreferences = () => {
    localStorage.setItem(`scanvista_prefs_${token}`, 'true');
    setShowPreferences(false);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-32 w-64 rounded-2xl" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Hotel size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Journey Not Found</h1>
        <p className="text-gray-500">The link you followed is invalid or has expired.</p>
      </div>
    );
  }

  const { status, property, name, roomNumber } = journey;
  const isBooked = status === "BOOKED";
  const isArriving = status === "ARRIVING";
  const isCheckedIn = ["CHECKED_IN", "STAYING", "CHECKED_OUT"].includes(status);

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24 font-sans text-gray-900">
      
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full">
        {property.bannerUrl ? (
          <img src={property.bannerUrl} alt="Property" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-white/80 font-medium text-sm mb-1 uppercase tracking-wider">{property.name}</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
            Welcome, {name.split(' ')[0]}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-10 space-y-4">
        
        {/* Status Indicator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Current Status</p>
            <p className="font-bold text-gray-900">
              {isBooked && "Trip Confirmed"}
              {isArriving && "Expected Today"}
              {isCheckedIn && "Checked In"}
            </p>
          </div>
          {isCheckedIn && roomNumber && (
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Room</p>
              <p className="font-bold text-emerald-600 text-lg">{roomNumber}</p>
            </div>
          )}
        </div>

        {/* BOOKED VIEW */}
        {isBooked && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <Card className="p-6">
              <h3 className="font-serif font-bold text-xl mb-2">Preparing for your stay</h3>
              <p className="text-gray-600 text-sm mb-6">We are excited to host you at {property.name}. Here is everything you need to know before you arrive.</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Cloud size={20} /></div>
                  <div>
                    <h4 className="font-bold">Weather Forecast</h4>
                    <p className="text-sm text-gray-500">Sunny, 24°C expected during your dates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={20} /></div>
                  <div>
                    <h4 className="font-bold">Location & Parking</h4>
                    <p className="text-sm text-gray-500">Valet parking available at the main entrance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText size={20} /></div>
                  <div>
                    <h4 className="font-bold">Required Documents</h4>
                    <p className="text-sm text-gray-500">Please bring a valid photo ID and booking reference.</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gray-900 text-white border-0">
              <h4 className="font-bold mb-2">Need assistance?</h4>
              <p className="text-gray-400 text-sm mb-4">Our reception team is available 24/7 to help you plan your arrival.</p>
              <Button variant="secondary" className="w-full text-gray-900" onClick={() => window.open(`tel:${property.receptionPhone}`)}>
                <Phone size={16} className="mr-2" /> Call Reception
              </Button>
            </Card>
          </div>
        )}

        {/* ARRIVING VIEW */}
        {isArriving && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <Card className="p-6 bg-emerald-50 border-emerald-100">
              <h3 className="font-serif font-bold text-xl mb-2 text-emerald-900">See you soon!</h3>
              <p className="text-emerald-700 text-sm mb-6">Your room is being prepared. Safe travels.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                  <Navigation size={16} className="mr-2" /> Navigate
                </Button>
                <Button className="w-full bg-emerald-200 text-emerald-900 hover:bg-emerald-300 border-0" onClick={() => window.open(`tel:${property.receptionPhone}`)}>
                  <Phone size={16} className="mr-2" /> Reception
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Car size={20} /></div>
                <div>
                  <h4 className="font-bold">Transport & Airport</h4>
                  <p className="text-sm text-gray-500 mt-1">If you requested an airport pickup, your driver will meet you at Arrivals Gate B.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* CHECKED IN VIEW */}
        {isCheckedIn && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            
            {/* WiFi Quick Connect */}
            {property.wifiNetwork && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Wifi size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase">Guest WiFi</p>
                    <p className="font-bold text-gray-900">{property.wifiNetwork}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600 uppercase">Password</p>
                  <p className="font-bold text-gray-900">{property.wifiPassword || "None"}</p>
                </div>
              </div>
            )}

            {/* Digital Menu Access */}
            <Card className="p-1 group cursor-pointer hover:shadow-lg transition-all" onClick={() => {}}>
              <div className="bg-gray-900 rounded-xl p-6 text-white relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-xl mb-1">In-Room Dining</h3>
                  <p className="text-gray-400 text-sm">Explore our digital menu</p>
                </div>
                <div className="bg-white/10 p-3 rounded-full relative z-10 group-hover:scale-110 transition-transform">
                  <Utensils size={24} className="text-white" />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/10 to-transparent"></div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <Coffee size={24} className="text-emerald-600 mb-3" />
                <h4 className="font-bold mb-1">Amenities</h4>
                <p className="text-xs text-gray-500">Pool, Spa & Gym</p>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <BookOpen size={24} className="text-blue-600 mb-3" />
                <h4 className="font-bold mb-1">Property Guide</h4>
                <p className="text-xs text-gray-500">Rules & Info</p>
              </Card>
            </div>
            
            <Button variant="secondary" className="w-full py-6 text-gray-600" onClick={() => window.open(`tel:${property.receptionPhone}`)}>
              <Phone size={18} className="mr-2" /> Contact Front Desk
            </Button>
          </div>
        )}
      </div>

      {/* Preferences Modal (First Visit) */}
      {showPreferences && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 pb-0 sm:pb-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">How can we help?</h2>
            <p className="text-gray-500 mb-6 text-sm">Select the updates you'd like to receive during your stay. We promise no marketing or spam.</p>
            
            <div className="space-y-3 mb-8">
              {['Room Ready Alerts', 'Weather Updates', 'Dining Specials', 'Safety Notifications', 'Checkout Reminders'].map(pref => (
                <label key={pref} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
                  <span className="font-medium text-gray-700">{pref}</span>
                </label>
              ))}
            </div>
            
            <Button className="w-full py-6 text-lg rounded-full" onClick={savePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Toast */}
      {prefsSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4 fade-in">
          Preferences saved securely.
        </div>
      )}

    </div>
  );
}
