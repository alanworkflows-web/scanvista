export function safeFormatTime(dateVal: any, fallback: string = "Just now"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return fallback;
  }
}

export function safeFormatDate(dateVal: any, fallback: string = "—"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return fallback;
  }
}

export function safeFormatDateTime(dateVal: any, fallback: string = "—"): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return fallback;
  }
}
