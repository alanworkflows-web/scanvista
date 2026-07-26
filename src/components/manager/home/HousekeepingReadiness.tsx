import React from "react";
import { BedDouble } from "lucide-react";
import { DecisionCard } from "./DecisionCard";
import { useStrategy } from "../../../lib/strategyEngine";

export function HousekeepingReadiness() {
  const { activeGoal } = useStrategy();

  const getPrediction = () => {
    if (activeGoal === "reviews") return "Delayed check-ins are the #1 cause of negative reviews. Overtime approval prevents 4 immediate risks.";
    if (activeGoal === "revenue") return "Expediting Room 204 turnover allows early check-in fee capture ($40).";
    return "Without overtime approval, 4 early check-ins will be delayed by an average of 40 minutes."; // efficiency
  };

  return (
    <DecisionCard
      title="Housekeeping Advisor"
      icon={<BedDouble size={18} />}
      status="warning"
      facts={[
        { label: "Rooms Cleaned",    value: "8 / 24" },
        { label: "Priority Rooms",   value: "2 Flagged" },
        { label: "Staff On Duty",    value: "5 of 7" },
        { label: "Open Requests",    value: "4" },
      ]}
      dependencies={[
        { department: "Reception", status: "warning" },
      ]}
      evidence={[
        "2 staff members called in sick (Morning shift)",
        "14 rooms pending turnover before 15:00 check-in rush",
        "Room 204 is marked high-priority (VIP arrival)",
        "Overtime cost estimated at $120 vs potential VIP complaint"
      ]}
      prediction={getPrediction()}
      recommendation="Redeploy 1 staff member from lower-priority Section C to complete Rooms 204 and 112 before 12:00 PM."
      responsibility="Housekeeping Team A"
      executionState="executing"
      impact="VIP arrival delayed by unclean room creates cascading service failure at Reception."
    />
  );
}
