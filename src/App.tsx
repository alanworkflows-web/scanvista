import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PropertyPage } from "./pages/PropertyPage";
import { ManagerLanding } from "./ManagerLanding";
import { ManagerDashboard } from "./ManagerDashboard";
import { ManagerPlan } from "./pages/ManagerPlan";
import { LandingPage } from "./pages/LandingPage";
import { ManagerOperations } from "./pages/ManagerOperations";
import { ManagerQr } from "./pages/ManagerQr";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/manager" element={<ManagerLanding />} />
        <Route path="/p/:propertySlug" element={<PropertyPage />} />

        {/* Authenticated Manager Routes */}
        <Route path="/manager/setup" element={<ManagerDashboard />} />
        <Route path="/manager/operations" element={<ManagerOperations />} />
        <Route path="/manager/qr" element={<ManagerQr />} />
        <Route path="/manager/plan" element={<ManagerPlan />} />
      </Routes>
    </BrowserRouter>
  );
}
