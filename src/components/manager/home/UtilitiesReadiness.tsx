import React from "react";
import { Wifi } from "lucide-react";
import { DecisionCard } from "./DecisionCard";
import { useStrategy } from "../../../lib/strategyEngine";

export function UtilitiesReadiness() {
  const { activeGoal } = useStrategy();

  const getPrediction = () => {
    if (activeGoal === "revenue") return "POS latency during lunch rush historically leads to 3% table turnover delay, reducing potential covers.";
    if (activeGoal === "reviews") return "Wi-Fi latency is currently the most mentioned negative keyword in live guest feedback.";
    return "Latency will affect 15-20 POS transactions during the upcoming lunch rush, adding ~2 minutes per checkout."; // efficiency
  };

  return (
    <DecisionCard
      title="Utilities Advisor"
      icon={<Wifi size={18} />}
      status="warning"
      facts={[
        { label: "Guest Wi-Fi",    value: "⚠ High Latency" },
        { label: "POS Terminals",  value: "3 / 3 Online" },
        { label: "QR Menu Access", value: "✓ Live" },
        { label: "HVAC",          value: "✓ Normal" },
      ]}
      evidence={[
        "Network latency is 3× above standard threshold (300ms vs 100ms)",
        "Issue traced to ISP routing, not internal hardware",
        "Estimated resolution time from ISP: 20-40 minutes",
        "Impacts POS terminals and Guest Wi-Fi"
      ]}
      prediction={getPrediction()}
      recommendation="Contact ISP support line now. Estimated resolution 20–40 min. Notify Front Desk to inform guests proactively. Do not restart router during service hours."
      impact="Negative Wi-Fi reviews are among the top 3 complaint categories. Guest satisfaction score risk."
    />
  );
}
