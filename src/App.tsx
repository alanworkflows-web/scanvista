import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'sonner';
import { lazyWithPreload } from "./lib/lazyWithPreload";
import { PropertyPage } from "./pages/PropertyPage";
import { ManagerLanding } from "./ManagerLanding";
import { NotFoundPage } from "./pages/NotFoundPage";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
const ManagerHome = lazyWithPreload(() => import('./pages/ManagerHome').then(m => ({ default: m.ManagerHome })));
const ManagerMenu = lazyWithPreload(() => import('./pages/ManagerMenu').then(m => ({ default: m.ManagerMenu })));
const ManagerAmenities = lazyWithPreload(() => import('./pages/ManagerAmenities').then(m => ({ default: m.ManagerAmenities })));
const ManagerHouseRules = lazyWithPreload(() => import('./pages/ManagerHouseRules').then(m => ({ default: m.ManagerHouseRules })));
const ManagerPublishing = lazyWithPreload(() => import('./pages/ManagerPublishing').then(m => ({ default: m.ManagerPublishing })));
const ManagerBilling = lazyWithPreload(() => import('./pages/ManagerBilling').then(m => ({ default: m.ManagerBilling })));
const ManagerHelp = lazyWithPreload(() => import('./pages/ManagerHelp').then(m => ({ default: m.ManagerHelp })));
const ManagerExperience = lazyWithPreload(() => import('./pages/ManagerExperience').then(m => ({ default: m.ManagerExperience })));
const AdminCRM = lazyWithPreload(() => import('./pages/AdminCRM').then(m => ({ default: m.AdminCRM })));
const ManagerGuests = lazyWithPreload(() => import('./pages/ManagerGuests').then(m => ({ default: m.ManagerGuests })));
const GuestWelcome = lazyWithPreload(() => import('./pages/GuestWelcome').then(m => ({ default: m.GuestWelcome })));
const ManagerProperty = lazyWithPreload(() => import('./pages/ManagerProperty').then(m => ({ default: m.ManagerProperty })));
const OperationsPlaybook = lazyWithPreload(() => import('./pages/OperationsPlaybook').then(m => ({ default: m.OperationsPlaybook })));

const FounderLayout = lazyWithPreload(() => import('./founder/components/layouts/FounderLayout').then(m => ({ default: m.FounderLayout })));
const FounderHome = lazyWithPreload(() => import('./founder/pages/Home').then(m => ({ default: m.FounderHome })));
const DecisionCenter = lazyWithPreload(() => import('./founder/pages/DecisionCenter').then(m => ({ default: m.DecisionCenter })));
const OverviewPlaceholder = lazyWithPreload(() => import('./founder/pages/Overview').then(m => ({ default: m.OverviewPlaceholder })));
const Timeline = lazyWithPreload(() => import('./founder/pages/Timeline').then(m => ({ default: m.Timeline })));
const OrganizationProfile = lazyWithPreload(() => import('./founder/pages/OrganizationProfile').then(m => ({ default: m.OrganizationProfile })));
const HealthExplorer = lazyWithPreload(() => import('./founder/pages/Health').then(m => ({ default: m.HealthExplorer })));
const PlatformStatus = lazyWithPreload(() => import('./founder/pages/PlatformStatus').then(m => ({ default: m.PlatformStatus })));
const SupportConsole = lazyWithPreload(() => import('./founder/pages/SupportConsole').then(m => ({ default: m.SupportConsole })));

import { LandingPage } from "./pages/LandingPage";


import { LegalCenter } from "./pages/legal/LegalCenter";
import { PrivacyPolicy } from "./pages/legal/policies/PrivacyPolicy";
import { TermsOfService } from "./pages/legal/policies/TermsOfService";
import { CookiePolicy } from "./pages/legal/policies/CookiePolicy";
import { SecurityPolicy } from "./pages/legal/policies/SecurityPolicy";
import { AcceptableUsePolicy } from "./pages/legal/policies/AcceptableUsePolicy";
import { DataRetentionPolicy } from "./pages/legal/policies/DataRetentionPolicy";
import { SupportPolicy } from "./pages/legal/policies/SupportPolicy";
import { HotelPartnerAgreement } from "./pages/legal/policies/HotelPartnerAgreement";
import { CopyrightNotice } from "./pages/legal/policies/CopyrightNotice";

