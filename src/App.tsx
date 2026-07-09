/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PropertyPage } from "./pages/PropertyPage";
import { ManagerLanding } from "./ManagerLanding";
import { ManagerDashboard } from "./ManagerDashboard";
import { ManagerPlan } from "./pages/ManagerPlan";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manager" element={<ManagerLanding />} />
        <Route path="/manager/setup" element={<ManagerDashboard />} />
        <Route path="/manager/plan" element={<ManagerPlan />} />
        <Route path="/p/:propertySlug" element={<PropertyPage />} />
        {/* Redirect root to the manager landing page */}
        <Route path="/" element={<Navigate to="/manager" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
