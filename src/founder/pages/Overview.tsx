import React from "react";
import { founderTokens as tokens } from "../design-tokens";

export const OverviewPlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1 style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.normal,
        margin: `0 0 ${tokens.spacing.xl} 0`
      }}>
        {title}
      </h1>
      <div style={{
        padding: tokens.spacing.xl,
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.borderRadius.md,
        border: `1px dashed ${tokens.colors.border}`,
        fontFamily: tokens.typography.fontFamily.sans,
        color: tokens.colors.textMuted
      }}>
        {title} view is under construction (Phase 2/3).
      </div>
    </div>
  );
};
