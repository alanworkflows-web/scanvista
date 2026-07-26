import React from "react";
import { Link } from "react-router-dom";
import { Hotel, ArrowRight, CheckCircle2, Shield, LifeBuoy } from "lucide-react";
import { GlobalFooter } from "../components/ui/GlobalFooter";
import { PRICING_CONFIG } from "../lib/pricingConstants";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-surface border-b border-divider sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-serif font-medium text-2xl text-text-primary">
              <Hotel className="text-primary" />
              ScanVista
            </div>
            <div className="flex items-center gap-10">
              <a href="#pricing" className="text-sm font-medium text-text-secondary opacity-80 hover:text-text-primary transition-colors hidden md:block">Pricing</a>
              <a href="#contact" className="text-sm font-medium text-text-secondary opacity-80 hover:text-text-primary transition-colors hidden md:block">Contact</a>
              <Link to="/manager" className="text-sm font-medium text-text-secondary opacity-80 hover:text-text-primary transition-colors">
                Login
              </Link>
              <Link 
                to="/manager" 
                className="bg-primary hover:bg-primary-hover text-white shadow-premium-hover transition-all hover:bg-emerald-700 text-white text-sm font-medium py-2 px-5 rounded-full shadow-premium transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-text-primary tracking-tight mb-12">
            The Digital Front Desk,<br className="hidden md:block"/> No App Required.
          </h1>
          <p className="text-lg md:text-2xl text-text-secondary opacity-80 max-w-3xl mx-auto mb-12">
            Give your hotel guests instant QR access to menus, amenities, and concierge services. Beautifully designed for the hospitality industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-10 justify-center">
            <Link 
              to="/manager" 
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-8 rounded-full shadow-premium hover:shadow-premium transition-all flex items-center justify-center gap-2 text-lg"
            >
              Start 14-Day Free Trial <ArrowRight size={20} />
            </Link>
            <a 
              href="#contact" 
              className="bg-surface hover:bg-background border border-divider text-text-primary font-medium py-4 px-8 rounded-full shadow-premium hover:shadow-premium-hover transition-all flex items-center justify-center gap-2 text-lg"
            >
              Request a Demo
            </a>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-medium text-text-primary mb-4">Simple Pricing That Grows With Your Hotel</h2>
              <p className="text-xl text-text-secondary opacity-80">Start free. Upgrade to Pro anytime for just ${PRICING_CONFIG.PRO_PLAN_PRICE}/month.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <div className="border border-divider rounded-sm p-8 bg-surface shadow-premium flex flex-col">
                <h3 className="text-3xl font-serif text-text-primary mb-2">Free Plan</h3>
                <p className="text-text-secondary opacity-60 mb-12">Perfect for getting started</p>
                <div className="text-4xl font-medium text-text-primary mb-12">Free</div>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> 1 Property</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> 1 Digital Menu</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Basic Amenities</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> QR Code</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> {PRICING_CONFIG.FREE_PLAN_GUEST_VIEWS_PER_DAY} Guest Views per Day</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Community Support</li>
                </ul>
                <Link to="/manager" className="w-full py-3 px-4 border border-emerald-600 text-primary font-medium rounded-sm text-center hover:bg-primary/5">Start Free</Link>
              </div>

              <div className="border-2 border-emerald-600 rounded-sm p-8 bg-primary/5/30 shadow-premium-hover relative flex flex-col transform scale-105">
                <h3 className="text-3xl font-serif text-text-primary mb-2">Pro Plan</h3>
                <p className="text-text-secondary opacity-60 mb-12">For full-service properties</p>
                <div className="text-4xl font-medium text-text-primary mb-12">${PRICING_CONFIG.PRO_PLAN_PRICE}<span className="text-lg text-text-secondary opacity-60 font-normal">/month</span></div>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Everything in Free</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Unlimited Guest Views</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Unlimited Menus</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Unlimited Amenities</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Custom Branding</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Priority Support</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Future Premium Features</li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="text-primary" size={20} /> Early Access Features</li>
                </ul>
                <Link to="/manager" className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white shadow-premium-hover transition-all font-medium rounded-sm text-center">Upgrade to Pro</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Support */}
        <section id="contact" className="py-20 bg-background border-t border-divider">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif font-medium text-text-primary mb-12">Get in Touch</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-surface p-8 rounded-sm border border-divider shadow-premium flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-light/20 text-primary rounded-full flex items-center justify-center mb-4"><LifeBuoy /></div>
                <h3 className="text-xl font-medium mb-2">Support</h3>
                <p className="text-text-secondary opacity-80 mb-4">Need help with your property? Our hospitality experts are available 24/7.</p>
                <a href="mailto:support@scanvista.com" className="text-primary font-medium hover:underline">support@scanvista.com</a>
              </div>
              <div className="bg-surface p-8 rounded-sm border border-divider shadow-premium flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4"><Shield /></div>
                <h3 className="text-xl font-medium mb-2">Sales & Demos</h3>
                <p className="text-text-secondary opacity-80 mb-4">Managing a large portfolio? Let's discuss an Enterprise pilot.</p>
                <a href="mailto:sales@scanvista.com" className="text-blue-600 font-medium hover:underline">sales@scanvista.com</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <GlobalFooter />
    </div>
  );
}
