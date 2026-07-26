import React from "react";
import { ConciergeBell } from "lucide-react";
import { DecisionCard } from "./DecisionCard";
import { useStrategy } from "../../../lib/strategyEngine";

export function ReceptionReadiness() {
  const { activeGoal } = useStrategy();

  const getPrediction = () => {
    if (activeGoal === "reviews") return "Personally greeting Table 8 (Anniversary) and Room 204 (VIP) yields a 85% chance of a 5-star review.";
    if (activeGoal === "revenue") return "Room 204 VIP is eligible for a late checkout upsell if we can delay their room turnover.";
    return "If current housekeeping pace continues, VIP Room 204 will miss check-in by 35 minutes."; // efficiency
  };

  return (
    <DecisionCard
      title="Reception Advisor"
      icon={<ConciergeBell size={18} />}
      status="warning"
      facts={[
        { label: "Checked In Today", value: "4 / 12" },
        { label: "VIP Arrivals",     value: "2 (12:30 PM)" },
        { label: "Late Check-outs",  value: "3 Pending" },
        { label: "Avg Wait",         value: "4 min" },
      ]}
      dependencies={[
        { department: "Housekeeping", status: "warning" },
        { department: "Kitchen",      status: "warning" },
        { department: "Inventory",    status: "ready" },
      ]}
      evidence={[
        "VIP arrival scheduled for 12:30 PM (Mr. Henderson)",
        "Room 204 requires deep clean and special welcome tray",
        "Average turnaround time for VIP rooms: 45 minutes",
        "Current time: 11:15 AM (75 mins until arrival)"
      ]}
      prediction={getPrediction()}
      recommendation="Escalate Room 204 turnover to Housekeeping lead. Prepare welcome tray before 12:15 PM. Confirm dietary preference (no nuts) with Kitchen."
      impact="VIP service failure leading to complaint and potential review damage."
    />
  );
}
