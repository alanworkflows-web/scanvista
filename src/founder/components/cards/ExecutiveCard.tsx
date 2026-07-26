import React from "react";
import { founderTokens as tokens } from "../../design-tokens";

interface ExecutiveCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: "up" | "down" | "flat"; value: string; text?: string };
  status?: "emerald" | "amber" | "red";
  onClick?: () => void;
}

export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({ title, value, subtitle, trend, status, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing.xl,
        border: `1px solid ${tokens.colors.border}`,
        boxShadow: tokens.shadows.sm,
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.md,
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = tokens.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = tokens.shadows.sm;
        }
      }}
    >
      <div style={{
        fontFamily: tokens.typography.fontFamily.sans,
        fontSize: "0.9rem",
        fontWeight: tokens.typography.weight.medium,
        color: tokens.colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        {title}
      </div>
      
      <div style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.bold,
        color: status ? tokens.colors.status[status] : tokens.colors.textPrimary,
        lineHeight: 1
      }}>
        {value}
      </div>
      
      {(subtitle || trend) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.spacing.sm,
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "0.85rem",
          color: tokens.colors.textMuted
        }}>
          {trend && (
            <span style={{
              color: trend.direction === "up" ? tokens.colors.status.emerald : 
                     trend.direction === "down" ? tokens.colors.status.red : 
                     tokens.colors.textSecondary,
              fontWeight: tokens.typography.weight.semibold
            }}>
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "−"} {trend.value}
            </span>
          )}
          {trend?.text || subtitle}
        </div>
      )}
    </div>
  );
};
