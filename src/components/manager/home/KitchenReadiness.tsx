import React from "react";
import { Flame } from "lucide-react";
import { DecisionCard } from "./DecisionCard";
import { useStrategy } from "../../../lib/strategyEngine";

export function KitchenReadiness() {
  const { activeGoal } = useStrategy();

  const getPrediction = () => {
    if (activeGoal === "revenue") return "Stockout of premium truffle oil will risk $450 in high-margin appetizer sales tonight.";
    if (activeGoal === "reviews") return "Missing truffle oil on the signature dish is historically linked to a 12% drop in food satisfaction scores.";
    return "At your current usage rate, truffle oil will run out Thursday at 2:00 PM."; // efficiency
  };

  return (
    <DecisionCard
      title="Kitchen Advisor"
      icon={<Flame size={18} />}
      status="warning"
      facts={[
        { label: "Lunch Prep",     value: "62% Complete" },
        { label: "Active Stations", value: "4 / 6" },
        { label: "Open Tickets",   value: "3" },
        { label: "Avg Ticket Time", value: "18 min" },
      ]}
      dependencies={[
        { department: "Inventory",   status: "warning" },
        { department: "Housekeeping", status: "ready" },
      ]}
      evidence={[
        "Truffle oil is at 8% PAR (threshold: 15%)",
        "3 menu specials currently use truffle oil",
        "Next supplier delivery: 2:00 PM (after lunch service)",
        "Historical risk: Menu complaints increased 18% during last stockout"
      ]}
      prediction={getPrediction()}
      recommendation="Notify Chef Rosa to substitute with herb oil. Update digital menu before 11:30 AM to prevent guest confusion."
      playbookContext="Chef Rosa has a proven Herb Oil substitution recipe that maintains a 4.8/5 satisfaction score."
      impact="Guest dissatisfaction if specials are promised and unavailable at table."
    />
  );
}
