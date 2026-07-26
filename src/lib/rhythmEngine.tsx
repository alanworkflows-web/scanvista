import React, { createContext, useContext, useState, useEffect } from "react";

export type OperationalPhase = 
  | "morning_brief" // 06:00 - 10:00
  | "walk_mode"     // 10:00 - 11:30
  | "lunch_ops"     // 11:30 - 14:30
  | "admin"         // 14:30 - 17:00
  | "dinner_ops"    // 17:00 - 21:00
  | "handover";     // 21:00 - 06:00

export interface RhythmState {
  currentPhase: OperationalPhase;
  currentTime: Date;
  overridePhase: (phase: OperationalPhase | null) => void;
  isOverridden: boolean;
}

const RhythmContext = createContext<RhythmState | undefined>(undefined);

const determinePhase = (date: Date): OperationalPhase => {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const time = hour + minutes / 60;

  if (time >= 6 && time < 10) return "morning_brief";
  if (time >= 10 && time < 11.5) return "walk_mode";
  if (time >= 11.5 && time < 14.5) return "lunch_ops";
  if (time >= 14.5 && time < 17) return "admin";
  if (time >= 17 && time < 21) return "dinner_ops";
  return "handover";
};

export const phaseLabels: Record<OperationalPhase, string> = {
  morning_brief: "Morning Brief",
  walk_mode: "Property Walk",
  lunch_ops: "Lunch Operations",
  admin: "Admin & Recovery",
  dinner_ops: "Dinner Operations",
  handover: "Shift Handover"
};

export function RhythmProvider({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualPhase, setManualPhase] = useState<OperationalPhase | null>(null);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentPhase = manualPhase || determinePhase(currentTime);

  return (
    <RhythmContext.Provider 
      value={{ 
        currentPhase, 
        currentTime,
        overridePhase: setManualPhase,
        isOverridden: manualPhase !== null
      }}
    >
      {children}
    </RhythmContext.Provider>
  );
}

export function useRhythm() {
  const context = useContext(RhythmContext);
  if (!context) {
    throw new Error("useRhythm must be used within a RhythmProvider");
  }
  return context;
}
