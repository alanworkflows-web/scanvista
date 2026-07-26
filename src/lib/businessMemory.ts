// Business Memory Engine
// Simulates the OS recognizing recurring patterns in historical data.

export type MemoryCategory = "operational" | "staffing" | "guest" | "friction";

export interface BusinessPattern {
  id: string;
  category: MemoryCategory;
  observation: string;
  confidence: number; // 0-100
  lastObserved: string; // ISO date string
}

// In a real implementation, this would aggregate data over time or hit an LLM insights endpoint.
// For the prototype, we provide static patterns that the OS "discovered".
const recognizedPatterns: BusinessPattern[] = [
  {
    id: "pat_truffle_cycle",
    category: "operational",
    observation: "Truffle oil stock depletes every 18 days on average.",
    confidence: 94,
    lastObserved: new Date().toISOString(),
  },
  {
    id: "pat_friday_dinner",
    category: "guest",
    observation: "Friday dinner service consistently sells out by 7:30 PM.",
    confidence: 98,
    lastObserved: new Date(Date.now() - 86400000 * 5).toISOString(), // ~5 days ago
  },
  {
    id: "pat_chef_rosa_prep",
    category: "staffing",
    observation: "Chef Rosa completes lunch prep 15% faster than average.",
    confidence: 88,
    lastObserved: new Date(Date.now() - 86400000).toISOString(), // yesterday
  },
  {
    id: "pat_room_204",
    category: "friction",
    observation: "Room 204 generates 3x more guest complaints than the floor average.",
    confidence: 91,
    lastObserved: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "pat_monday_staffing",
    category: "staffing",
    observation: "Monday mornings experience staffing shortages 40% of the time.",
    confidence: 76,
    lastObserved: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export const businessMemory = {
  getPatternsByCategory: (category: MemoryCategory): BusinessPattern[] => {
    return recognizedPatterns.filter(p => p.category === category);
  },

  getAllPatterns: (): BusinessPattern[] => {
    return recognizedPatterns;
  },

  getTopPatterns: (limit: number = 3): BusinessPattern[] => {
    return [...recognizedPatterns]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }
};
