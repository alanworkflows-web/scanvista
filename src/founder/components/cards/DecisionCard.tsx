import React from "react";
import { Link } from "react-router-dom";
import { founderTokens as tokens } from "../../design-tokens";

interface DecisionCardProps {
  priority: "HIGH" | "MEDIUM" | "LOW";
  action: string;
  context: string;
  impact?: string;
  recommendation?: string;
  onExecute?: () => void;
  onDismiss?: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ 
  priority, action, context, impact, recommendation, onExecute, onDismiss 
}) => {
  const priorityColor = 
    priority === "HIGH" ? tokens.colors.status.red :
    priority === "MEDIUM" ? tokens.colors.status.amber :
    tokens.colors.status.emerald;

  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.borderRadius.md,
      padding: tokens.spacing.xl,
      border: `1px solid ${tokens.colors.border}`,
      borderLeft: `4px solid ${priorityColor}`,
      display: "flex",
      flexDirection: "column",
      gap: tokens.spacing.md
    }}>
      <div>
        <div style={{
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "0.75rem",
          fontWeight: tokens.typography.weight.bold,
          color: priorityColor,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: tokens.spacing.xs
        }}>
          Priority {priority}
        </div>
        <div style={{
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "1.2rem",
          fontWeight: tokens.typography.weight.semibold,
          color: tokens.colors.textPrimary,
          marginBottom: tokens.spacing.sm
        }}>
          {action}
        </div>
        
        <div style={{
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "0.95rem",
          color: tokens.colors.textSecondary,
          lineHeight: 1.5,
          marginBottom: tokens.spacing.sm
        }}>
          {context}
        </div>

        {impact && (
          <div style={{
            fontFamily: tokens.typography.fontFamily.sans,
            fontSize: "0.95rem",
            color: tokens.colors.textPrimary,
            marginBottom: tokens.spacing.xs
          }}>
            <strong>Expected impact:</strong> {impact}
          </div>
        )}

        {recommendation && (
          <div style={{
            fontFamily: tokens.typography.fontFamily.sans,
            fontSize: "0.95rem",
            color: tokens.colors.textPrimary,
            marginBottom: tokens.spacing.sm
          }}>
            <strong>Recommended action:</strong> {recommendation}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: tokens.spacing.md, marginTop: tokens.spacing.sm }}>
        <Link to="/founder/organizations" style={{
          backgroundColor: tokens.colors.textPrimary,
          color: tokens.colors.surface,
          border: "none",
          borderRadius: tokens.borderRadius.sm,
          padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
          fontFamily: tokens.typography.fontFamily.sans,
          fontSize: "0.85rem",
          fontWeight: tokens.typography.weight.medium,
          textDecoration: "none",
          textAlign: "center",
          transition: "background-color 0.2s ease"
        }}>
          Open Property
        </Link>
        
        {onExecute && (
          <button 
            onClick={onExecute}
            style={{
              backgroundColor: "transparent",
              color: tokens.colors.textPrimary,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.borderRadius.sm,
              padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
              fontFamily: tokens.typography.fontFamily.sans,
              fontSize: "0.85rem",
              fontWeight: tokens.typography.weight.medium,
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
          >
            Mark Complete
          </button>
        )}
        
        {onDismiss && (
          <button 
            onClick={onDismiss}
            style={{
              backgroundColor: "transparent",
              color: tokens.colors.textMuted,
              border: "none",
              padding: `${tokens.spacing.sm} 0`,
              fontFamily: tokens.typography.fontFamily.sans,
              fontSize: "0.85rem",
              fontWeight: tokens.typography.weight.medium,
              cursor: "pointer"
            }}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
