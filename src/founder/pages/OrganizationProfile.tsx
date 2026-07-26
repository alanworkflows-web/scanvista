import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { founderTokens as tokens } from "../design-tokens";

export const OrganizationProfile: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [activeTab, setActiveTab] = useState("health");

  const orgName = orgSlug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || "Organization";

  const tabs = [
    { id: "health", label: "Health" },
    { id: "timeline", label: "Timeline" },
    { id: "adoption", label: "Feature Adoption" },
    { id: "decisions", label: "Recent Decisions" },
    { id: "users", label: "Active Users" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xl }}>
      
      {/* Header */}
      <div>
        <Link to="/founder/organizations" style={{
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "0.9rem",
          color: tokens.colors.textMuted,
          textDecoration: "none",
          display: "inline-block",
          marginBottom: tokens.spacing.md
        }}>
          ← Back to Organizations
        </Link>
        <h1 style={{
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "2.5rem",
          fontWeight: tokens.typography.weight.bold,
          color: tokens.colors.textPrimary,
          margin: 0
        }}>
          {orgName}
        </h1>
        <div style={{
          fontFamily: tokens.typography.fontFamily.sans,
          color: tokens.colors.status.amber,
          fontWeight: tokens.typography.weight.semibold,
          marginTop: tokens.spacing.sm
        }}>
          Status: Needs Attention
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: tokens.spacing.lg, borderBottom: `1px solid ${tokens.colors.border}` }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${tokens.colors.textPrimary}` : "2px solid transparent",
              padding: `0 0 ${tokens.spacing.sm} 0`,
              fontFamily: tokens.typography.fontFamily.sans,
              fontSize: "1rem",
              fontWeight: activeTab === tab.id ? tokens.typography.weight.bold : tokens.typography.weight.medium,
              color: activeTab === tab.id ? tokens.colors.textPrimary : tokens.colors.textSecondary,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.border}`,
        padding: tokens.spacing.xxl,
        minHeight: "400px"
      }}>
        {activeTab === "health" && (
          <div>
            <h3 style={{ fontFamily: tokens.typography.fontFamily.sans, marginTop: 0 }}>Health Diagnosis</h3>
            <p style={{ fontFamily: tokens.typography.fontFamily.sans, color: tokens.colors.textSecondary, lineHeight: 1.6 }}>
              {orgName} shows early signs of disengagement. Walk Mode completion has dropped by 38% in the last 14 days, and Daily Active Users have fallen from 12 to 8. Recommendation: Account Manager outreach.
            </p>
          </div>
        )}
        {activeTab === "timeline" && (
          <div>
            <h3 style={{ fontFamily: tokens.typography.fontFamily.sans, marginTop: 0 }}>Recent Activity</h3>
            <p style={{ fontFamily: tokens.typography.fontFamily.sans, color: tokens.colors.textSecondary }}>
              Loading event history for {orgName}...
            </p>
          </div>
        )}
        {activeTab !== "health" && activeTab !== "timeline" && (
          <div>
            <p style={{ fontFamily: tokens.typography.fontFamily.sans, color: tokens.colors.textMuted }}>
              This section is under construction.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
