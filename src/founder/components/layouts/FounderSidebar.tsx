import React from "react";
import { Link, useLocation } from "react-router-dom";
import { founderTokens as tokens } from "../../design-tokens";

const navItems = [
  { name: "Overview", path: "/founder" },
  { name: "Intelligence", path: "/founder/intelligence" },
  { name: "Organizations", path: "/founder/organizations" },
  { name: "Properties", path: "/founder/properties" },
  { name: "Platform Health", path: "/founder/health" },
  { name: "Events", path: "/founder/events" },
  { name: "Analytics", path: "/founder/analytics" },
  { name: "Decision Center", path: "/founder/decisions" },
  { name: "AI Companion", path: "/founder/ai" },
  { name: "Support Console", path: "/founder/support" },
  { name: "Settings", path: "/founder/settings" }
];

export const FounderSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div style={{
      width: "280px",
      backgroundColor: tokens.colors.background,
      borderRight: `1px solid ${tokens.colors.border}`,
      display: "flex",
      flexDirection: "column",
      padding: tokens.spacing.xl,
      height: "100vh",
      position: "fixed"
    }}>
      <div style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "1.5rem",
        fontWeight: tokens.typography.weight.bold,
        color: tokens.colors.textPrimary,
        marginBottom: tokens.spacing.xxxl
      }}>
        ScanVista <span style={{ color: tokens.colors.accentHover }}>HQ</span>
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                textDecoration: "none",
                fontFamily: tokens.typography.fontFamily.sans,
                fontSize: "0.95rem",
                fontWeight: isActive ? tokens.typography.weight.semibold : tokens.typography.weight.medium,
                color: isActive ? tokens.colors.textPrimary : tokens.colors.textSecondary,
                padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isActive ? tokens.colors.surfaceAlt : "transparent",
                transition: "all 0.2s ease"
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{
        marginTop: "auto",
        fontFamily: tokens.typography.fontFamily.sans,
        fontSize: "0.8rem",
        color: tokens.colors.textMuted
      }}>
        Operating System v2.0
      </div>
    </div>
  );
};
