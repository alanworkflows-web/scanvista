import React from "react";
import { Package } from "lucide-react";
import { DecisionCard } from "./DecisionCard";
import { useStrategy } from "../../../lib/strategyEngine";

export function InventoryReadiness() {
  const { activeGoal } = useStrategy();

  const getPrediction = () => {
    if (activeGoal === "revenue") return "Accepting the proposed July pricing will compress gross margin on 5 menu items by 1.2%.";
    if (activeGoal === "reviews") return "Switching to Fresh Foods risks a 2-day delivery gap, potentially forcing menu substitutions that guests dislike.";
    return "Accepting the proposed July pricing will increase your monthly produce COGS by 1.2%."; // efficiency
  };

  return (
    <DecisionCard
      title="Inventory Advisor"
      icon={<Package size={18} />}
      status="warning"
      facts={[
        { label: "Low Stock Items",  value: "3 Items" },
        { label: "Next Delivery",    value: "2:00 PM Today" },
        { label: "Items at PAR",     value: "47 / 50" },
        { label: "Pending Orders",   value: "1 Supplier" },
      ]}
      evidence={[
        "Rajesh Farms quote expires today at 18:00",
        "Proposed July pricing is 8% higher than June",
        "Alternative supplier (Fresh Foods) can match previous pricing but requires 48hr notice",
        "Current inventory will last until Thursday"
      ]}
      prediction={getPrediction()}
      recommendation="Check current reservation count. If lunch covers exceed 60, contact supplier to advance delivery to 11:30 AM. Do not 86 items without manager approval."
      impact="Menu degradation during peak lunch service. Potential 20% reduction in per-cover revenue."
    />
  );
}
