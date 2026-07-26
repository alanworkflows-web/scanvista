export type DecisionOutcome = "approved" | "reviewed" | "updated" | "resolved" | "dismissed";

export interface DecisionRecord {
  id: string; // A unique hash or slug for the type of decision (e.g., 'ot-housekeeping-vip')
  timestamp: number;
  outcome: DecisionOutcome;
}

const MEMORY_KEY = "scanvista_decision_memory";

function getMemory(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export const decisionMemory = {
  record: (id: string, outcome: DecisionOutcome) => {
    try {
      const memory = getMemory();
      const newRecord: DecisionRecord = { id, timestamp: Date.now(), outcome };
      localStorage.setItem(MEMORY_KEY, JSON.stringify([...memory, newRecord]));
    } catch (e) {
      console.warn("Failed to record decision memory");
    }
  },

  getPastOutcome: (id: string): DecisionRecord | null => {
    const memory = getMemory();
    // Return the most recent decision for this ID
    const past = memory.filter(m => m.id === id).sort((a, b) => b.timestamp - a.timestamp);
    return past.length > 0 ? past[0] : null;
  }
};
