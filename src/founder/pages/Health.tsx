import React from "react";
import { Link } from "react-router-dom";
import { founderTokens as tokens } from "../design-tokens";

const tiers = [
  { name: "Healthy", count: 11, color: tokens.colors.status.emerald, orgs: ["Mountain Retreats", "City Suites", "Sunset Villas"] },
  { name: "Good", count: 2, color: "#10B98199", orgs: ["Lakeside Cabins"] },
  { name: "Needs Attention", count: 1, color: tokens.colors.status.amber, orgs: ["Ocean Breeze Resort"] },
  { name: "At Risk", count: 0, color: "#EF444499", orgs: [] },
  { name: "Critical", count: 0, color: tokens.colors.status.red, orgs: [] }
];

export const HealthExplorer: React.FC = () => {
  return (
    <div>
      <h1 style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.normal,
        margin: `0 0 ${tokens.spacing.xl} 0`
      }}>
        Health Explorer
      </h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg, maxWidth: "800px" }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.border}`,
            borderLeft: `6px solid ${tier.color}`,
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.md
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{
                fontFamily: tokens.typography.fontFamily.sans,
                fontSize: "1.5rem",
                fontWeight: tokens.typography.weight.bold,
                margin: 0,
                color: tokens.colors.textPrimary
              }}>
                {tier.name}
              </h2>
              <div style={{
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: "2rem",
                color: tier.color,
                fontWeight: tokens.typography.weight.bold
              }}>
                {tier.count}
              </div>
            </div>
            
            {tier.orgs.length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: tokens.spacing.sm,
                marginTop: tokens.spacing.sm
              }}>
                {tier.orgs.map(org => (
                  <Link key={org} to={`/founder/organizations/${org.replace(/\s+/g, '-').toLowerCase()}`} style={{
                    backgroundColor: tokens.colors.surfaceAlt,
                    padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                    borderRadius: "16px",
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: "0.85rem",
                    color: tokens.colors.textPrimary,
                    textDecoration: "none",
                    border: `1px solid ${tokens.colors.border}`
                  }}>
                    {org}
                  </Link>
                ))}
                {tier.count > tier.orgs.length && (
                  <div style={{
                    padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: "0.85rem",
                    color: tokens.colors.textMuted
                  }}>
                    +{tier.count - tier.orgs.length} more
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
