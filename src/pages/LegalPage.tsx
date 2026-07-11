import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LegalPage() {
  const location = useLocation();
  const isPrivacy = location.pathname.includes("privacy");
  const title = isPrivacy ? "Privacy Policy" : "Terms of Service";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-3 h-3 border-2 border-white rounded-full bg-transparent" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-gray-900">ScanVista</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">{title}</h1>
          
          <div className="prose prose-emerald max-w-none text-gray-600 space-y-6">
            <p className="text-sm text-gray-500">Last updated: July 2026</p>
            
            {isPrivacy ? (
              <>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us when you create an account, build your property profile, and interact with the ScanVista service. This includes contact details, property information, and operational data.</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                  <p>We use the information we collect to operate, maintain, and improve our services, to communicate with you, and to personalize your experience. We do not sell your personal data to third parties.</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
                  <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                  <p>By accessing and using ScanVista, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Service Provision</h2>
                  <p>ScanVista provides a digital hospitality platform. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. <strong>[Business Owner: Review SLA terms]</strong></p>
                </section>
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
                  <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information when creating your property profile.</p>
                </section>
              </>
            )}
            
            <section className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-12">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Contact Us</h2>
              <p>If you have any questions about this {title}, please contact us at support@scanvista.com.</p>
              <p className="text-sm font-medium text-amber-600 mt-2">Note: Business owners must review and adapt these legal templates before operating commercially.</p>
            </section>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ScanVista. All rights reserved.</p>
      </footer>
    </div>
  );
}
