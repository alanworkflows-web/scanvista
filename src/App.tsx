import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazyWithPreload } from "./lib/lazyWithPreload";
import { PropertyPage } from "./pages/PropertyPage";
import { ManagerLanding } from "./ManagerLanding";
const ManagerHome = lazyWithPreload(() => import('./pages/ManagerHome').then(m => ({ default: m.ManagerHome })));
const BrandStudio = lazyWithPreload(() => import('./pages/BrandStudio').then(m => ({ default: m.BrandStudio })));
const ManagerMenu = lazyWithPreload(() => import('./pages/ManagerMenu').then(m => ({ default: m.ManagerMenu })));
const ManagerPublishing = lazyWithPreload(() => import('./pages/ManagerPublishing').then(m => ({ default: m.ManagerPublishing })));
const ManagerBilling = lazyWithPreload(() => import('./pages/ManagerBilling').then(m => ({ default: m.ManagerBilling })));
const ManagerHelp = lazyWithPreload(() => import('./pages/ManagerHelp').then(m => ({ default: m.ManagerHelp })));
const AdminCRM = lazyWithPreload(() => import('./pages/AdminCRM').then(m => ({ default: m.AdminCRM })));


import { LandingPage } from "./pages/LandingPage";


import { LegalPage } from "./pages/LegalPage";

import { ManagerOnboarding } from "./pages/ManagerOnboarding";

export const routeComponents = {
  '/manager/home': ManagerHome,
  '/manager/brand': BrandStudio,
  '/manager/menu': ManagerMenu,
  '/manager/publishing': ManagerPublishing,
  '/manager/billing': ManagerBilling,
  '/manager/help': ManagerHelp,
  '/admin/crm': AdminCRM,
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div></div>}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/manager" element={<ManagerLanding />} />
        <Route path="/p/:propertySlug" element={<PropertyPage />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />

        {/* Authenticated Manager Routes */}
        <Route path="/manager/onboarding" element={<ManagerOnboarding />} />
        <Route path="/manager/home" element={<ManagerHome />} />
        <Route path="/manager/brand" element={<BrandStudio />} />
        <Route path="/manager/menu" element={<ManagerMenu />} />
        <Route path="/manager/publishing" element={<ManagerPublishing />} />
        <Route path="/manager/billing" element={<ManagerBilling />} />
        <Route path="/manager/help" element={<ManagerHelp />} />
        <Route path="/admin/crm" element={<AdminCRM />} />
      </Routes>
        </Suspense>
    </BrowserRouter>
  );
}
