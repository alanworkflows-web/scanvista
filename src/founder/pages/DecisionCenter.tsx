import React from "react";
import { founderTokens as tokens } from "../design-tokens";
import { DecisionCard } from "../components/cards/DecisionCard";

export const DecisionCenter: React.FC = () => {
  return (
    <div>
      <h1 style={{
        fontFamily: tokens.typography.fontFamily.serif,
        fontSize: "2.5rem",
        fontWeight: tokens.typography.weight.normal,
        margin: `0 0 ${tokens.spacing.xl} 0`
      }}>
        Decision Center
      </h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg, maxWidth: "800px" }}>
        <DecisionCard 
          priority="HIGH"
          action="Contact Ocean Breeze Resort"
          context="Walk Mode usage has declined 38% over the last 14 days."
          impact="Lower operational consistency."
          recommendation="Contact the manager and review onboarding."
          onExecute={() => {}}
          onDismiss={() => {}}
        />
        <DecisionCard 
          priority="MEDIUM"
          action="Enable Walk Mode onboarding"
          context="3 properties have not used Walk Mode this week."
          impact="Feature under-utilization across orgs."
          recommendation="Send automated check-in prompt to active admins."
          onExecute={() => {}}
          onDismiss={() => {}}
        />
        <DecisionCard 
          priority="LOW"
          action="Archive inactive property 'Test Hotel'"
          context="No activity in 90 days. Revenue impact: $0."
          impact="Clutters platform metrics."
          recommendation="Archive organization."
          onExecute={() => {}}
          onDismiss={() => {}}
        />
      </div>
    </div>
  );
};