import { ManagerOnboarding } from "./pages/ManagerOnboarding";

export const routeComponents = {
  '/manager/home': ManagerHome,
  '/manager/property': ManagerProperty,
  '/manager/menu': ManagerMenu,
  '/manager/amenities': ManagerAmenities,
  '/manager/house-rules': ManagerHouseRules,
  '/manager/publishing': ManagerPublishing,
  '/manager/billing': ManagerBilling,
  '/manager/help': ManagerHelp,
  '/manager/experience': ManagerExperience,
  '/manager/guests': ManagerGuests,
  '/admin/crm': AdminCRM,
  '/manager/playbook': OperationsPlaybook,
};

export default function App() {
  return (
    <GlobalErrorBoundary>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-4 border-divider border-t-emerald-600 animate-spin"></div></div>}>
          <Routes>
        {/* Public Marketing Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/manager" element={<ManagerLanding />} />
        <Route path="/p/:propertySlug" element={<PropertyPage />} />
        <Route path="/legal" element={<LegalCenter />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/terms" element={<TermsOfService />} />
        <Route path="/legal/cookies" element={<CookiePolicy />} />
        <Route path="/legal/security" element={<SecurityPolicy />} />
        <Route path="/legal/acceptable-use" element={<AcceptableUsePolicy />} />
        <Route path="/legal/data-retention" element={<DataRetentionPolicy />} />
        <Route path="/legal/support" element={<SupportPolicy />} />
        <Route path="/legal/hotel-partner" element={<HotelPartnerAgreement />} />
        <Route path="/legal/copyright" element={<CopyrightNotice />} />
        <Route path="/g/:token" element={<GuestWelcome />} />
        <Route path="/preview/:token" element={<GuestWelcome />} />

        {/* Authenticated Manager Routes */}
        <Route path="/manager/onboarding" element={<ManagerOnboarding />} />
        <Route path="/manager/home" element={<ManagerHome />} />
        <Route path="/manager/property" element={<ManagerProperty />} />
        <Route path="/manager/restaurant" element={<Navigate to="/manager/property" replace />} />
        <Route path="/manager/menu" element={<ManagerMenu />} />
        <Route path="/manager/amenities" element={<ManagerAmenities />} />
        <Route path="/manager/house-rules" element={<ManagerHouseRules />} />
        <Route path="/manager/publishing" element={<ManagerPublishing />} />
        <Route path="/manager/billing" element={<ManagerBilling />} />
        <Route path="/manager/guests" element={<ManagerGuests />} />
        <Route path="/manager/help" element={<ManagerHelp />} />
        <Route path="/manager/experience" element={<ManagerExperience />} />
        <Route path="/admin/crm" element={<AdminCRM />} />
        <Route path="/manager/playbook" element={<OperationsPlaybook />} />
        <Route path="/manager/setup" element={<Navigate to="/manager/home" replace />} />
        
        {/* Founder Layout (Internal Admin) */}
        <Route path="/founder/*" element={<FounderLayout />}>
          <Route path="dashboard" element={<FounderHome />} />
          <Route path="accounts" element={<OverviewPlaceholder title="Accounts" />} />
          <Route path="config" element={<OverviewPlaceholder title="Config" />} />
          <Route path="organizations" element={<OverviewPlaceholder title="Organizations" />} />
          <Route path="organizations/:orgSlug" element={<OrganizationProfile />} />
          <Route path="properties" element={<OverviewPlaceholder title="Properties" />} />
          <Route path="health" element={<HealthExplorer />} />
          <Route path="events" element={<Timeline />} />
          <Route path="analytics" element={<OverviewPlaceholder title="Analytics" />} />
          <Route path="decisions" element={<DecisionCenter />} />
          <Route path="status" element={<PlatformStatus />} />
          <Route path="ai" element={<OverviewPlaceholder title="AI Companion" />} />
          <Route path="roadmap" element={<OverviewPlaceholder title="Roadmap" />} />
          <Route path="support" element={<SupportConsole />} />
          <Route path="settings" element={<OverviewPlaceholder title="Settings" />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
        </Suspense>
    </BrowserRouter>
    </GlobalErrorBoundary>
  );
}
