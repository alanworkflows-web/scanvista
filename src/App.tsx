/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PropertyPage } from "./pages/PropertyPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ManagerLanding } from "./ManagerLanding";
import { ManagerDashboard } from "./ManagerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerLanding />} />
        <Route path="/manager/setup" element={<ManagerDashboard />} />
        <Route path="/p/:propertySlug" element={<PropertyPage />} />
        {/* Redirect root to the manager landing page */}
        <Route path="/" element={<Navigate to="/manager" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
