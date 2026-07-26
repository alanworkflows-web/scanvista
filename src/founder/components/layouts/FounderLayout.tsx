import React from "react";
import { Outlet } from "react-router-dom";
import { FounderSidebar } from "./FounderSidebar";
import { founderTokens as tokens } from "../../design-tokens";

export const FounderLayout: React.FC = () => {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: tokens.colors.surfaceAlt,
      fontFamily: tokens.typography.fontFamily.sans,
      color: tokens.colors.textPrimary
    }}>
      {/* Sidebar - Fixed width */}
      <FounderSidebar />
      
      {/* Main Content Area */}
      <main style={{
        flex: 1,
        marginLeft: "280px", // Match sidebar width
        padding: `${tokens.spacing.xxxl} ${tokens.spacing.xl}`,
        maxWidth: "1400px" // Restrict width for readability
      }}>
        <Outlet />
      </main>
    </div>
  );
};
