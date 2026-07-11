import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hotel, Utensils, QrCode, Smartphone, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-serif font-bold text-2xl text-gray-900">
              <Hotel className="text-emerald-600" />
              ScanVista
            </div>
            <div className="flex items-center gap-4">
              <Link to="/manager" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Manager Login
              </Link>
              <Link 
                to="/manager" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-5 rounded-full shadow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 tracking-tight mb-6">
            The Digital Guest Experience,<br className="hidden md:block"/> No App Required.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Empower your hotel or homestay with instant QR-code access to menus, amenities, and house rules. Provide a flawless guest journey straight from their phone browser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/manager" 
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Stop printing menus and updating binders.</h2>
              <p className="text-gray-600 mb-4 text-lg">
                Physical in-room directories are expensive to update, hard to clean, and often ignored by modern guests. 
              </p>
              <p className="text-gray-600 text-lg">
                With ScanVista, your guests simply point their phone camera at the desk QR code to immediately see your live menu, WiFi details, and local recommendations. No downloads, no sign-ups.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-6 rounded-2xl">
                <QrCode className="text-emerald-600 w-10 h-10 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Scan & Go</h3>
                <p className="text-sm text-gray-600">Guests instantly access your portal via any smartphone camera.</p>
              </div>
              <div className="bg-emerald-50 p-6 rounded-2xl mt-8">
                <Smartphone className="text-emerald-600 w-10 h-10 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Mobile Optimized</h3>
                <p className="text-sm text-gray-600">A beautiful, app-like experience that works perfectly in the browser.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">The ScanVista Workflow</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-3">Set Up Property</h3>
                <p className="text-gray-400">Managers add their property details, menus, and amenities in our simple dashboard.</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-3">Print QR Code</h3>
                <p className="text-gray-400">Download your unique canonical QR code and place it in rooms or on tables.</p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-3">Guests Scan</h3>
                <p className="text-gray-400">Guests enjoy a seamless digital experience that you can update in real-time.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 text-lg mb-12">Start for free, upgrade when you need dynamic edits.</p>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="border border-gray-200 rounded-2xl p-8 bg-gray-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Tier</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$0 <span className="text-lg font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-600"><ShieldCheck className="text-emerald-500 w-5 h-5" /> Basic property profile</li>
                  <li className="flex items-center gap-3 text-gray-600"><ShieldCheck className="text-emerald-500 w-5 h-5" /> Static QR Code</li>
                </ul>
              </div>
              
              <div className="border-2 border-emerald-500 rounded-2xl p-8 bg-emerald-50 relative shadow-xl transform md:-translate-y-4">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Flat Rate Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">$10 <span className="text-lg font-normal text-gray-500">/mo</span></div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-800 font-medium"><Zap className="text-emerald-500 w-5 h-5" /> Dynamic Digital Menu</li>
                  <li className="flex items-center gap-3 text-gray-800 font-medium"><Zap className="text-emerald-500 w-5 h-5" /> Unlimited Amenity Updates</li>
                  <li className="flex items-center gap-3 text-gray-800 font-medium"><Zap className="text-emerald-500 w-5 h-5" /> Priority Support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 justify-between items-center">
          <div className="flex items-center gap-2 font-serif font-bold text-xl mb-4 md:mb-0">
            <Hotel className="text-emerald-500" />
            ScanVista
          </div>
          <div className="flex gap-6 text-sm md:justify-end">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
