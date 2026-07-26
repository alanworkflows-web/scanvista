import React, { createContext, useContext, useState, useEffect } from "react";

export type BusinessGoal = "reviews" | "revenue" | "efficiency";

interface StrategyState {
  activeGoal: BusinessGoal;
  setActiveGoal: (goal: BusinessGoal) => void;
}

const StrategyContext = createContext<StrategyState | undefined>(undefined);

const STORAGE_KEY = "scanvista_active_strategy";

export function StrategyProvider({ children }: { children: React.ReactNode }) {
  const [activeGoal, setActiveGoal] = useState<BusinessGoal>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as BusinessGoal) || "efficiency";
    } catch {
      return "efficiency";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeGoal);
    } catch {}
  }, [activeGoal]);

  return (
    <StrategyContext.Provider value={{ activeGoal, setActiveGoal }}>
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategy() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error("useStrategy must be used within a StrategyProvider");
  }
  return context;
}
