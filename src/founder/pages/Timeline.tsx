import React from "react";
import { Link } from "react-router-dom";
import { founderTokens as tokens } from "../design-tokens";

const mockTimeline = [
  { time: "09:42 AM", org: "Ocean Breeze Resort", action: "accepted AI recommendation", impact: "Efficiency +5%" },
  { time: "09:39 AM", org: "Mountain Retreats", action: "created new property", impact: "Scale +1" },
  { time: "09:37 AM", org: "Ocean Breeze Resort", action: "completed Walk Mode", impact: "Consistency +2%" },
  { time: "09:31 AM", org: "City Suites", action: "invited new manager", impact: "Active Users +1" },
  { time: "09:28 AM", org: "Ocean Breeze Resort", action: "health changed to 'Needs Attention'", impact: "Risk Alert" }
];

export const Timeline: React.FC = () => {
  return (
    <div>
      <h1 style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.normal,
        margin: `0 0 ${tokens.spacing.xl} 0`
      }}>
        Event Timeline
      </h1>
      
      <div style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.border}`,
        padding: tokens.spacing.xl,
        maxWidth: "900px"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{
              textAlign: "left",
              fontFamily: tokens.typography.fontFamily.sans,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: tokens.colors.textMuted,
              borderBottom: `2px solid ${tokens.colors.surfaceAlt}`
            }}>
              <th style={{ padding: tokens.spacing.md, width: "120px" }}>Time</th>
              <th style={{ padding: tokens.spacing.md }}>Organization</th>
              <th style={{ padding: tokens.spacing.md }}>Action</th>
              <th style={{ padding: tokens.spacing.md, textAlign: "right" }}>Impact</th>
            </tr>
          </thead>
          <tbody>
            {mockTimeline.map((evt, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${tokens.colors.surfaceAlt}` }}>
                <td style={{
                  padding: tokens.spacing.md,
                  fontFamily: tokens.typography.fontFamily.mono,
                  fontSize: "0.85rem",
                  color: tokens.colors.textSecondary
                }}>
                  {evt.time}
                </td>
                <td style={{
                  padding: tokens.spacing.md,
                  fontFamily: tokens.typography.fontFamily.sans,
                  fontWeight: tokens.typography.weight.semibold
                }}>
                  <Link to={`/founder/organizations/${evt.org.replace(/\s+/g, '-').toLowerCase()}`} style={{
                    color: tokens.colors.textPrimary,
                    textDecoration: "none"
                  }}>
                    {evt.org}
                  </Link>
                </td>
                <td style={{
                  padding: tokens.spacing.md,
                  fontFamily: tokens.typography.fontFamily.sans,
                  color: tokens.colors.textSecondary
                }}>
                  {evt.action}
                </td>
                <td style={{
                  padding: tokens.spacing.md,
                  fontFamily: tokens.typography.fontFamily.sans,
                  fontSize: "0.85rem",
                  color: tokens.colors.status.emerald,
                  textAlign: "right",
                  fontWeight: tokens.typography.weight.semibold
                }}>
                  {evt.impact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
