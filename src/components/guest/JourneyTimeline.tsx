import React from "react";
import { getJourneyProgress, JOURNEY_STEPS, getCountdown } from "../../lib/guestJourney";
import type { GuestStatus } from "../../lib/guestJourney";

interface JourneyTimelineProps {
  status: GuestStatus;
  arrivalDate: string | null;
}

export function JourneyTimeline({ status, arrivalDate }: JourneyTimelineProps) {
  const progress = getJourneyProgress(status);

  const steps = [
    { label: "Booking Confirmed", threshold: 25 },
    { label: progress < 50 ? `Arrival ${getCountdown(arrivalDate)}` : "Arrived", threshold: 50 },
    { label: "Checked In", threshold: 75 },
    { label: "Checkout", threshold: 100 },
  ];

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-gray-500 uppercase" id="journey-label">Journey</span>
          <span className="text-xs font-bold text-emerald-600">{progress}%</span>
        </div>
        <div
          className="w-full bg-gray-100 rounded-full h-2"
          role="progressbar"
          aria-labelledby="journey-label"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Timeline */}
      <div className="space-y-2 text-xs font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
        {steps.map((step, i) => {
          const done = progress >= step.threshold;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 ${done ? "text-gray-900" : "text-gray-400"}`}
              aria-label={`${step.label}: ${done ? "completed" : "pending"}`}
            >
              {done ? (
                <span className="text-emerald-500" aria-hidden="true">✓</span>
              ) : (
                <span aria-hidden="true">○</span>
              )}
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
