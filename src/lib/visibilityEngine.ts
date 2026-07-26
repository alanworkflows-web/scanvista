/**
 * Universal Visibility Engine
 * Evaluates visibility fields (alwaysVisible, visibleFrom, visibleUntil, daysActive, status)
 * against the current property time.
 */

export interface VisibilityConfig {
  alwaysVisible: boolean;
  visibleFrom?: string | null;
  visibleUntil?: string | null;
  daysActive?: any | null; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  status: string; // "ACTIVE", "SEASONAL", "HIDDEN", "COMING_SOON", "TEMPORARILY_CLOSED"
  seasonalRules?: any | null; // e.g. [{ start: "MM-DD", end: "MM-DD", name: "Summer" }]
}

export type VisibilityState = 'OPEN_NOW' | 'COMING_UP' | 'HIDDEN' | 'CLOSED';

export interface VisibilityResult {
  state: VisibilityState;
  message?: string;
  comingUpInMins?: number;
}

export function evaluateVisibility(config: VisibilityConfig, currentTime: Date = new Date()): VisibilityResult {
  // 1. Check Status
  if (config.status === "HIDDEN") return { state: 'HIDDEN' };
  if (config.status === "COMING_SOON") return { state: 'HIDDEN', message: "Coming Soon" };
  if (config.status === "TEMPORARILY_CLOSED" || config.status === "SEASONAL") {
    return { state: 'CLOSED', message: "Temporarily Closed" };
  }

  // 1.5 Check Seasonal Rules
  if (config.seasonalRules && Array.isArray(config.seasonalRules) && config.seasonalRules.length > 0) {
    const currentMonth = (currentTime.getMonth() + 1).toString().padStart(2, '0');
    const currentDayStr = currentTime.getDate().toString().padStart(2, '0');
    const currentDateStr = `${currentMonth}-${currentDayStr}`;
    
    let inSeason = false;
    for (const rule of config.seasonalRules) {
      if (rule.start && rule.end) {
        if (rule.start <= rule.end) {
           if (currentDateStr >= rule.start && currentDateStr <= rule.end) inSeason = true;
        } else {
           if (currentDateStr >= rule.start || currentDateStr <= rule.end) inSeason = true;
        }
      }
    }
    
    if (!inSeason) {
      return { state: 'HIDDEN' };
    }
  }

  // 2. Check Days Active
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = dayNames[currentTime.getDay()];
  if (config.daysActive && Array.isArray(config.daysActive) && config.daysActive.length > 0) {
    if (!config.daysActive.includes(currentDay)) {
      return { state: 'CLOSED', message: "Closed Today" };
    }
  }

  // 3. Always Visible Override
  if (config.alwaysVisible) {
    return { state: 'OPEN_NOW' };
  }

  // 4. Time Window Evaluation
  if (!config.visibleFrom || !config.visibleUntil) {
    return { state: 'OPEN_NOW' }; // fallback if times are missing but not alwaysVisible
  }

  const parseTime = (timeStr: string) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const date = new Date(currentTime);
    date.setHours(hours || 0, mins || 0, 0, 0);
    return date;
  };

  const fromTime = parseTime(config.visibleFrom);
  let untilTime = parseTime(config.visibleUntil);

  // Handle overnight windows (e.g. 22:00 to 02:00)
  if (untilTime <= fromTime) {
    untilTime.setDate(untilTime.getDate() + 1);
  }

  // Check if current time is within window
  // Also handle if current time is in the early morning of an overnight window
  let adjustedCurrentTime = new Date(currentTime);
  if (untilTime <= fromTime && currentTime.getHours() < fromTime.getHours()) {
     // We are in the morning, shift the window back a day to check
     fromTime.setDate(fromTime.getDate() - 1);
     untilTime.setDate(untilTime.getDate() - 1);
  }

  if (adjustedCurrentTime >= fromTime && adjustedCurrentTime <= untilTime) {
    return { state: 'OPEN_NOW' };
  }

  // 5. Coming Up Evaluation
  // If we are before the start time, see how soon
  if (adjustedCurrentTime < fromTime) {
    const diffMins = Math.floor((fromTime.getTime() - adjustedCurrentTime.getTime()) / 60000);
    if (diffMins <= 120) { // Shows as 'Coming Up' if within 2 hours
      return { state: 'COMING_UP', comingUpInMins: diffMins, message: `Starts in ${diffMins} mins` };
    }
  }

  return { state: 'HIDDEN' };
}
