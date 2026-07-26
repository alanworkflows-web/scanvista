import React from "react";
import { founderTokens as tokens } from "../design-tokens";

const services = [
  { name: "Platform", status: "Healthy" },
  { name: "API", status: "Healthy" },
  { name: "Database", status: "Healthy" },
  { name: "Queue", status: "Healthy" },
  { name: "Backups", status: "Healthy" }
];

export const PlatformStatus: React.FC = () => {
  return (
    <div>
      <h1 style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.normal,
        margin: `0 0 ${tokens.spacing.xl} 0`
      }}>
        Engineering Status
      </h1>
      
      <div style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.border}`,
        padding: tokens.spacing.xl,
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.md
      }}>
        {services.map((svc, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${tokens.spacing.sm} 0`,
            borderBottom: idx !== services.length - 1 ? `1px solid ${tokens.colors.surfaceAlt}` : "none"
          }}>
            <div style={{
              fontFamily: tokens.typography.fontFamily.sans,
              fontSize: "1.1rem",
              fontWeight: tokens.typography.weight.medium,
              color: tokens.colors.textPrimary
            }}>
              {svc.name}
            </div>
            <div style={{
              fontFamily: tokens.typography.fontFamily.mono,
              fontSize: "0.9rem",
              color: svc.status === "Healthy" ? tokens.colors.status.emerald : tokens.colors.status.red,
              backgroundColor: tokens.colors.surfaceAlt,
              padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
              borderRadius: tokens.borderRadius.sm
            }}>
              {svc.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
