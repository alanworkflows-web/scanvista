import React from "react";
import { Link } from "react-router-dom";
import { 
  Hotel, 
  ArrowRight, 
  QrCode, 
  Sparkles, 
  RefreshCw, 
  BarChart3, 
  Building2, 
  HelpCircle,
  Layers
} from "lucide-react";
import { GlobalFooter } from "../components/ui/GlobalFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans selection:bg-[#111827]/10 selection:text-[#111827]">
      {/* Navigation */}
      <nav aria-label="Main Navigation" className="bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#F3F1EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#111827] rounded-lg p-1">
              <div className="w-10 h-10 rounded-lg bg-[#111827] flex items-center justify-center text-[#FAF9F6] group-hover:scale-105 transition-transform">
                <Hotel className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-serif font-semibold text-2xl tracking-tight text-[#111827]">
                ScanVista
              </span>
            </Link>
            
            <div className="flex items-center gap-4 sm:gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-[#111827] hover:text-[#C95A00] transition-colors hidden md:block">
                How It Works
              </a>
              <a href="#outcomes" className="text-sm font-medium text-[#111827] hover:text-[#C95A00] transition-colors hidden md:block">
                Outcomes
              </a>
              <Link 
                to="/manager" 
                className="text-sm font-semibold text-[#111827] hover:text-[#C95A00] transition-colors px-2 py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/manager" 
                id="hero-nav-cta"
                className="bg-[#111827] hover:bg-[#0F172A] text-[#FAF9F6] shadow-md hover:shadow-lg text-xs sm:text-sm font-medium py-2.5 px-4 sm:px-6 rounded-full transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Start Free for a Few Weeks</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] text-[#FAF9F6] text-xs sm:text-sm font-semibold mb-8">
            <QrCode className="w-4 h-4 text-[#FAF9F6]" aria-hidden="true" />
            <span>The QR-powered Guest Experience Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium text-[#111827] tracking-tight max-w-5xl mx-auto leading-[1.12] mb-10">
            The QR-powered Guest Experience Platform
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto sm:max-w-none mb-12">
            <Link 
              to="/manager" 
              id="hero-primary-cta"
              className="w-full sm:w-auto bg-[#111827] hover:bg-[#0F172A] text-[#FAF9F6] font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg transform hover:-translate-y-0.5"
            >
              <span>Start Free for a Few Weeks</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <a 
              href="#how-it-works" 
              className="w-full sm:w-auto bg-[#FAF9F6] border border-[#111827] text-[#111827] hover:bg-[#F3F1EB] font-semibold py-4 px-8 rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-lg"
            >
              See How It Works
            </a>
          </div>
        </section>

        {/* 3-Step Workflow Section */}
        <section id="how-it-works" className="py-20 bg-[#F3F1EB] scroll-mt-20 border-t border-gray-200/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-[#111827] font-bold mb-3 block">Three-Step Workflow</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#111827] mb-4">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] flex items-center justify-center text-[#111827] font-serif font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                  1
                </div>
                <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                  Set up your property
                </h3>
              </div>

              {/* Step 2 */}
              <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] flex items-center justify-center text-[#111827] font-serif font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                  2
                </div>
                <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                  Publish your QR
                </h3>
              </div>

              {/* Step 3 */}
              <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] flex items-center justify-center text-[#111827] font-serif font-bold text-2xl mb-6 group-hover:scale-110 transition-transform">
                  3
                </div>
                <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                  Delight your guests
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Outcome-Driven Section */}
        <section id="outcomes" className="py-20 bg-[#FAF9F6] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#111827] font-bold mb-3 block">Outcomes</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-[#111827] mb-4">
              Built for Guest Satisfaction
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Outcome 1 */}
            <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] text-[#111827] flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                Reduce repetitive guest questions
              </h3>
            </div>

            {/* Outcome 2 */}
            <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] text-[#111827] flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                One QR for everything guests need
              </h3>
            </div>

            {/* Outcome 3 */}
            <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] text-[#111827] flex items-center justify-center mb-6">
                <RefreshCw className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                Update once, publish everywhere
              </h3>
            </div>

            {/* Outcome 4 */}
            <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] text-[#111827] flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                Works for all hospitality properties
              </h3>
            </div>

            {/* Outcome 5 */}
            <div className="bg-[#111827] border border-[#0F172A] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col items-start md:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] text-[#111827] flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif font-medium text-[#FAF9F6]">
                Understand guest engagement
              </h3>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 bg-[#0F172A] text-[#FAF9F6] relative overflow-hidden border-t border-[#000000]/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-5xl font-serif font-medium mb-8 tracking-tight">
              The QR-powered Guest Experience Platform
            </h2>
            <Link 
              to="/manager" 
              id="footer-banner-cta"
              className="inline-flex items-center gap-3 bg-[#FAF9F6] hover:bg-[#F3F1EB] text-[#111827] font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all text-lg transform hover:-translate-y-0.5"
            >
              <span>Start Free for a Few Weeks</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <GlobalFooter />
    </div>
  );
}
